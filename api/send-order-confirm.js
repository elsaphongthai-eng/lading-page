import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, code, amount, product } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Thiếu email' });
  }

  try {
    await resend.emails.send({
      from: 'Elsa Phương <phuong@elsaphuong.com>',
      to: email,
      subject: '🌸 Xác nhận đơn hàng — Chạm Hành Trình Vươn Mình Rực Rỡ',
      html: `
        <p>Chào ${name},</p>
        <p>Phương xác nhận đã nhận được đơn hàng của Bạn. Cảm ơn Bạn rất nhiều!</p>
        <hr>
        <p><strong>Chi tiết đơn hàng:</strong></p>
        <p>🌸 Sản phẩm: ${product}</p>
        <p>🧾 Mã đơn: ${code}</p>
        <p>💰 Số tiền: ${Number(amount).toLocaleString('vi-VN')}đ</p>
        <hr>
        <p><strong>Bước tiếp theo:</strong></p>
        <p>Bạn nhấn vào nút bên dưới để tham gia nhóm Zalo và điền thông tin để được duyệt vào nhé!</p>
        <p style="text-align:center; margin: 24px 0;">
          <a href="https://zalo.me/g/5n6zo95sbdsxrztzzdml" 
             style="background:#0068FF; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:16px;">
            💬 Tham gia nhóm Zalo ngay
          </a>
        </p>
        <hr>
        <p style="color:#888; font-size:13px;">⚠️ Đây là email hệ thống, vui lòng không trả lời. Nếu có bất kỳ câu hỏi nào, vui lòng nhắn cho Phương qua:</p>
        <p style="text-align:center; margin: 16px 0;">
          <a href="https://zalo.me/0945461368"
             style="background:#0068FF; color:white; padding:10px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
            💬 Nhắn Zalo cho Phương
          </a>
        </p>
        <hr>
        <p>Hẹn gặp Bạn trong hành trình 🌸</p>
        <p>From Phương with love 🌸<br>Elsa Phương</p>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi gửi email xác nhận:', error);
    return res.status(500).json({ error: error.message });
  }
}