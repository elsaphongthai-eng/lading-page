// Endpoint kích hoạt khoá học cho học viên.
// POST { email } → set user.activated_at = now ISO. Idempotent (chỉ set 1 lần).
// Báo Phương qua Telegram khi học viên kích hoạt.
import { notifyTelegram } from './_lib/notify-telegram.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'method_not_allowed' });

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: 'missing_email' });

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const key = `user_${encodeURIComponent(String(email).trim().toLowerCase())}`;

    const userRes = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = await userRes.json();
    if (!userData.result) return res.status(404).json({ success: false, error: 'user_not_found' });

    let user;
    try { user = JSON.parse(userData.result); }
    catch { return res.status(500).json({ success: false, error: 'corrupted_record' }); }

    // Idempotent — nếu đã kích hoạt thì return luôn
    if (user.activated_at) {
      return res.status(200).json({
        success: true,
        activated_at: user.activated_at,
        already: true
      });
    }

    const nowISO = new Date().toISOString();
    user.activated_at = nowISO;

    await fetch(`${url}/set/${key}/${encodeURIComponent(JSON.stringify(user))}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Báo Phương qua Bot Đậu
    try {
      await notifyTelegram(
        '🌸 *Học viên kích hoạt khoá học*\n\n' +
        '*Mã học viên:* `' + (user.studentId || '?') + '`\n' +
        '*Tên:* ' + (user.name || '—') + '\n' +
        '*Email:* ' + user.email + '\n' +
        '*Bắt đầu lúc:* ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + '\n\n' +
        '_Hành trình 21 ngày của chị em chính thức bắt đầu._'
      );
    } catch (e) { console.error('telegram notify activate:', e); }

    return res.status(200).json({ success: true, activated_at: nowISO });
  } catch (e) {
    console.error('activate-course error:', e);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
}
