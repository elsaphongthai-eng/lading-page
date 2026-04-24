# Hướng dẫn Deploy cho Landing Page

Chào bạn, đây là tài liệu hướng dẫn nhanh để đưa toàn bộ mã nguồn website lên hệ thống VPS Linux (Ubuntu). 

Dự án này đã được mình cấu hình lại hoàn toàn nhằm phục vụ việc chạy độc lập trên máy chủ riêng thông qua Node.js (Vercel Serverless Function đã được chuyển thể qua Express).

## 1. Yêu cầu Chuẩn bị
1. Máy chủ VPS đang chạy hệ điều hành Ubuntu 20.04 hoặc 22.04.
2. Tên miền (Domain) đã được trỏ IP về VPS.
3. Đã làm sạch các key bí mật trên cấu hình (Các mã thật đã được giấu. Bạn hãy chuẩn bị các mã thật như Resend key, Upstash key...). 

## 2. Các phần mềm cần thiết trên Server
Chạy các dòng lệnh sau trên VPS của bạn để cài đặt môi trường cơ bản nếu chưa có:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js (phiên bản 18.x) và PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Cài đặt Nginx
sudo apt install -y nginx
```

## 3. Upload Code & Cấu hình môi trường
Sau khi đưa thư mục này (toàn bộ nội dung của project) lên VPS tại thư mục như `/var/www/landing-page` hãy làm theo các bước sau:

**Bước 1:** Di chuyển vào thư mục dự án và cài đặt toàn bộ gói thư viện Package Node.js:
```bash
cd /var/www/landing-page
npm install
```

**Bước 2:** Đổi tên file cấu hình biến môi trường và nhập các mã cấu hình thật của bạn:
```bash
cp .env.example .env
nano .env # Thay thế các giá trị YOUR_KV_REST_API... thành Key chính thức
```

## 4. Khởi động Web Server (Backend Node.js)
Dự án sử dụng PM2 để điều hành file `server.js` nên code sẽ luôn tự động sống lại mỗi khi Server bị khởi động lại. Chạy các lệnh:

```bash
# Khởi động cùng file cấu hình
pm2 start ecosystem.config.cjs --env production

# Cài đặt để tự khởi động cùng máy chủ
pm2 startup
pm2 save
```
*(Bây giờ, Node.js đã chạy Web ở cổng mặc định cài đặt là PORT 3000)*

## 5. Cấu hình Nginx (Đẩy Web ra Mạng Internet)
Bạn sẽ dùng Nginx tạo cầu nối giữa tên miền và Cổng 3000 bằng file `domain.conf` đã cung cấp sẵn ở source:

```bash
# Copy file cấu hình domain vào Nginx
sudo cp domain.conf /etc/nginx/sites-available/tên-miền-của-bạn.conf

# Sửa lại file này để thay tên miền đúng của bạn trong mục "server_name"
sudo nano /etc/nginx/sites-available/tên-miền-của-bạn.conf

# Kích hoạt Website
sudo ln -s /etc/nginx/sites-available/tên-miền-của-bạn.conf /etc/nginx/sites-enabled/

# Kiểm tra lỗi trong file Nginx và Khởi động lại
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Kích hoạt chứng chỉ SLL (Bảo mật HTTPS)
Hãy chắc chắn tên miền đã trỏ đúng IP. Sau đó chạy lệnh lấy chứng chỉ Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tên-miền-của-bạn.com -d www.tên-miền-của-bạn.com
```

**HOÀN TẤT!!!** Dự án lúc này đã sẵn sàng để truy cập thông qua tên miền. Các webhook (đơn hàng) từ nay sẽ không bị lỗi do thiếu cấu hình nền tảng.
