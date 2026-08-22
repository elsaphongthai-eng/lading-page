// Email đăng ký (chưa paid) cho Gội Đầu Thông Khí — Cá Nhân 399K & Dịch Vụ 999K.
// Amount + name lấy từ body (do IPN/save-data truyền theo product config).
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BANK_ACCOUNT = '0945461368';
const BANK_NAME = 'MB';
const ACCOUNT_NAME_DISPLAY = 'DANG THI THANH PHUONG';
const PAYMENT_URL = 'https://elsaphuong.com/thanh-toan-goi-dau/';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, name, code, amount, product } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Thiếu email hoặc code' });

  const displayName = name || 'chị em';
  const productName = product || 'Gội Đầu Thông Khí';
  const amt = Number(amount) || 399000;

  const qrUrl = `https://img.vietqr.io/image/${BANK_NAME}-${BANK_ACCOUNT}-compact2.png` +
    `?amount=${amt}` +
    `&addInfo=${encodeURIComponent(code)}` +
    `&accountName=${encodeURIComponent(ACCOUNT_NAME_DISPLAY)}`;

  try {
    await resend.emails.send({
      from: 'Elsa Phương <phuong@elsaphuong.com>',
      to: email,
      subject: '🌿 Chúc mừng chị em đã đăng ký ' + productName,
      html: `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;padding:32px 24px;color:#2E3D2F;line-height:1.7;">

  <h2 style="color:#B93A5A;font-size:22px;margin:0 0 18px;">Chị em ${displayName} thân mến,</h2>

  <p>Phương vừa nhận được đăng ký <strong>${productName}</strong> của chị em.</p>

  <p style="font-style:italic;color:#3F5340;">Trong hệ sinh thái <strong>Khỏe Đẹp Từ Gốc</strong>, "Gội Đầu Thông Khí" không chỉ là một liệu trình chăm sóc mái tóc — mà là nghi thức để chị em kết nối lại với cơ thể mình, thư giãn hệ thần kinh và khai thông năng lượng bị tắc nghẽn.</p>

  <p style="background:#FBF5E7;border-left:4px solid #B93A5A;padding:14px 18px;border-radius:8px;font-style:italic;color:#3F5340;">
    Khỏe đẹp bắt đầu từ gốc — từ sợi tóc, đến hơi thở, đến sự yên bình bên trong.
  </p>

  <hr style="border:none;border-top:1px solid #E8DDBE;margin:28px 0;">

  <h3 style="color:#B93A5A;font-size:18px;margin:0 0 12px;">💳 Hoàn tất thanh toán để chính thức tham gia</h3>

  <p>Chị em quét mã QR bên dưới để chuyển khoản. Hệ thống sẽ tự xác nhận trong vài giây.</p>

  <div style="background:#fff;border:2px dashed #B93A5A;border-radius:14px;padding:22px;margin:20px 0;text-align:center;">
    <img src="${qrUrl}" alt="QR thanh toán ${amt.toLocaleString('vi-VN')}đ" width="260" style="display:block;margin:0 auto 14px;border-radius:10px;">
    <p style="margin:6px 0;font-size:14px;color:#2E3D2F;"><strong>Ngân hàng:</strong> ${BANK_NAME} Bank</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Số tài khoản:</strong> ${BANK_ACCOUNT}</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Chủ tài khoản:</strong> Đặng Thị Thanh Phương</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Số tiền:</strong> <span style="color:#B93A5A;font-size:18px;font-weight:700;">${amt.toLocaleString('vi-VN')}đ</span></p>
    <p style="margin:6px 0;font-size:14px;"><strong>Nội dung CK:</strong> <span style="color:#B93A5A;font-family:'Courier New',monospace;font-weight:700;letter-spacing:1px;">${code}</span></p>
    <p style="margin:14px 0 6px;font-size:12px;color:#3F5340;font-style:italic;">Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự xác nhận.</p>
  </div>

  <p style="text-align:center;margin:24px 0;">
    <a href="${PAYMENT_URL}"
       style="background:#2E3D2F;color:#fff;padding:14px 36px;border-radius:40px;text-decoration:none;font-weight:700;display:inline-block;">
      👉 Mở lại trang thanh toán
    </a>
  </p>

  <p>Sau khi thanh toán thành công, chị em sẽ nhận được <strong>tài khoản đăng nhập</strong> để bắt đầu học ngay.</p>

  <hr style="border:none;border-top:1px solid #E8DDBE;margin:28px 0;">

  <p style="text-align:center;margin-top:18px;">
    <strong style="font-size:16px;color:#B93A5A;">Elsa Phương</strong><br>
    <span style="font-family:'Brush Script MT',cursive;color:#3F5340;font-size:14px;">KHỎE ĐẸP TỪ GỐC</span><br>
    <span style="font-size:12px;color:#3F5340;font-style:italic;">Chăm sóc từ sợi tóc đến thân tâm.</span>
  </p>

  <p style="color:#3F5340;font-size:12px;margin-top:24px;text-align:center;">
    Đây là email tự động xác nhận đăng ký. Mọi câu hỏi xin nhắn Phương qua Zalo: 0965050529.<br>
    Elsa Phương · Khỏe Đẹp Từ Gốc · elsaphuong.com
  </p>
</div>`
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi gửi email đăng ký goi-dau:', error);
    return res.status(500).json({ error: error.message });
  }
}
