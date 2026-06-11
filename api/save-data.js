// Save customer / order vào Upstash. Khi có customer mới:
//   - code DNAN... (Dáng Ngọc An Nhiên 799K): gọi send-registration-email + Telegram báo Phương
//   - khác:                                    giữ flow cũ (send-email.js Chạm Hành Trình)
import { notifyTelegram, vnd } from './_lib/notify-telegram.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { key, value } = req.body;
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    let data;
    if (key === 'products') {
      data = `${value.name}|${value.price}|${value.description}`;
    } else {
      data = JSON.stringify(value);
    }

    await fetch(`${url}/lpush/${key}/${encodeURIComponent(data)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Khi có customer mới → gửi email đăng ký + báo Telegram
    if (key === 'customers' && value.email) {
      const baseUrl = 'https://project-fa985.vercel.app';
      const isDangNgoc = value.code && /^DNAN/i.test(value.code);

      if (isDangNgoc) {
        // ===== GÓI 799K — DÁNG NGỌC AN NHIÊN =====
        // 1. Email "Chúc mừng đã đăng ký" (chưa paid)
        try {
          await fetch(`${baseUrl}/api/send-registration-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: value.email,
              name: value.name,
              code: value.code,
              phone: value.phone || ''
            })
          });
        } catch (e) { console.error('send-registration-email error:', e); }

        // 2. Telegram báo Phương — có đơn đăng ký mới
        try {
          const tgMsg =
            '✨ *Đơn đăng ký mới — Dáng Ngọc An Nhiên*\n\n' +
            '*Tên:* ' + (value.name || '—') + '\n' +
            '*Email:* ' + value.email + '\n' +
            '*SĐT:* ' + (value.phone || '—') + '\n' +
            '*Mã đơn:* `' + value.code + '`\n' +
            '*Số tiền:* ' + vnd(799000) + '\n' +
            '*Trạng thái:* Chờ chuyển khoản\n' +
            '*Thời gian:* ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          await notifyTelegram(tgMsg);
        } catch (e) { console.error('telegram registration error:', e); }
      } else {
        // ===== Gói cũ (Chạm Hành Trình) — flow legacy =====
        const isTest = value.email.includes('+test');
        try {
          await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: value.email, name: value.name, emailNumber: 1 })
          });
          if (isTest) {
            await fetch(`${baseUrl}/api/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: value.email, name: value.name, emailNumber: 2 })
            });
            await fetch(`${baseUrl}/api/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: value.email, name: value.name, emailNumber: 3 })
            });
          }
        } catch (e) { console.error('legacy send-email error:', e); }
      }
    }

    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
