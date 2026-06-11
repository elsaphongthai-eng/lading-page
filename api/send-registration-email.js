// Email gửi khi khách đăng ký (chưa thanh toán) gói Dáng Ngọc An Nhiên 799K.
// Có QR thanh toán embed trực tiếp trong email.
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BANK_ACCOUNT = '0945461368';
const BANK_NAME = 'MB';
const AMOUNT = 799000;
const ACCOUNT_NAME_DISPLAY = 'DANG THI THANH PHUONG';
const PAYMENT_URL = 'https://elsaphuong.com/thanh-toan-21ngay-dangngoc/';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Thiếu email hoặc code' });

  const displayName = name || 'chị em';

  // QR vietqr.io — embed link image trực tiếp trong email
  const qrUrl = `https://img.vietqr.io/image/${BANK_NAME}-${BANK_ACCOUNT}-compact2.png` +
    `?amount=${AMOUNT}` +
    `&addInfo=${encodeURIComponent(code)}` +
    `&accountName=${encodeURIComponent(ACCOUNT_NAME_DISPLAY)}`;

  try {
    await resend.emails.send({
      from: 'Elsa Phương <phuong@elsaphuong.com>',
      to: email,
      subject: '🌸 Chúc mừng Chị Em đã Đăng ký Dáng Ngọc An Nhiên 🌸',
      html: `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;padding:32px 24px;color:#4A3429;line-height:1.7;">

  <h2 style="color:#D81B60;font-size:22px;margin:0 0 18px;">Chị em ${displayName} thân mến,</h2>

  <p>Phương vừa nhận được thông tin đăng ký <strong>Challenge 21 Ngày Dáng Ngọc An Nhiên</strong> của chị em.</p>

  <p style="font-style:italic;color:#8B6F5C;">Và thật lòng mà nói…<br>Phương rất vui.</p>

  <p>Bởi giữa rất nhiều bộn bề của cuộc sống, giữa công việc, gia đình, con cái và hàng trăm điều cần lo mỗi ngày, chị em đã dành vài phút để điền thông tin đăng ký.</p>

  <p>Điều đó có nghĩa là ở đâu đó trong lòng mình, chị em vẫn còn mong muốn được <strong>khỏe hơn, đẹp hơn và yêu thương chính mình nhiều hơn</strong>.</p>

  <p style="background:#FCE4EC;border-left:4px solid #D81B60;padding:14px 18px;border-radius:8px;font-style:italic;">
    Khỏe đẹp không bắt đầu từ ngày mai.<br>
    Khỏe đẹp bắt đầu từ <strong>quyết định của ngày hôm nay</strong>.
  </p>

  <p>21 ngày tới không phải là hành trình ép cân, ép tập hay cố gắng gồng mình trở thành một ai khác. Đó là hành trình để chị em:</p>

  <ul style="padding-left:22px;color:#4A3429;">
    <li>✨ Kết nối lại với cơ thể mình</li>
    <li>✨ Học cách đứng, đi, thở và vận động đúng</li>
    <li>✨ Giảm căng cứng, giảm đau mỏi</li>
    <li>✨ Sở hữu vóc dáng mềm mại, nữ tính hơn</li>
    <li>✨ Tìm lại cảm giác yêu chính mình</li>
  </ul>

  <hr style="border:none;border-top:1px solid #FCE4EC;margin:28px 0;">

  <h3 style="color:#D81B60;font-size:18px;margin:0 0 12px;">💳 Hoàn tất thanh toán để chính thức tham gia</h3>

  <p>Chỗ của chị em đã được giữ lại. Chị em chỉ cần hoàn tất thanh toán theo mã QR bên dưới để chính thức bắt đầu hành trình cùng Phương và cộng đồng các chị em.</p>

  <div style="background:#fff;border:2px dashed #D81B60;border-radius:14px;padding:22px;margin:20px 0;text-align:center;">
    <img src="${qrUrl}" alt="QR thanh toán 799.000đ" width="260" style="display:block;margin:0 auto 14px;border-radius:10px;">
    <p style="margin:6px 0;font-size:14px;color:#4A3429;"><strong>Ngân hàng:</strong> ${BANK_NAME} Bank</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Số tài khoản:</strong> ${BANK_ACCOUNT}</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Chủ tài khoản:</strong> Đặng Thị Thanh Phương</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Số tiền:</strong> <span style="color:#D81B60;font-size:18px;font-weight:700;">${AMOUNT.toLocaleString('vi-VN')}đ</span></p>
    <p style="margin:6px 0;font-size:14px;"><strong>Nội dung CK:</strong> <span style="color:#D81B60;font-family:'Courier New',monospace;font-weight:700;letter-spacing:1px;">${code}</span></p>
    <p style="margin:14px 0 6px;font-size:12px;color:#8B6F5C;font-style:italic;">Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự xác nhận trong vài giây.</p>
  </div>

  <p style="text-align:center;margin:24px 0;">
    <a href="${PAYMENT_URL}"
       style="background:linear-gradient(90deg,#D81B60,#AD1457);color:#fff;padding:14px 36px;border-radius:40px;text-decoration:none;font-weight:700;display:inline-block;font-family:'Be Vietnam Pro',sans-serif;box-shadow:0 6px 22px rgba(216,27,96,.3);">
      👉 Mở trang thanh toán
    </a>
  </p>

  <p>Sau khi thanh toán thành công, chị em sẽ nhận được <strong>hướng dẫn tham gia nhóm Zalo</strong> và <strong>tài khoản đăng nhập</strong> để bắt đầu hành trình.</p>

  <hr style="border:none;border-top:1px solid #FCE4EC;margin:28px 0;">

  <p style="font-family:'Brush Script MT',cursive;font-size:20px;color:#D81B60;text-align:center;">
    Phương rất mong được đồng hành cùng chị trong 21 ngày sắp tới.<br>
    Thương gửi chị 🌷
  </p>

  <p style="text-align:center;margin-top:18px;">
    <strong style="font-size:16px;color:#D81B60;">Elsa Phương</strong><br>
    <span style="font-family:'Brush Script MT',cursive;color:#8B6F5C;font-size:14px;">DÁNG NGỌC AN NHIÊN</span><br>
    <span style="font-size:12px;color:#8B6F5C;font-style:italic;">Khỏe đẹp bền vững. Tâm an từ nội lực.</span>
  </p>

  <p style="color:#8B6F5C;font-size:12px;margin-top:24px;text-align:center;">
    Đây là email tự động xác nhận đăng ký. Mọi câu hỏi xin nhắn Phương qua Zalo: 0965050529.<br>
    Elsa Phương · Dáng Ngọc An Nhiên · elsaphuong.com
  </p>
</div>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi gửi email đăng ký:', error);
    return res.status(500).json({ error: error.message });
  }
}
