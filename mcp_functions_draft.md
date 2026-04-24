# 3 MCP Functions Cốt Lõi Cho Bot Telegram

Dưới đây là 3 function thiết thực nhất đã được chốt để xây dựng. Chúng sẽ giúp bạn điều hành luồng công việc bán hàng và CSKH hàng ngày hoàn toàn tự động qua Telegram.

## 1. get_daily_sales_summary
- **Input params**: `date` (string, định dạng YYYY-MM-DD, tùy chọn mặc định là hôm nay)
- **Output dự kiến**: Tổng số lượt điền form đăng ký mới, số đơn đã thanh toán thành công, và tổng doanh thu thực tế trong ngày.
- **Tình huống dùng hàng ngày**: Đang đi cà phê hoặc cuối ngày, bạn mở Telegram để xem cập nhật ngay lập tức hiệu quả bán hàng.
- **Độ ưu tiên**: 5
- **Ví dụ tin nhắn Telegram trigger**:
  - *"Báo cáo doanh thu hôm nay thế nào rồi?"*
  - *"Hôm qua bán được bao nhiêu đơn?"*
  - *"Cho mình xem thống kê ngày 25/04 nhé."*

## 2. manually_approve_order
- **Input params**: `order_code` (string, ví dụ: "CHAM12345")
- **Output dự kiến**: Cập nhật trạng thái đơn hàng thành `paid` trong KV database và tự động gọi API hệ thống để gửi email xác nhận cho khách.
- **Tình huống dùng hàng ngày**: Khách hàng chuyển khoản sai cú pháp khiến hệ thống IPN không tự động duyệt, bạn check app ngân hàng thấy tiền đã vào nên nhắn Telegram để duyệt tay và gửi email ngay.
- **Độ ưu tiên**: 5
- **Ví dụ tin nhắn Telegram trigger**:
  - *"Duyệt đơn CHAM8899 giúp mình, khách này chuyển sai nội dung nhưng nhận được tiền rồi."*
  - *"Confirm mã CHAM12345."*
  - *"Bạn ơi, update trạng thái thanh toán cho đơn CHAM5678 thành công và gửi mail nhé."*

## 3. lookup_customer_status
- **Input params**: `search_term` (string - có thể là email, tên hoặc mã đơn `CHAM...`)
- **Output dự kiến**: Thông tin của khách hàng bao gồm: Tên, Email, Mã đơn hàng, Trạng thái thanh toán (pending/paid).
- **Tình huống dùng hàng ngày**: Có khách nhắn tin thắc mắc "Chị ơi em đăng ký rồi mà không biết thành công chưa", bạn chỉ cần gõ email hoặc tên để check tình trạng nhanh qua Telegram.
- **Độ ưu tiên**: 4
- **Ví dụ tin nhắn Telegram trigger**:
  - *"Check cho mình khách hàng phuong@gmail.com xem đã thanh toán chưa?"*
  - *"Tìm trạng thái của mã đơn CHAM9999."*
  - *"Có khách tên Nguyễn Văn A đăng ký chưa, kiểm tra giùm mình."*
