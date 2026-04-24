import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_1 = (name) => ({
  subject: `Chào mừng ${name} bước vào hành trình tìm lại chính mình 🌸`,
  html: `<p>Chào ${name},</p>
    <p>Phương vừa nhận được thông tin đăng ký của Bạn. Biết ơn Bạn vì đã chọn dành 21 ngày tới cho chính mình — điều mà có lẽ bấy lâu nay Bạn đã vô tình đặt ở cuối danh sách ưu tiên.</p>
    <p>Phương từng là người lo cho tất cả mọi người, để rồi một ngày nhìn vào gương và tự hỏi: <em>"Mình là ai ngoài vai trò người vợ, người mẹ, người con, người cho công việc?"</em>. Cảm giác trống rỗng đó đáng sợ lắm, cho đến khi Phương chọn "thay đổi" thay vì "mất mình mãi mãi".</p>
    <p>Hành trình "Chạm Hành Trình Vươn Mình Rực Rỡ" không chỉ là một khóa học, mà là một cái ôm dành cho đứa trẻ bên trong Bạn, giúp Bạn tìm lại ánh sáng vốn đã có sẵn nhưng bị vùi lấp quá lâu.</p>
    <p>Lưu lại lịch nhé: <strong>Khai giảng ngày 06/06/2026.</strong></p>
    <p>Trong vài ngày tới, Phương sẽ chia sẻ với Bạn một vài điều "thấm thía" mà Phương đã học được trong 39 năm loay hoay. Bạn nhớ check mail để mình cùng chuẩn bị tâm thế rực rỡ nhất cho ngày khởi hành nhé!</p>
    <p>From Phương with love 🌸<br>Elsa Phương</p>`
});

const EMAIL_2 = (name) => ({
  subject: `${name} ơi — Điều thấm thía Phương học được sau 39 năm "sống hộ" cuộc đời người khác`,
  html: `<p>Chào ${name},</p>
    <p>Có bao giờ Bạn thấy mình rất giỏi trong việc làm hài lòng mọi người, nhưng lại cực kỳ vụng về trong việc làm cho chính mình hạnh phúc?</p>
    <p>Năm 40 tuổi, Phương sững sờ nhận ra: Suốt 39 năm, Phương sống rất trách nhiệm với chồng, con, gia đình... nhưng chưa một lần thật sự sống cho mình. Những câu hỏi <em>"Mình muốn gì? Mình là ai?"</em> từng làm Phương khóc rất nhiều vì không tìm thấy câu trả lời.</p>
    <p>Phương nhận ra một sự thật: Chúng ta không thể cho đi thứ mà mình không có. Nếu bên trong mình trống rỗng, mọi sự chăm sóc cho gia đình chỉ là sự gồng gánh, và sớm muộn gì mình cũng kiệt sức.</p>
    <p>Đó là lý do Phương tạo ra <strong>Phương pháp Chạm Gốc™</strong>. Thay vì cố gắng thay đổi từ bên ngoài (điều mà 90% mọi người thường làm và thất bại), Phương dẫn dắt chị em đi ngược lại: Chạm vào gốc rễ nỗi đau → Hiểu mình → Tỉnh thức → và rồi tự khắc Rực rỡ.</p>
    <p>Khi gốc rễ được chữa lành, sự rực rỡ sẽ tự nhiên toả ra mà không cần cố gắng.</p>
    <p>Phương tin Bạn cũng đang khao khát cảm giác được "thực sự sống" như thế. Và hành trình sắp tới sẽ là con đường ngắn nhất để Bạn chạm đến phiên bản đó.</p>
    <p>From Phương with love 🌸<br>Elsa Phương</p>`
});

const EMAIL_3 = (name) => ({
  subject: `${name} ơi — 21 ngày để trở thành người phụ nữ Bạn hằng ao ước 🌸`,
  html: `<p>Chào ${name},</p>
    <p>Chỉ còn ít ngày nữa, hành trình "Chạm Hành Trình Vươn Mình Rực Rỡ" sẽ chính thức khai giảng vào <strong>06/06/2026</strong>.</p>
    <p>Bạn hãy thử tưởng tượng, sau 21 ngày tới:<br>
    ✨ Bạn thức dậy với niềm hân hoan, biết rõ mình sống vì điều gì.<br>
    ✨ Bạn nhìn vào gương và mỉm cười với một người phụ nữ tràn đầy năng lượng, rực rỡ và tự tin.<br>
    ✨ Bạn chăm sóc gia đình từ một trái tim đầy ắp, không còn cảm giác mệt mỏi hay trống rỗng.</p>
    <p>Đó không phải là phép màu, mà là kết quả của việc đi đúng thứ tự: Chạm đúng Gốc.</p>
    <p>Để đồng hành cùng thật nhiều chị em trong đợt đầu tiên này, Phương gửi đến Bạn mức đầu tư cực kỳ nhẹ nhàng: <strong>990.000đ</strong>.</p>
    <p>Số tiền này thậm chí chưa bằng một bữa ăn gia đình cuối tuần, hay chỉ bằng một ly sinh tố mỗi ngày. Nhưng giá trị nó mang lại là một nền tảng để Bạn thay đổi hoàn toàn diện mạo và tâm hồn trong những năm tháng còn lại.</p>
    <p>Đừng để bản thân tiếp tục "ngủ quên" thêm một năm, một thập kỷ nào nữa. Bạn xứng đáng được rực rỡ ngay bây giờ.</p>
    <p>👉 <a href="https://www.elsaphuong.com/thanh-toan">Đăng ký giữ chỗ cho mình tại đây nhé!</a></p>
    <p>Hẹn gặp Bạn ở phiên bản rực rỡ nhất của chính mình!</p>
    <p><em>P.S: Vì Phương muốn hỗ trợ sâu nhất, nên số lượng chỗ cho đợt này có hạn. Bạn đăng ký sớm để Phương sắp xếp chu đáo nhất nhé!</em></p>
    <p>From Phương with love 🌸<br>Elsa Phương</p>`
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, emailNumber } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Thiếu email' });
  }

  try {
    let emailContent;
    if (emailNumber === 1) emailContent = EMAIL_1(name);
    else if (emailNumber === 2) emailContent = EMAIL_2(name);
    else if (emailNumber === 3) emailContent = EMAIL_3(name);
    else return res.status(400).json({ error: 'emailNumber phải là 1, 2, hoặc 3' });

    await resend.emails.send({
      from: 'Elsa Phương <phuong@elsaphuong.com>',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return res.status(500).json({ error: error.message });
  }
}