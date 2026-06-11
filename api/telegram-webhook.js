// Endpoint Telegram nhận update từ Bot Đậu khi học viên /start với deep link.
// Setup: gọi 1 lần
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://project-fa985.vercel.app/api/telegram-webhook
//
// Flow:
//   1. Học viên click link `https://t.me/dau_elsaphuong_bot?start=EP000001` từ email
//   2. Telegram mở chat với bot, tự gửi `/start EP000001`
//   3. Telegram POST update vào endpoint này
//   4. Parse param EP000001 → lookup user trong Upstash → lưu chat_id
//   5. Bot trả lời chào học viên

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8660282994:AAHi4EWD-xzs-QnzGlc15MUH2fP2Bt3SAl8';

async function sendBotMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error('sendBotMessage error:', e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).end();

  try {
    const update = req.body || {};
    const msg = update.message;
    if (!msg || !msg.text) return res.status(200).json({ ok: true });

    const chatId = msg.chat.id;
    const text = msg.text.trim();
    const userName = msg.from?.first_name || msg.from?.username || 'chị em';

    // /start EP000001 → map học viên với chat_id
    const startMatch = text.match(/^\/start\s+(EP\d+)/i);
    if (startMatch) {
      const studentId = startMatch[1].toUpperCase();
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;

      // Lưu mapping chat_id → studentId
      const mapping = { chatId, studentId, linkedAt: new Date().toISOString(), telegramName: userName };
      await fetch(`${url}/set/tg_${studentId}/${encodeURIComponent(JSON.stringify(mapping))}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Reverse index: chat_id → studentId
      await fetch(`${url}/set/tg_chat_${chatId}/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Tìm tên thật của học viên trong user record (nếu có)
      let realName = userName;
      try {
        // Lookup theo studentId không có index direct — duyệt tạm bằng cách: studentId stored trong user_<email>
        // Vì không có index ngược, dùng tên Telegram tạm
      } catch (e) {}

      await sendBotMessage(chatId,
        `🌸 *Chào chị em ${userName}!*\n\n` +
        `Phương đã kết nối thành công tài khoản học \`${studentId}\` với Telegram của chị em.\n\n` +
        `Từ giờ Phương sẽ gửi nhắc nhở mỗi ngày:\n` +
        `• Khi bài học mới mở khoá\n` +
        `• Khi chị em chưa nộp bài trong ngày\n` +
        `• Khi có tin nhắn từ cộng đồng\n\n` +
        `Hẹn gặp chị em trong 21 ngày sắp tới ❤️\n\n` +
        `_~ Phương ~_`
      );

      // Báo Phương biết có học viên mới connect
      const phuongChatId = process.env.TELEGRAM_CHAT_ID || '7765161489';
      if (String(chatId) !== String(phuongChatId)) {
        await sendBotMessage(phuongChatId,
          `🔗 *Học viên kết nối Telegram*\n\n` +
          `Mã: \`${studentId}\`\n` +
          `Tên Telegram: ${userName}\n` +
          `Chat ID: \`${chatId}\``
        );
      }
      return res.status(200).json({ ok: true });
    }

    // /start trần (không có param) — hướng dẫn
    if (text === '/start' || text === '/help') {
      await sendBotMessage(chatId,
        `🌸 Chào chị em, Phương là Đậu — trợ lý của Elsa Phương.\n\n` +
        `Để kết nối tài khoản học, chị em vui lòng *bấm vào link trong email xác nhận đơn hàng* của Dáng Ngọc An Nhiên.\n\n` +
        `Nếu chưa có email, chị em có thể đăng ký tại: elsaphuong.com`
      );
      return res.status(200).json({ ok: true });
    }

    // Tin nhắn khác — placeholder phản hồi nhẹ
    await sendBotMessage(chatId,
      `🌷 Cảm ơn chị em đã nhắn. Phương sẽ đọc tin nhắn của chị em sớm nhất có thể.\n\n` +
      `Nếu cần hỗ trợ ngay, chị em nhắn Zalo cho Phương: zalo.me/0965050529`
    );

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('telegram-webhook error:', e);
    return res.status(200).json({ ok: false, error: e.message });
  }
}
