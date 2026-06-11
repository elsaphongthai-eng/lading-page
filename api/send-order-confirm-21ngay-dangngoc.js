// Email xác nhận đơn hàng cho Khoá 21 Ngày Dáng Ngọc An Nhiên (799K) — sau khi paid.
// Template theo brief Phương (Tháng 6/2026): 2 bước rõ ràng — Cộng đồng đồng hành + Đăng nhập học.
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Link nhóm — placeholder khi chưa có. Khi Phương có link thật, set env và replace.
const LINK_ZALO = process.env.LINK_ZALO_DANGNGOC || '#';
const LINK_TELEGRAM = process.env.LINK_TELEGRAM_DANGNGOC || '#';
const LINK_HOC = 'https://elsaphuong.com/khoahoc/';
const ZALO_PHUONG = 'https://zalo.me/0965050529';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, code, amount, product, studentId, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Thiếu email' });

  const displayName = name || 'chị em';
  const productName = product || 'Khoá 21 Ngày Dáng Ngọc An Nhiên';

  // Block nhóm Telegram — chỉ hiện nếu có link, hoặc hiện thông báo "Sắp cập nhật"
  const telegramBlock = (LINK_TELEGRAM && LINK_TELEGRAM !== '#') ? `
    <p style="margin:8px 0;"><strong>👉 Link Telegram:</strong> <a href="${LINK_TELEGRAM}" style="color:#0088cc;">${LINK_TELEGRAM}</a></p>
    <p>Nếu có thể, Phương rất mong chị em tham gia thêm Telegram. Đây là nơi có:</p>
    <ul style="padding-left:22px;">
      <li>💗 Coach Chạm đồng hành cùng chị em mỗi ngày</li>
      <li>💗 Hỗ trợ gỡ rối tâm lý, cảm xúc và các khó khăn trong cuộc sống</li>
      <li>💗 Chia sẻ sâu hơn về nội lực, chữa lành và hành trình yêu thương bản thân</li>
      <li>💗 Kết nối với cộng đồng chị em cùng chí hướng</li>
    </ul>` :
    '<p style="color:#8B6F5C;font-style:italic;">📲 Link Telegram đồng hành sẽ được Phương gửi bổ sung qua email sau ít hôm nữa.</p>';

  const zaloBlock = (LINK_ZALO && LINK_ZALO !== '#') ? `
    <p style="margin:8px 0;"><strong>👉 Link nhóm Zalo:</strong> <a href="${LINK_ZALO}" style="color:#0068FF;">${LINK_ZALO}</a></p>` :
    '<p style="color:#8B6F5C;font-style:italic;">💬 Link nhóm Zalo sẽ được Phương gửi bổ sung qua email sau ít hôm nữa.</p>';

  const credentialsBlock = (studentId) ? `
    <h3 style="color:#D81B60;font-size:18px;margin:28px 0 10px;">🎓 BƯỚC 2: ĐĂNG NHẬP TÀI KHOẢN HỌC TẬP</h3>
    <p>🌐 <strong>Link học:</strong> <a href="${LINK_HOC}" style="color:#D81B60;">${LINK_HOC}</a></p>
    <div style="background:#FFF8E1;border:2px dashed #D81B60;border-radius:12px;padding:18px 22px;margin:14px 0;">
      <p style="margin:6px 0;font-size:14px;color:#5C4404;">Phương đã tạo tài khoản học cho chị em. Đây là thông tin đăng nhập:</p>
      <p style="margin:10px 0;font-size:14px;">📧 <strong>Email:</strong> <span style="color:#4A3429;">${email}</span></p>
      <p style="margin:6px 0;font-size:14px;">🔐 <strong>Mã số học viên / Mật khẩu:</strong> <span style="color:#D81B60;font-size:18px;font-weight:700;letter-spacing:2px;">${studentId}</span></p>
      <p style="margin:8px 0 0;font-size:12px;color:#7B5A0D;font-style:italic;">(Mã số học viên cũng chính là mật khẩu — chị em lưu lại email này để đăng nhập sau này nhé)</p>
    </div>
    <p style="text-align:center;margin:18px 0;">
      <a href="${LINK_HOC}"
         style="background:linear-gradient(90deg,#D81B60,#AD1457);color:#fff;padding:14px 36px;border-radius:40px;text-decoration:none;font-weight:700;display:inline-block;font-family:'Be Vietnam Pro',sans-serif;box-shadow:0 6px 22px rgba(216,27,96,.3);">
        → Vào học ngay
      </a>
    </p>` : '';

  try {
    await resend.emails.send({
      from: 'Elsa Phương <phuong@elsaphuong.com>',
      to: email,
      subject: '🎉 Chúc mừng Chị Em đã chính thức gia nhập Dáng Ngọc An Nhiên!',
      html: `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;padding:32px 24px;color:#4A3429;line-height:1.7;">

  <h2 style="color:#D81B60;font-size:22px;margin:0 0 18px;">Chị em ${displayName} thân mến,</h2>

  <p>Phương đã nhận được thanh toán của chị em. Và từ giây phút này, <strong>hành trình 21 ngày của chị em chính thức bắt đầu</strong>. 🌷</p>

  <p style="font-style:italic;color:#8B6F5C;">
    Có thể hôm nay chị em vẫn chưa thấy cơ thể mình thay đổi.<br>
    Có thể những đau mỏi, căng cứng, vòng bụng hay sự mệt mỏi vẫn còn đó.<br>
    Nhưng Phương tin rằng quyết định vừa rồi là một món quà rất đẹp mà chị em dành cho chính mình.
  </p>

  <p>Bởi phụ nữ thường dành rất nhiều thời gian cho người khác, nhưng rất ít khi dành thời gian cho chính mình. Và hôm nay, chị em đã chọn quay về với bản thân — đó chính là bước đầu tiên của sự chuyển hóa.</p>

  <div style="background:#FCE4EC;border-radius:12px;padding:14px 18px;margin:22px 0;font-size:14px;">
    <p style="margin:0 0 4px;"><strong>Chi tiết đơn hàng</strong></p>
    <p style="margin:3px 0;">🌸 Sản phẩm: <strong>${productName}</strong></p>
    <p style="margin:3px 0;">🧾 Mã đơn: <strong>${code}</strong></p>
    <p style="margin:3px 0;">💰 Số tiền: <strong>${Number(amount).toLocaleString('vi-VN')}đ</strong></p>
  </div>

  <hr style="border:none;border-top:1px solid #FCE4EC;margin:28px 0;">

  <h3 style="color:#D81B60;font-size:18px;margin:0 0 10px;">🌸 BƯỚC 1: THAM GIA CỘNG ĐỒNG ĐỒNG HÀNH</h3>

  <p style="margin:14px 0 6px;"><strong>Nhóm Zalo</strong></p>
  ${zaloBlock}
  <p>Đây là nơi Phương gửi thông báo và giải đáp các vấn đề trong quá trình luyện tập.</p>

  <p style="margin:18px 0 6px;"><strong>Nhóm Telegram</strong> <span style="color:#8B6F5C;font-style:italic;">(Khuyến khích tham gia)</span></p>
  ${telegramBlock}
  <p style="color:#8B6F5C;font-style:italic;">Nhiều chị em nói rằng chính những cuộc trò chuyện trong Telegram mới là điều giúp họ thay đổi sâu sắc nhất.</p>

  ${credentialsBlock}

  <hr style="border:none;border-top:1px solid #FCE4EC;margin:28px 0;">

  <h3 style="color:#D81B60;font-size:17px;margin:0 0 10px;">🌷 Trước khi bắt đầu...</h3>

  <p>Phương muốn chị em nhớ một điều:</p>
  <p style="font-style:italic;color:#8B6F5C;background:#FCE4EC;border-left:4px solid #D81B60;padding:12px 18px;border-radius:8px;">
    Dáng đẹp không đến từ việc ép cơ thể.<br>
    Phong thái không đến từ việc cố gắng trở thành một ai khác.<br>
    Khỏe đẹp bền vững bắt đầu từ việc <strong>hiểu cơ thể mình, yêu cơ thể mình và học cách sống thuận với chính mình</strong>.
  </p>

  <p>21 ngày tới, chị em không đi một mình. Phương, Coach Chạm và cộng đồng các chị em sẽ đồng hành cùng chị em trên từng bước nhỏ.</p>

  <p style="text-align:center;font-size:16px;color:#D81B60;margin:24px 0;">Hẹn gặp chị em trong buổi học đầu tiên. ❤️</p>

  <p style="text-align:center;margin:28px 0 6px;">
    <a href="${ZALO_PHUONG}"
       style="background:#0068FF;color:#fff;padding:11px 26px;border-radius:40px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">
      💬 Nhắn Zalo cho Phương
    </a>
  </p>
  <p style="text-align:center;font-size:12px;color:#8B6F5C;font-style:italic;">Nếu gặp bất kỳ khó khăn nào, chị em nhắn trực tiếp cho Phương nhé.</p>

  <p style="margin-top:24px;">Thương mến,</p>
  <p style="margin:6px 0;">
    <strong style="color:#D81B60;font-size:16px;">Elsa Phương</strong><br>
    <span style="font-family:'Brush Script MT',cursive;color:#8B6F5C;font-size:14px;">DÁNG NGỌC AN NHIÊN</span><br>
    <span style="font-size:12px;color:#8B6F5C;font-style:italic;">Khỏe đẹp bền vững. Tâm an từ nội lực.</span>
  </p>

  <hr style="border:none;border-top:1px solid #FCE4EC;margin:24px 0 14px;">

  <p style="font-size:13px;color:#5C4404;background:#FFF8E1;border-radius:8px;padding:12px 16px;">
    <strong>P/S:</strong> Chị em hãy đăng nhập ngay hôm nay và giới thiệu bản thân trong nhóm Zalo/Telegram nhé. Những người bắt đầu sớm thường là những người nhận được nhiều giá trị nhất trong hành trình 21 ngày. 🌸
  </p>

  <p style="color:#8B6F5C;font-size:11px;margin-top:24px;text-align:center;">
    Đây là email tự động xác nhận đơn hàng. Mọi câu hỏi xin nhắn Phương qua Zalo ở trên.<br>
    Elsa Phương · Dáng Ngọc An Nhiên · elsaphuong.com
  </p>
</div>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi gửi email xác nhận 21ngay-dangngoc:', error);
    return res.status(500).json({ error: error.message });
  }
}
