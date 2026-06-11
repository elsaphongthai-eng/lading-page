// Helper gửi tin nhắn riêng cho 1 học viên theo studentId.
// Yêu cầu: học viên đã /start với bot qua deep link (chat_id đã lưu vào Upstash).
import { notifyTelegram } from './notify-telegram.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8660282994:AAHi4EWD-xzs-QnzGlc15MUH2fP2Bt3SAl8';

export async function notifyStudent(studentId, text) {
  if (!studentId) return { ok: false, reason: 'no_student_id' };

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  try {
    const res = await fetch(`${url}/get/tg_${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.result) {
      console.warn('[notifyStudent] chưa có chat_id cho', studentId);
      return { ok: false, reason: 'not_linked' };
    }
    const mapping = JSON.parse(data.result);
    const chatId = mapping.chatId;

    const sendRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true })
    });
    const sendData = await sendRes.json();
    return sendData;
  } catch (e) {
    console.error('[notifyStudent] error:', e);
    return { ok: false, error: e.message };
  }
}
