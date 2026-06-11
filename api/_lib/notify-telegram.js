// Helper gửi tin nhắn Telegram qua Bot Đậu (@dau_elsaphuong_bot)
// Nam phải set 2 env vars trên Vercel:
//   TELEGRAM_BOT_TOKEN  — chuỗi 8660282994:AAH...
//   TELEGRAM_CHAT_ID    — số 7765161489
// Nếu thiếu env → log + skip (không crash IPN flow).

export async function notifyTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('[telegram] missing env TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID — skip');
    return { ok: false, reason: 'missing_env' };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    const data = await res.json();
    if (!data.ok) console.warn('[telegram] send failed:', data.description);
    return data;
  } catch (e) {
    console.error('[telegram] error:', e.message);
    return { ok: false, error: e.message };
  }
}

// Format tiền VN
export function vnd(n) {
  return Number(n || 0).toLocaleString('vi-VN') + 'đ';
}
