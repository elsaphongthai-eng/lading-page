// Email xác nhận đơn hàng cho Gội Đầu Thông Khí — sau khi paid.
// Kèm credentials studentId/password. Chung cho cả 2 gói CN/DV.
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const LINK_HOC = 'https://elsaphuong.com/khoahoc/';
const ZALO_PHUONG = 'https://zalo.me/0965050529';
const LINK_ZALO = process.env.LINK_ZALO_GOIDAU || '#';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, name, code, amount, product, studentId, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Thiếu email' });

  const displayName = name || 'chị em';
  const productName = product || 'Gội Đầu Thông Khí';
  const amt = Number(amount || 0);

  const zaloBlock = (LINK_ZALO && LINK_ZALO !== '#') ? `
    <p style="margin:8px 0;"><strong>👉 Link nhóm Zalo:</strong> <a href="${LINK_ZALO}" style="color:#0068FF;">${LINK_ZALO}</a></p>` :
    '<p style="color:#3F5340;font-style:italic;">💬 Link nhóm Zalo sẽ được Phương gửi bổ sung qua email sau ít hôm.</p>';

  const credentialsBlock = studentId ? `
    <h3 style="color:#B93A5A;font-size:18px;margin:28px 0 10px;">📚 Thông tin học viên — Vào học ngay</h3>
    <p>🌐 <strong>Link học:</strong> <a href="${LINK_HOC}" style="color:#B93A5A;">${LINK_HOC}</a></p>
    <div style="background:#FBF5E7;border:2px dashed #B93A5A;border-radius:12px;padding:18px 22px;margin:14px 0;">
      <p style="margin:6px 0 12px;font-family:Georgia,serif;font-size:14px;color:#3F5340;">Phương đã tạo tài khoản học cho chị em:</p>
      <p style="margin:8px 0;font-size:14px;">📧 Email đăng nhập: <strong style="color:#2E3D2F;">${email}</strong></p>
      <p style="margin:8px 0;font-size:14px;">🔐 Mã số học viên: <strong style="color:#B93A5A;font-size:18px;letter-spacing:2px;">${studentId}</strong></p>
      <p style="margin:10px 0 0;font-family:Georgia,serif;font-size:12px;color:#3F5340;font-style:italic;">(Mã số học viên cũng chính là mật khẩu)</p>
    </div>
    <p style="text-align:center;margin:18px 0;">
      <a href="${LINK_HOC}"
         style="background:linear-gradient(90deg,#B93A5A,#8E2946);color:#fff;padding:14px 36px;border-radius:40px;text-decoration:none;font-weight:700;display:inline-block;box-shadow:0 6px 22px rgba(185,58,90,.3);">
        → Vào học ngay
      </a>
    </p>` : '';

  try {
    await resend.emails.send({
      from: 'Elsa Phương <phuong@elsaphuong.com>',
      to: email,
      subject: '🎉 Chúc mừng chị em đã hoàn tất đăng ký ' + productName,
      html: `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;padding:32px 24px;color:#2E3D2F;line-height:1.7;">

  <h2 style="color:#B93A5A;font-size:22px;margin:0 0 18px;">Chị em ${displayName} thân mến,</h2>

  <p>Phương đã nhận được thanh toán của chị em. Từ giây phút này, chị em chính thức là học viên của <strong>${productName}</strong> — một chương trình trong hệ sinh thái <strong>Khỏe Đẹp Từ Gốc</strong>. 🌿</p>

  <p style="font-style:italic;color:#3F5340;">
    Cảm ơn chị em đã tin và chọn Phương đồng hành trong hành trình chăm sóc bản thân từ những điều nhỏ nhất — từ mái tóc, từ hơi thở, từ chính khoảng lặng của mình.
  </p>

  <div style="background:#FBF5E7;border-radius:12px;padding:14px 18px;margin:22px 0;font-size:14px;">
    <p style="margin:0 0 4px;"><strong>Chi tiết đơn hàng</strong></p>
    <p style="margin:3px 0;">🌿 Sản phẩm: <strong>${productName}</strong></p>
    <p style="margin:3px 0;">🧾 Mã đơn: <strong>${code}</strong></p>
    <p style="margin:3px 0;">💰 Số tiền: <strong>${amt.toLocaleString('vi-VN')}đ</strong></p>
  </div>

  <hr style="border:none;border-top:1px solid #E8DDBE;margin:28px 0;">

  <h3 style="color:#B93A5A;font-size:18px;margin:0 0 10px;">🌿 BƯỚC 1: THAM GIA CỘNG ĐỒNG ĐỒNG HÀNH</h3>
  <p style="margin:14px 0 6px;"><strong>Nhóm Zalo</strong></p>
  ${zaloBlock}
  <p style="color:#3F5340;font-style:italic;">Đây là nơi Phương gửi thông báo, chia sẻ tài liệu và giải đáp các thắc mắc trong quá trình học.</p>

  ${credentialsBlock}

  <hr style="border:none;border-top:1px solid #E8DDBE;margin:28px 0;">

  <p style="font-family:'Brush Script MT',cursive;font-size:20px;color:#B93A5A;text-align:center;">
    Phương rất mong được đồng hành cùng chị em.<br>
    Thương gửi chị 🌿
  </p>

  <p style="text-align:center;margin:24px 0 6px;">
    <a href="${ZALO_PHUONG}"
       style="background:#0068FF;color:#fff;padding:11px 26px;border-radius:40px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">
      💬 Nhắn Zalo cho Phương
    </a>
  </p>

  <p style="margin-top:24px;">Thương mến,</p>
  <p style="margin:6px 0;">
    <strong style="color:#B93A5A;font-size:16px;">Elsa Phương</strong><br>
    <span style="font-family:'Brush Script MT',cursive;color:#3F5340;font-size:14px;">KHỎE ĐẸP TỪ GỐC</span><br>
    <span style="font-size:12px;color:#3F5340;font-style:italic;">Chăm sóc từ sợi tóc đến thân tâm.</span>
  </p>

  <p style="color:#3F5340;font-size:11px;margin-top:24px;text-align:center;">
    Email tự động xác nhận đơn hàng. Mọi câu hỏi xin nhắn Phương qua Zalo ở trên.<br>
    Elsa Phương · Khỏe Đẹp Từ Gốc · elsaphuong.com
  </p>
</div>`
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi gửi email confirm goi-dau:', error);
    return res.status(500).json({ error: error.message });
  }
}
