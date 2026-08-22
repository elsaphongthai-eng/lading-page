// Webhook IPN từ SePay — CONFIG-DRIVEN.
// Đọc product từ prefix orderCode qua _lib/products.js.
// createStudent=true → sinh EP + password sau khi paid.

import { notifyTelegram, vnd } from './_lib/notify-telegram.js';
import { CODE_REGEX, productFromCodeAndAmount } from './_lib/products.js';
import { sendGoiDauConfirmEmail } from './_lib/emails-goi-dau.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('IPN received:', req.body);

  const body = req.body;
  const content = body.transaction_content || body.content || body.description || '';
  const amount = parseInt(body.transferAmount || body.amount_in || body.amount || 0);
  const match = content.match(CODE_REGEX);
  console.log('content:', content, 'amount:', amount, 'match:', match);

  if (!match || amount < 1000) {
    return res.status(200).json({ success: true, skipped: 'no_match' });
  }

  const orderCode = match[0].toUpperCase();
  const product = productFromCodeAndAmount(orderCode, amount);
  if (!product) {
    console.warn('No product config for orderCode:', orderCode);
    return res.status(200).json({ success: true, skipped: 'unknown_product' });
  }
  console.log('Product matched:', product.name, '| amount:', amount);

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // Idempotent: order_${code} = paid
  await fetch(`${url}/set/order_${orderCode}/paid`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  await fetch(`${url}/lpush/orders/${encodeURIComponent(JSON.stringify({
    code: orderCode, amount, content, product: product.name,
    time: new Date().toISOString(), status: 'paid'
  }))}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  try {
    // Look up customer
    const customersRes = await fetch(`${url}/lrange/customers/0/500`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customersData = await customersRes.json();
    const customers = (customersData.result || []).map(c => {
      try { return JSON.parse(c); } catch { return null; }
    }).filter(Boolean);
    const customer = customers.find(c => c.code && c.code.toUpperCase() === orderCode);
    console.log('Customer found:', customer);

    if (!customer || !customer.email) {
      return res.status(200).json({ success: true, warn: 'no_customer' });
    }

    // Sinh EP student nếu product cần
    let studentId = null, password = null;
    if (product.createStudent) {
      try {
        const existingRes = await fetch(`${url}/get/user_${encodeURIComponent(customer.email.toLowerCase())}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const existingData = await existingRes.json();
        if (existingData.result) {
          const existing = JSON.parse(existingData.result);
          studentId = existing.studentId;
          password = existing.password;
          // Append course nếu chưa có
          const enrolled = new Set(existing.enrolled_courses || [product.slug]);
          enrolled.add(product.slug);
          existing.enrolled_courses = [...enrolled];
          existing.last_paid_order = orderCode;
          await fetch(`${url}/set/user_${encodeURIComponent(customer.email.toLowerCase())}/${encodeURIComponent(JSON.stringify(existing))}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User đã tồn tại, thêm course:', product.slug);
        } else {
          const incrRes = await fetch(`${url}/incr/student_count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const incrData = await incrRes.json();
          studentId = 'EP' + String(incrData.result).padStart(6, '0');
          password = studentId;
          const userRecord = {
            studentId, password,
            email: customer.email.toLowerCase(),
            name: customer.name || '',
            phone: customer.phone || '',
            orderCode,
            enrolled_courses: [product.slug],
            ngay_tham_gia: new Date().toISOString().slice(0, 10),
            status: 'active'
          };
          await fetch(`${url}/set/user_${encodeURIComponent(customer.email.toLowerCase())}/${encodeURIComponent(JSON.stringify(userRecord))}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Created student:', studentId);
        }
      } catch (e) { console.error('student creation error:', e); }
    }

    // Gửi email confirm — 2 route:
    //  - emailModule='goi-dau' → import _lib module (không tốn function slot)
    //  - sendConfirmEmail=<endpoint> → HTTP call endpoint cũ (legacy)
    const payload = {
      email: customer.email, name: customer.name, code: orderCode,
      amount, product: product.name, slug: product.slug, studentId, password
    };
    if (product.emailModule === 'goi-dau') {
      try {
        const r = await sendGoiDauConfirmEmail(payload);
        console.log('Sent goi-dau confirm:', r?.id || r);
      } catch (e) { console.error('goi-dau email err:', e); }
    } else if (product.sendConfirmEmail) {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const response = await fetch(`https://${host}/api/${product.sendConfirmEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('Sent confirm email:', product.sendConfirmEmail, '| status:', response.status);
    }

    // Telegram Phương — mọi gói createStudent (không spam legacy CHAM)
    if (product.createStudent) {
      const tgMsg =
        '🌸 *Đơn ' + product.telegramLabel + ' đã thanh toán*\n\n' +
        '*Mã học viên:* `' + (studentId || '?') + '`\n' +
        '*Tên:* ' + (customer.name || '—') + '\n' +
        '*Email:* ' + customer.email + '\n' +
        '*SĐT:* ' + (customer.phone || '—') + '\n' +
        '*Mã đơn:* `' + orderCode + '`\n' +
        '*Số tiền:* ' + vnd(amount) + '\n' +
        '*Thời gian:* ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      await notifyTelegram(tgMsg);
    }
  } catch (e) {
    console.error('Error in paid flow:', e);
  }

  return res.status(200).json({ success: true });
}
