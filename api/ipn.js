// Webhook IPN từ SePay. Phân biệt gói theo SỐ TIỀN:
//   amount >= 750000 && amount < 900000  -> Khoá 21 Ngày Dáng Ngọc An Nhiên (799K)
//   else                                 -> Chạm Hành Trình Vươn Mình Rực Rỡ (990K, mặc định cũ)
// Mã đơn: hỗ trợ cả tiền tố CHAM (cũ) và DNAN (Dáng Ngọc An Nhiên, mới).
//
// 799K paid → sinh Student ID (EP000001+) → password = studentId → lưu user_<email> Upstash → email kèm credentials + Telegram báo Phương.

import { notifyTelegram, vnd } from './_lib/notify-telegram.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('IPN received:', req.body);

  const body = req.body;
  const content = body.transaction_content || body.content || body.description || '';
  const amount = parseInt(body.transferAmount || body.amount_in || body.amount || 0);
  const match = content.match(/(?:CHAM|DNAN)[A-Z0-9]+/i);
  console.log('content:', content, 'amount:', amount, 'match:', match);

  if (match && amount >= 1000) {
    const orderCode = match[0].toUpperCase();
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    // Lưu trạng thái thanh toán
    await fetch(`${url}/set/order_${orderCode}/paid`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Lưu đơn hàng vào danh sách
    const order = {
      code: orderCode,
      amount,
      content,
      time: new Date().toISOString(),
      status: 'paid'
    };

    await fetch(`${url}/lpush/orders/${JSON.stringify(order)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Saved order:', orderCode);

    // Tìm thông tin khách hàng
    try {
      const customersRes = await fetch(`${url}/lrange/customers/0/200`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const customersData = await customersRes.json();
      const customers = (customersData.result || []).map(c => {
        try { return JSON.parse(c); } catch { return null; }
      }).filter(Boolean);

      const customer = customers.find(c => c.code && c.code.toUpperCase() === orderCode);
      console.log('Customer found:', customer);

      if (customer && customer.email) {
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const protocol = 'https';

        const is799k = amount >= 750000 && amount < 900000;
        const endpoint  = is799k ? 'send-order-confirm-21ngay-dangngoc' : 'send-order-confirm';
        const product   = is799k ? 'Khoá 21 Ngày Dáng Ngọc An Nhiên' : 'Chạm Hành Trình Vươn Mình Rực Rỡ';
        console.log('Payment type:', is799k ? '799K (Dáng Ngọc An Nhiên)' : '990K (Chạm Hành Trình)', '| amount:', amount);

        // ===== 799K: sinh Student ID + password (= studentId) + lưu user record =====
        let studentId = null, password = null;
        if (is799k) {
          try {
            // Idempotent — webhook có thể retry
            const existingRes = await fetch(`${url}/get/user_${encodeURIComponent(customer.email.toLowerCase())}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existingData = await existingRes.json();
            if (existingData.result) {
              const existing = JSON.parse(existingData.result);
              studentId = existing.studentId;
              password = existing.password;
              console.log('User record đã tồn tại, dùng lại:', studentId);
            } else {
              // INCR atomic
              const incrRes = await fetch(`${url}/incr/student_count`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const incrData = await incrRes.json();
              const studentNum = incrData.result;
              studentId = 'EP' + String(studentNum).padStart(6, '0');
              password = studentId;

              const userRecord = {
                studentId,
                password,
                email: customer.email.toLowerCase(),
                name: customer.name || '',
                phone: customer.phone || '',
                orderCode,
                ngay_tham_gia: new Date().toISOString().slice(0, 10),
                status: 'active'
              };
              await fetch(`${url}/set/user_${encodeURIComponent(customer.email.toLowerCase())}/${encodeURIComponent(JSON.stringify(userRecord))}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('Created user record:', studentId);
            }
          } catch (e) {
            console.error('Error creating user record:', e);
          }
        }

        // Gọi endpoint email confirm
        const response = await fetch(`${protocol}://${host}/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customer.email,
            name: customer.name,
            code: orderCode,
            amount: amount,
            product: product,
            studentId,
            password
          })
        });
        console.log('Sent confirmation email to:', customer.email, '| status:', response.status);

        // Báo Telegram cho Phương — chỉ cho gói 799K (DNAN)
        if (is799k) {
          const tgMsg =
            '🌸 *Đơn 799K mới đã thanh toán*\n\n' +
            '*Mã học viên:* `' + (studentId || '?') + '`\n' +
            '*Tên:* ' + (customer.name || '—') + '\n' +
            '*Email:* ' + customer.email + '\n' +
            '*SĐT:* ' + (customer.phone || '—') + '\n' +
            '*Mã đơn:* `' + orderCode + '`\n' +
            '*Số tiền:* ' + vnd(amount) + '\n' +
            '*Thời gian:* ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          await notifyTelegram(tgMsg);
        }
      }
    } catch(e) {
      console.error('Error in paid flow:', e);
    }
  }

  res.status(200).json({ success: true });
}
