// Email templates cho Gội Đầu Thông Khí — module (không phải Vercel serverless function).
// Import + call trực tiếp từ ipn.js / save-data.js để tiết kiệm function count.

const BANK_ACCOUNT = '0945461368';
const BANK_NAME = 'MB';
const ACCOUNT_NAME_DISPLAY = 'DANG THI THANH PHUONG';
const PAYMENT_URL = 'https://elsaphuong.com/thanh-toan-goi-dau/';
const LINK_HOC = 'https://elsaphuong.com/khoahoc/';
const ZALO_PHUONG = 'https://zalo.me/0965050529';

async function resendSend(from, to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: 'no_key' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html })
  });
  return r.json();
}

// ==================== EMAIL 1: Đăng ký (chưa paid) ====================
export async function sendGoiDauRegEmail({ email, name, code, amount, product }) {
  const displayName = name || 'chị em';
  const productName = product || 'Gội Đầu Thông Khí';
  const amt = Number(amount) || 399000;

  const qrUrl = `https://img.vietqr.io/image/${BANK_NAME}-${BANK_ACCOUNT}-compact2.png` +
    `?amount=${amt}&addInfo=${encodeURIComponent(code)}` +
    `&accountName=${encodeURIComponent(ACCOUNT_NAME_DISPLAY)}`;

  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;padding:32px 24px;color:#2E3D2F;line-height:1.7;">
  <h2 style="color:#B93A5A;font-size:22px;margin:0 0 18px;">Chị em ${displayName} thân mến,</h2>
  <p>Phương vừa nhận được đăng ký <strong>${productName}</strong> của chị em.</p>
  <p style="font-style:italic;color:#3F5340;">Trong hệ sinh thái <strong>Khỏe Đẹp Từ Gốc</strong>, "Gội Đầu Thông Khí" không chỉ là một liệu trình chăm sóc mái tóc — mà là nghi thức để chị em kết nối lại với cơ thể mình, thư giãn hệ thần kinh và khai thông năng lượng bị tắc nghẽn.</p>
  <p style="background:#FBF5E7;border-left:4px solid #B93A5A;padding:14px 18px;border-radius:8px;font-style:italic;color:#3F5340;">Khỏe đẹp bắt đầu từ gốc — từ sợi tóc, đến hơi thở, đến sự yên bình bên trong.</p>
  <hr style="border:none;border-top:1px solid #E8DDBE;margin:28px 0;">
  <h3 style="color:#B93A5A;font-size:18px;margin:0 0 12px;">💳 Hoàn tất thanh toán để chính thức tham gia</h3>
  <p>Chị em quét mã QR bên dưới để chuyển khoản. Hệ thống sẽ tự xác nhận trong vài giây.</p>
  <div style="background:#fff;border:2px dashed #B93A5A;border-radius:14px;padding:22px;margin:20px 0;text-align:center;">
    <img src="${qrUrl}" alt="QR ${amt.toLocaleString('vi-VN')}đ" width="260" style="display:block;margin:0 auto 14px;border-radius:10px;">
    <p style="margin:6px 0;font-size:14px;"><strong>Ngân hàng:</strong> ${BANK_NAME} Bank</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Số tài khoản:</strong> ${BANK_ACCOUNT}</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Chủ tài khoản:</strong> Đặng Thị Thanh Phương</p>
    <p style="margin:6px 0;font-size:14px;"><strong>Số tiền:</strong> <span style="color:#B93A5A;font-size:18px;font-weight:700;">${amt.toLocaleString('vi-VN')}đ</span></p>
    <p style="margin:6px 0;font-size:14px;"><strong>Nội dung CK:</strong> <span style="color:#B93A5A;font-family:'Courier New',monospace;font-weight:700;letter-spacing:1px;">${code}</span></p>
    <p style="margin:14px 0 6px;font-size:12px;color:#3F5340;font-style:italic;">Giữ nguyên nội dung chuyển khoản để hệ thống tự xác nhận.</p>
  </div>
  <p style="text-align:center;margin:24px 0;">
    <a href="${PAYMENT_URL}" style="background:#2E3D2F;color:#fff;padding:14px 36px;border-radius:40px;text-decoration:none;font-weight:700;display:inline-block;">👉 Mở lại trang thanh toán</a>
  </p>
  <p>Sau khi thanh toán thành công, chị em sẽ nhận được <strong>tài khoản đăng nhập</strong> để bắt đầu học ngay.</p>
  <hr style="border:none;border-top:1px solid #E8DDBE;margin:28px 0;">
  <p style="text-align:center;margin-top:18px;">
    <strong style="font-size:16px;color:#B93A5A;">Elsa Phương</strong><br>
    <span style="font-family:'Brush Script MT',cursive;color:#3F5340;font-size:14px;">KHỎE ĐẸP TỪ GỐC</span><br>
    <span style="font-size:12px;color:#3F5340;font-style:italic;">Chăm sóc từ sợi tóc đến thân tâm.</span>
  </p>
  <p style="color:#3F5340;font-size:12px;margin-top:24px;text-align:center;">Email tự động. Mọi câu hỏi nhắn Zalo Phương: 0965050529.<br>Elsa Phương · Khỏe Đẹp Từ Gốc · elsaphuong.com</p>
</div>`;

  return resendSend('Elsa Phương <phuong@elsaphuong.com>', email,
    '🌿 Chúc mừng chị em đã đăng ký ' + productName, html);
}

// ==================== EMAIL 2: Đã thanh toán (paid + credentials) ====================
export async function sendGoiDauConfirmEmail({ email, name, code, amount, product, studentId, password }) {
  const displayName = name || 'chị em';
  const productName = product || 'Gội Đầu Thông Khí';
  const amt = Number(amount || 0);
  const LINK_ZALO = process.env.LINK_ZALO_GOIDAU || '#';

  const zaloBlock = (LINK_ZALO && LINK_ZALO !== '#') ? `
    <p style="margin:8px 0;"><strong>👉 Link nhóm Zalo:</strong> <a href="${LINK_ZALO}" style="color:#0068FF;">${LINK_ZALO}</a></p>` :
    '<p style="color:#3F5340;font-style:italic;">💬 Link nhóm Zalo sẽ được Phương gửi bổ sung qua email sau ít hôm.</p>';

  const credentialsBlock = studentId ? `
    <h3 style="color:#B93A5A;font-size:18px;margin:28px 0 10px;">📚 Thông tin học viên — Vào học ngay</h3>
    <p>🌐 <strong>Link học:</strong> <a href="${LINK_HOC}" style="color:#B93A5A;">${LINK_HOC}</a></p>
    <div style="background:#FBF5E7;border:2px dashed #B93A5A;border-radius:12px;padding:18px 22px;margin:14px 0;">
      <p style="margin:6px 0 12px;font-size:14px;color:#3F5340;">Phương đã tạo tài khoản học cho chị em:</p>
      <p style="margin:8px 0;font-size:14px;">📧 Email đăng nhập: <strong style="color:#2E3D2F;">${email}</strong></p>
      <p style="margin:8px 0;font-size:14px;">🔐 Mã số học viên: <strong style="color:#B93A5A;font-size:18px;letter-spacing:2px;">${studentId}</strong></p>
      <p style="margin:10px 0 0;font-size:12px;color:#3F5340;font-style:italic;">(Mã số học viên cũng chính là mật khẩu)</p>
    </div>
    <p style="text-align:center;margin:18px 0;">
      <a href="${LINK_HOC}" style="background:linear-gradient(90deg,#B93A5A,#8E2946);color:#fff;padding:14px 36px;border-radius:40px;text-decoration:none;font-weight:700;display:inline-block;box-shadow:0 6px 22px rgba(185,58,90,.3);">→ Vào học ngay</a>
    </p>` : '';

  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;padding:32px 24px;color:#2E3D2F;line-height:1.7;">
  <h2 style="color:#B93A5A;font-size:22px;margin:0 0 18px;">Chị em ${displayName} thân mến,</h2>
  <p>Phương đã nhận được thanh toán của chị em. Từ giây phút này, chị em chính thức là học viên của <strong>${productName}</strong> — một chương trình trong hệ sinh thái <strong>Khỏe Đẹp Từ Gốc</strong>. 🌿</p>
  <p style="font-style:italic;color:#3F5340;">Cảm ơn chị em đã tin và chọn Phương đồng hành trong hành trình chăm sóc bản thân từ những điều nhỏ nhất — từ mái tóc, từ hơi thở, từ chính khoảng lặng của mình.</p>
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
  <p style="font-family:'Brush Script MT',cursive;font-size:20px;color:#B93A5A;text-align:center;">Phương rất mong được đồng hành cùng chị em.<br>Thương gửi chị 🌿</p>
  <p style="text-align:center;margin:24px 0 6px;">
    <a href="${ZALO_PHUONG}" style="background:#0068FF;color:#fff;padding:11px 26px;border-radius:40px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">💬 Nhắn Zalo cho Phương</a>
  </p>
  <p style="margin-top:24px;">Thương mến,</p>
  <p style="margin:6px 0;">
    <strong style="color:#B93A5A;font-size:16px;">Elsa Phương</strong><br>
    <span style="font-family:'Brush Script MT',cursive;color:#3F5340;font-size:14px;">KHỎE ĐẸP TỪ GỐC</span><br>
    <span style="font-size:12px;color:#3F5340;font-style:italic;">Chăm sóc từ sợi tóc đến thân tâm.</span>
  </p>
</div>`;

  return resendSend('Elsa Phương <phuong@elsaphuong.com>', email,
    '🎉 Chúc mừng chị em đã hoàn tất đăng ký ' + productName, html);
}
