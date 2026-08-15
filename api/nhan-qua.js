// Endpoint nhận form "Nhận quà chào mừng" từ /nhan-qua/.
// POST body: { name, phone, email, city, age, job, vunboi[], suckhoe[], thaydoi, thoigian, source, nhangui }
// Flow:
//   1. Validate + chống trùng email (Upstash lead:{email})
//   2. Lưu Upstash: lead:{email} = full payload
//   3. Gửi email quà qua Resend (template Nam soạn)
//   4. Notify Phương qua Bot Đậu

import { notifyTelegram } from './_lib/notify-telegram.js';

const KV = {
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
};
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Elsa Phương <elsa.phongthai@gmail.com>';

async function kvGet(key) {
  const r = await fetch(`${KV.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV.token}` }
  });
  const j = await r.json();
  return j.result;
}
async function kvSet(key, value) {
  const r = await fetch(`${KV.url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  });
  return r.json();
}

function esc(s) {
  return String(s || '').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'amp;'})[c]);
}

function buildEmailHtml(name) {
  const zaloLink = 'https://zalo.me/g/ecq0oivwtdr2rxrr1mv9';
  const giftPageUrl = 'https://elsaphuong.com/da-nhan-qua/';
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#FFF9F5;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#4A3429;line-height:1.6">
<div style="max-width:600px;margin:0 auto;background:#fff;padding:0">
  <div style="background:linear-gradient(135deg,#FDECE3 0%,#FDD4B8 100%);padding:36px 24px;text-align:center">
    <div style="font-size:2.2rem;margin-bottom:6px">🌸</div>
    <h1 style="margin:0;color:#D81B60;font-size:22px;line-height:1.3">CHÚC MỪNG CHỊ EM ĐÃ ĐĂNG KÝ NHẬN QUÀ THÀNH CÔNG!</h1>
  </div>

  <div style="padding:28px 26px 20px">
    <p style="margin:0 0 14px;font-size:16px">Thương chào <b>${esc(name)}</b>,</p>
    <p style="margin:0 0 20px;font-size:15px">Cảm ơn Chị Em đã dành thời gian chia sẻ thông tin cùng Phương.</p>
    <p style="margin:0 0 8px;font-size:15px">Chị nhận hai món quà tại đây:</p>
  </div>

  <!-- QUÀ 1 -->
  <div style="margin:0 26px 16px;background:#FFF9F5;border-left:4px solid #D81B60;border-radius:10px;padding:20px 22px">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#D81B60;font-weight:700;margin-bottom:6px">🎁 Quà tặng 1</div>
    <div style="font-size:16px;font-weight:700;color:#4A3429;line-height:1.35;margin-bottom:10px">
      Cẩm nang "5 Phương Pháp Giúp Phụ Nữ Vững Vàng, Bình An Trước Nghịch Cảnh"
    </div>
    <div style="background:#fff;border:1px dashed #D81B60;border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:14px">
      🔑 Yêu cầu mật khẩu: <b style="background:#D81B60;color:#fff;padding:2px 8px;border-radius:4px;font-family:monospace">1111</b>
    </div>
    <a href="${giftPageUrl}" style="display:inline-block;background:linear-gradient(135deg,#D81B60,#AD1457);color:#fff;text-decoration:none;padding:10px 22px;border-radius:22px;font-weight:700;font-size:14px">📖 Nhận cẩm nang →</a>
  </div>

  <!-- QUÀ 2 -->
  <div style="margin:0 26px 22px;background:#FFF9F5;border-left:4px solid #D81B60;border-radius:10px;padding:20px 22px">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#D81B60;font-weight:700;margin-bottom:6px">🎁 Quà tặng 2</div>
    <div style="font-size:16px;font-weight:700;color:#4A3429;line-height:1.35;margin-bottom:10px">
      Bộ "3 Bài Tập Dưỡng Sức Khỏe Từ Gốc"
    </div>
    <div style="background:#fff;border:1px dashed #D81B60;border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:14px">
      🔑 Yêu cầu mật khẩu: <b style="background:#D81B60;color:#fff;padding:2px 8px;border-radius:4px;font-family:monospace">1111</b>
    </div>
    <a href="${giftPageUrl}" style="display:inline-block;background:linear-gradient(135deg,#D81B60,#AD1457);color:#fff;text-decoration:none;padding:10px 22px;border-radius:22px;font-weight:700;font-size:14px">🧘‍♀️ Xem 3 bài tập →</a>
  </div>

  <div style="padding:0 26px 24px;font-size:15px">
    <p style="margin:0 0 16px">Chị Em lưu lại và thực hành mỗi ngày nhé!</p>
    <p style="margin:0 0 18px">Phương chúc chị ngày càng khỏe đẹp và giàu toàn diện từ bên trong. ❤️</p>

    <p style="margin:0 0 4px">Thương mến,</p>
    <p style="margin:0;font-family:'Brush Script MT',cursive;font-size:22px;color:#D81B60">Elsa Phương</p>
  </div>

  <div style="background:#0068FF;color:#fff;text-align:center;padding:16px 20px;font-size:14px">
    <div style="margin-bottom:6px">💬 Chưa vào nhóm Zalo cộng đồng?</div>
    <a href="${zaloLink}" style="color:#fff;text-decoration:underline;font-weight:600">Tham gia ngay →</a>
  </div>

  <div style="background:#4A3429;color:#F5E6DA;text-align:center;padding:20px;font-size:12px">
    <div style="font-family:Georgia,serif;font-size:15px;color:#fff;margin-bottom:4px">Elsa Phương</div>
    <div style="opacity:.65">Khỏe đẹp bền vững · Tâm an từ nội lực</div>
    <div style="opacity:.5;margin-top:8px">© 2026 · Liên hệ: 0965 05 05 29</div>
  </div>
</div>
</body></html>`;
}

async function sendResend(to, name) {
  if (!RESEND_KEY) return { skipped: 'no_resend_key' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: '🌸 Quà tặng chào mừng chị em vào cộng đồng Phụ Nữ Khỏe Đẹp Giàu Toàn Diện',
      html: buildEmailHtml(name)
    })
  });
  return r.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'method_not_allowed' });

  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const phone = String(b.phone || '').trim();

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, error: 'missing_required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'invalid_email' });
    }

    const key = `lead:${email}`;
    const existing = await kvGet(key);
    if (existing) {
      return res.status(200).json({ success: false, error: 'duplicate' });
    }

    const payload = {
      name, email, phone,
      city: b.city || '',
      age: b.age || '',
      job: b.job || '',
      vunboi: Array.isArray(b.vunboi) ? b.vunboi : (b.vunboi ? [b.vunboi] : []),
      suckhoe: Array.isArray(b.suckhoe) ? b.suckhoe : (b.suckhoe ? [b.suckhoe] : []),
      thaydoi: b.thaydoi || '',
      thoigian: b.thoigian || '',
      source: b.source || '',
      nhangui: b.nhangui || '',
      created_at: new Date().toISOString(),
      email_sent: false
    };

    await kvSet(key, JSON.stringify(payload));

    // Fire-and-forget email + telegram, không block response
    const emailPromise = sendResend(email, name).then(r => {
      if (r && r.id) {
        kvSet(key, JSON.stringify({ ...payload, email_sent: true, email_id: r.id }));
      }
      return r;
    }).catch(e => console.error('resend err:', e));

    const tgMsg = [
      '🎁 *LEAD MỚI — Nhận quà chào mừng*',
      '',
      `👤 *${name}*`,
      `📧 ${email}`,
      `📱 ${phone} (Zalo)`,
      `📍 ${payload.city} · ${payload.age}`,
      `💼 ${payload.job}`,
      `⏱ Có ${payload.thoigian}/ngày`,
      `🔗 Nguồn: ${payload.source}`,
      '',
      `_Mong vun bồi:_ ${payload.vunboi.slice(0,3).join(', ')}${payload.vunboi.length>3?'...':''}`,
      `_Quan tâm SK:_ ${payload.suckhoe.slice(0,3).join(', ')}${payload.suckhoe.length>3?'...':''}`,
      '',
      `_"${payload.thaydoi.slice(0,200)}"_`
    ].join('\n');

    const tgPromise = notifyTelegram(tgMsg).catch(e => console.error('tg err:', e));

    await Promise.allSettled([emailPromise, tgPromise]);

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('nhan-qua error:', e);
    return res.status(500).json({ success: false, error: 'server_error', message: e.message });
  }
}
