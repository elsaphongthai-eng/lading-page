# Báo cáo Kiểm tra & Chuẩn bị Deploy lên VPS Linux

Chào bạn, dựa trên kết quả kiểm tra toàn bộ thư mục dự án `lading-page-main`, dưới đây là các câu trả lời và thông tin quan trọng bạn cần nắm rõ trước quá trình triển khai (deploy) vào ngày mai:

### 1. Dự án đang sử dụng ngôn ngữ/framework gì?
- **Frontend (Giao diện người dùng):** Sử dụng các file HTML tĩnh (`index.html`, `admin.html`, `thanh-toan.html`), CSS và JavaScript thuần (Vanilla JS) không dùng framework phức tạp (như React hay Vue).
- **Backend (API):** Được viết bằng **Node.js**. Đặc biệt, cấu trúc hiện tại của dự án trong thư mục `api/` (chứa các file như `send-email.js`, `check-payment.js`, `ipn.js`...) đang được viết theo chuẩn **Serverless Functions của Vercel**. 
- **Third-party Services (Dịch vụ bên thứ 3):** Dự án đang gọi các Rest API từ **Upstash** (chức năng Redis để lưu trữ đơn hàng) và **Resend** (để thực hiện gửi Email cho khách).

### 2. Có file nào cần tạo thêm để deploy được không?
**Câu trả lời là CÓ. Rất quan trọng!**
Do backend của bạn đang dùng cơ chế Serverless của riêng nền tảng Vercel, nên khi bạn đem mã nguồn này chạy trực tiếp trên VPS Linux thông thường, các file trong thư mục `api/` sẽ **không tự nhiên hoạt động**. Bạn cần tạo thêm một số file để cấu hình lại:

1. **Tạo thêm một file `server.js` (Server Express Node.js):**
   Bạn cần cài đặt thư viện `express` và một file tên `server.js` (hoặc `app.js`). File này sẽ đảm nhiệm 2 công việc:
   - "Serve" (hiển thị) giao diện Frontend (các file HTML, CSS, hình ảnh).
   - Tiếp nhận các yêu cầu HTTP để điều hướng (route) các địa chỉ URL dạng `/api/*` trỏ về đúng logic của các file trong thư mục `api/` của bạn thay vì báo lỗi 404.
2. **File `ecosystem.config.js` (Tùy chọn nhưng khuyên dùng):**
   Nếu dùng PM2 để duy trì sự sống của source code bạn nên tạo file này giúp dễ dàng truyền biến môi trường quản lý server sau này.
3. **File cấu hình Nginx (ví dụ `domain.conf`):**
   Bạn sẽ cần trên VPS một file text của Nginx định tuyến Reverse Proxy (truyền các truy cập web từ Port 80/443 vào Port mà `server.js` đang mở, ví dụ port 3000).

### 3. Có thông tin bí mật nào như API Key đang nằm lộ trong code hay không?
- **Trong Code nguồn (`.html` và `.js`): Rất an toàn.**
  Tôi đã quét dọc các file nguồn của dự án và không phát hiện bất kỳ API Key hay thông tin nhạy cảm nào bị "hardcode" (viết cứng) làm lộ lọt. Tất cả đều gọi an toàn qua biến môi trường ví dụ bằng đối tượng `process.env.KV_REST_API_TOKEN` hay `process.env.RESEND_API_KEY`.
- **LƯU Ý - Đã phát hiện file `.env.local` ở thư mục Root:**
  Dù trong Code không lộ nhưng ở cấp thư mục hiện tại của bạn đang tồn tại trực tiếp file `.env.local` bên trong có cất trữ đầy đủ các tài khoản thật mật khẩu thật (KV REST Token, Resend API, Vercel JWT Token, URL Database). Vì thế:
  - Nếu bạn dùng Git, đảm bảo file này đã bị tàng hình nhờ `.gitignore` (file gitignore hiện tại đang chạy tốt mục đích này).
  - Khi tải code lên VPS, **Tuyệt đối không public thư mục dự án không bảo hộ Nginx**. Hãy đổi tên lại nó thành file chuẩn `.env` trên VPS để package `dotenv` của Node.js nhận cấu hình môi trường dễ dàng hơn.

### 4. Danh sách đầy đủ các thiết bị & chuẩn bị trước khi Deploy

Để quá trình gắn dự án lên VPS ngày mai mượt mà, bạn hãy check qua checklist vật tư sau:

#### A. Cấu hình Máy chủ (VPS)
- [ ] VPS đã cài đặt hệ điều hành Linux (Bản phân phối **Ubuntu 20.04 LTS** hoặc **22.04 LTS** là dễ dùng nhất cho người mới).
- [ ] Truy cập được vào VPS thông qua SSH (Putty / Terminal).
- [ ] Đã trỏ Tên miền (Domain) của bạn (ví dụ `dien-dan.com` và `www.dien-dan.com`) về địa chỉ dòng IP (A Record) của VPS trên nền tảng quản lý DNS.

#### B. Cài đặt các phần mềm lõi trên VPS
- [ ] **Node.js và NPM:** Phiên bản tối thiểu khuyên dùng là Node version 18 trở lên.
- [ ] **PM2:** Trình quản lý tiến trình của Node. Dùng để cấu hình cho app Node.js khởi động chạy ngầm, không bị sập lúc thoát Putty/Command (lệnh cài đặt: `npm install -g pm2`).
- [ ] **Nginx:** Cài Nginx để quản lý lưu lượng nhận Domain từ ngoài internet.
- [ ] **UFW (Tường lửa Firewall):** Đã mở các Port quan trọng (22, 80, 443).

#### C. Chứng chỉ bảo mật
- [ ] **Certbot (Let's Encrypt):** Bắt buộc phải xác minh để kích hoạt Chứng chỉ SSL HTTPS (có dòng ổ khóa). Nếu không có nó, các Webhook gọi từ cổng thanh toán tự động trả về lỗi.

#### D. Mã Nguồn ứng dụng
- [ ] **Source Code mới nhất:** Tải mã nguồn lên VPS (qua git clone, SSH File Transfer, SCP...)
- [ ] Đã đổi đuôi file `.env.local` thành `.env` trên thư mục của server.
- [ ] **Khởi tạo và cài Packet mới:** Chạy `npm install` và đã cài thêm các package như `express`, `cors`, `dotenv` trên VPS.
- [ ] **Tạo File chuyển đổi `server.js`:** 1 file backend nhỏ như đã nói ở mục 2 để vận hành Project từ Vercel Mode sang Node.js Server Environment Mode.
