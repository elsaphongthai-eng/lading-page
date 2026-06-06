// Email xác nhận đơn hàng cho Khoá 21 Ngày Dáng Ngọc An Nhiên (799K).
// Gọi từ api/ipn.js sau khi SePay xác nhận đã nhận tiền.
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, code, amount, product } = req.body;
  if (!email) return res.status(400).json({ error: 'Thiếu email' });

  const productName = product || 'Khoá 21 Ngày Dáng Ngọc An Nhiên';
  const greetingName = name || 'chị em';

  try {
    await resend.emails.send({
      from: 'Elsa Phương <phuong@elsaphuong.com>',
      to: email,
      subject: '🌸 Phương đã nhận được tin của chị — Khoá 21 Ngày Dáng Ngọc An Nhiên',
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 620px; margin: 0 auto; padding: 32px 24px; color: #4A3429; line-height: 1.7;">
          <p style="font-family: 'Brush Script MT', cursive; color: #D81B60; font-size: 22px; margin-bottom: 6px;">cảm ơn chị thật nhiều</p>
          <h2 style="color: #D81B60; font-size: 24px; margin: 0 0 18px;">Phương xác nhận đã nhận được đơn của chị</h2>

          <p>Chào ${greetingName},</p>
          <p>Phương rất xúc động khi chị chọn đi cùng Phương trên hành trình 21 ngày này. Đây là email xác nhận đơn hàng của chị.</p>

          <div style="background:#FCE4EC; border-radius:12px; padding:16px 20px; margin:22px 0;">
            <p style="margin:0 0 6px;"><strong>Chi tiết đơn hàng</strong></p>
            <p style="margin:4px 0;">🌸 Sản phẩm: <strong>${productName}</strong></p>
            <p style="margin:4px 0;">🧾 Mã đơn: <strong>${code}</strong></p>
            <p style="margin:4px 0;">💰 Số tiền: <strong>${Number(amount).toLocaleString('vi-VN')}đ</strong></p>
          </div>

          <p><strong>Bước tiếp theo:</strong></p>
          <ul style="padding-left: 22px;">
            <li>Trong vài giờ tới, Phương sẽ gửi cho chị một email riêng kèm <strong>link nhóm đồng hành</strong>, lịch khai giảng và hướng dẫn chi tiết.</li>
            <li>Chị nhớ kiểm tra hộp thư <em>Spam / Quảng cáo</em> giúp Phương nhé, đôi khi email lạc vào đó.</li>
            <li>Nếu chị có bất kỳ câu hỏi nào, cứ nhắn Zalo cho Phương.</li>
          </ul>

          <p style="text-align:center; margin:28px 0;">
            <a href="https://zalo.me/0945461368"
               style="background:#0068FF; color:#fff; padding:12px 28px; border-radius:40px; text-decoration:none; font-weight:600; display:inline-block;">
              💬 Nhắn Zalo cho Phương
            </a>
          </p>

          <hr style="border:none; border-top:1px solid #FCE4EC; margin:28px 0;">

          <p style="font-family:'Brush Script MT', cursive; font-size:20px; color:#D81B60; text-align:center; margin-top:24px;">
            Hẹn gặp chị trong 21 ngày tới<br>~ Phương ~
          </p>

          <p style="color:#8B6F5C; font-size:12px; margin-top:24px; text-align:center;">
            Đây là email tự động xác nhận đơn hàng. Mọi câu hỏi xin nhắn Phương qua Zalo ở trên.<br>
            Elsa Phương · Dáng Ngọc An Nhiên · elsaphuong.com
          </p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi gửi email xác nhận 21ngay-dangngoc:', error);
    return res.status(500).json({ error: error.message });
  }
}
