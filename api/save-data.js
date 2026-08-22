// Save customer/order Upstash. Khi customer mới có code khớp product config:
//   - Gọi endpoint đăng ký (sendRegEmail) — email chờ chuyển khoản với QR
//   - Notify Telegram Phương
// Product-agnostic — thêm khoá mới chỉ cần update _lib/products.js.

import { notifyTelegram, vnd } from './_lib/notify-telegram.js';
import { productFromCode } from './_lib/products.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { key, value } = req.body;
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    let data;
    if (key === 'products') data = `${value.name}|${value.price}|${value.description}`;
    else data = JSON.stringify(value);

    await fetch(`${url}/lpush/${key}/${encodeURIComponent(data)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (key === 'customers' && value.email && value.code) {
      const baseUrl = 'https://project-fa985.vercel.app';
      const product = productFromCode(value.code);

      if (product && product.sendRegEmail) {
        // ===== Product config-driven =====
        try {
          await fetch(`${baseUrl}/api/${product.sendRegEmail}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: value.email,
              name: value.name,
              code: value.code,
              phone: value.phone || '',
              amount: product.amount,
              product: product.name,
              slug: product.slug
            })
          });
        } catch (e) { console.error('send reg email error:', e); }

        try {
          const tgMsg =
            '✨ *Đơn đăng ký mới — ' + product.telegramLabel + '*\n\n' +
            '*Tên:* ' + (value.name || '—') + '\n' +
            '*Email:* ' + value.email + '\n' +
            '*SĐT:* ' + (value.phone || '—') + '\n' +
            '*Mã đơn:* `' + value.code + '`\n' +
            '*Số tiền:* ' + vnd(product.amount) + '\n' +
            '*Trạng thái:* Chờ chuyển khoản\n' +
            '*Thời gian:* ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          await notifyTelegram(tgMsg);
        } catch (e) { console.error('telegram reg error:', e); }
      } else if (!product) {
        // ===== Không match product nào — luồng legacy Chạm Hành Trình =====
        const isTest = value.email.includes('+test');
        try {
          await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: value.email, name: value.name, emailNumber: 1 })
          });
          if (isTest) {
            for (const n of [2, 3]) {
              await fetch(`${baseUrl}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: value.email, name: value.name, emailNumber: n })
              });
            }
          }
        } catch (e) { console.error('legacy email error:', e); }
      }
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
