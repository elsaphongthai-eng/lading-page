# Hướng dẫn vận hành elsaphuong.com

_Dành cho Phương & đội quản lý — cập nhật 2026-08_

---

## 🔐 Đăng nhập Admin

- **Link**: https://elsaphuong.com/admin/
- **Mật khẩu**: `Elsaphuong100trieudo` (Nam đưa qua Zalo)
- Browser tự nhớ password → lần sau vào thẳng dashboard.
- Bấm **"Đăng xuất"** để xoá password khỏi máy đang dùng.

---

## 📊 4 tab chính trong Admin

### 👥 Học viên
- Danh sách người **đã thanh toán** khoá học.
- Cột: Tên, Email, SĐT, Khoá đã mua, Mã HV (EP000xxx), Ngày tham gia.
- **Search**: tên/email/SĐT.
- **Filter khoá**: chỉ hiện học viên khoá X.
- **Chi tiết**: xem đầy đủ record + tiến độ học (bao nhiêu bài đã hoàn thành).

### 💳 Đơn hàng
- Danh sách giao dịch (đã trả + đang chờ).
- Cột: Mã đơn, Sản phẩm, Số tiền, Trạng thái, Thời gian.
- **Filter**: theo mã đơn hoặc thời gian.
- **Export CSV**: xuất Excel cho kế toán.

### 🎁 Lead nhận quà
- Danh sách người **điền form nhận quà miễn phí** (chưa mua).
- Có thông tin: tuổi, nghề, thành phố, mong muốn — dữ liệu quý cho marketing/tư vấn 1-1.
- Có thể xuất CSV → làm list Zalo/email marketing.

### 🎟 Coupon
- Tạo mã giảm giá cho khoá học.
- Xem thống kê ai đã dùng mã nào.

---

## 🎟 Cách tạo mã giảm giá

1. Vào tab **🎟 Coupon** → bấm **"+ Tạo coupon"**
2. Điền:
   - **Mã**: `WELCOME30`, `TET2026`, `VAN15`... (chữ + số, ngắn dễ nhớ)
   - **Giảm %** HOẶC **giảm cứng ₫** (chọn 1)
   - **Khoá áp dụng**: tick khoá được giảm (bỏ trống = mọi khoá)
   - **Hết hạn**: ngày cuối được dùng (bỏ trống = vô hạn)
   - **Số lượt tối đa**: dùng bao nhiêu người thì hết (bỏ trống = vô hạn)
   - **Ghi chú nội bộ**: mình ghi để nhớ (VD "Post FB 15/10")
3. Bấm **Lưu** → mã có hiệu lực NGAY.
4. Gửi mã cho khách qua Zalo/FB. Khách nhập vào ô "Mã giảm giá" ở trang thanh toán → giá tự giảm.

### Ví dụ campaign

| Tình huống | Mã | Setup |
|---|---|---|
| 50 người đầu FB post giảm 30% | `MOI2026` | Giảm 30%, uses_left=50 |
| Sinh nhật Phương giảm 100K | `PHUONG` | Giảm cứng 100000₫, hết hạn 3 ngày |
| Vân giới thiệu bạn | `VAN15` | Giảm 15%, note "Vân affiliate" |
| Học viên cũ mua khoá 2 | `HOCVIENVIP` | Giảm 20%, chỉ Gói Đầu Thông Khí |

---

## 🎓 Cách xem tiến độ học của học viên

1. Vào tab **👥 Học viên** → click **"Chi tiết"** dòng học viên đó
2. Modal hiện:
   - `enrolled_courses`: khoá đã mua
   - `progress`: mỗi khoá có `activated_at` (bắt đầu học), `completed_lessons` (bài đã học xong), `last_seen` (lần cuối vào)

---

## 🚨 10 tình huống hay gặp

### 1. Học viên không đăng nhập được
1. Vào **admin → Học viên** → search email
2. Xem `studentId` (dạng EP000xxx) → gửi lại qua Zalo
3. Nhắc: password = mã học viên (giống studentId)

### 2. Học viên chuyển khoản nhưng không nhận email
1. Vào **admin → Đơn hàng** → tìm mã đơn
2. Nếu trạng thái **"Đã trả"** nhưng học viên báo không có email → kiểm hộp Spam
3. Nếu trạng thái **"Chờ"** → hỏi học viên có chuyển đúng nội dung CK không (phải là mã đơn `DNAN...` hoặc `GDCN...`)
4. Nếu đúng mà vẫn chờ: nhắn Nam → Nam check log Vercel

### 3. Học viên yêu cầu refund
1. Vào **admin → Đơn hàng** → xem ngày thanh toán
2. Nếu < 30 ngày → refund được (chính sách hiện tại)
3. Nam vào Upstash console xoá `user_<email>` + đổi order status `paid` → `refunded`
4. Chuyển khoản lại cho học viên bằng tài khoản MB

### 4. Muốn xem doanh thu tháng
1. Vào **admin → Đơn hàng**
2. **Xuất CSV** → mở Excel/Google Sheets
3. Filter cột "time" theo tháng → sum cột "amount"

### 5. Muốn gửi email marketing cho lead
1. Vào **admin → Lead nhận quà** → **Xuất CSV**
2. Import vào Mailchimp/Sendinblue/... hoặc bulk Zalo

### 6. Muốn cập nhật nội dung bài học (Dáng Ngọc)
- Nhắn Nam kèm ngày + nội dung mới → Nam sửa file `khoahoc/index.html`
- Sau này có thể build tab "Bài học" trong admin để tự sửa (Phase B)

### 7. Muốn xoá 1 học viên test
1. Nam vào Upstash console (console.upstash.com) → tìm key `user_<email>`
2. Delete key
3. Hoặc nhắn Nam làm hộ

### 8. Web bị lỗi / không load được
1. Screenshot màn hình + URL bị lỗi
2. Gửi Nam qua Zalo
3. Trong lúc chờ: reload trang (Cmd+Shift+R), thử trình duyệt khác

### 9. Muốn đổi password admin
1. Nam vào Vercel: https://vercel.com/elsaphongthai-1235s-projects/project-fa985/settings/environments/production
2. Tìm env `ADMIN_TOKENS` → Edit → nhập password mới → Save
3. Bấm **Redeploy** → chờ 2 phút
4. Nam gửi password mới cho Phương/Vân qua Zalo

### 10. Muốn thêm khoá học mới
- Nhắn Nam: tên khoá, giá, code prefix (VD `CTTM` cho "Chuyển Hoá Tâm Thức"), spec nội dung
- Nam code + push (khoảng 1 ngày)

---

## 💾 Backup dữ liệu

- **Tự động**: mỗi ngày 4:00 sáng, hệ thống backup toàn bộ data → giữ 30 ngày.
- **Vị trí**: `/opt/upstash-backup/backups/` trên VPS.
- **Nam có thể tải về máy** bất kỳ lúc nào:
  ```bash
  scp -P 2018 root@103.97.127.34:/opt/upstash-backup/backups/upstash-*.json.gz ~/Downloads/
  ```
- **Restore khi mất data**: Nam chạy lệnh trên VPS:
  ```bash
  ssh -p 2018 root@103.97.127.34
  python3 /opt/upstash-backup/upstash-backup.py restore /opt/upstash-backup/backups/upstash-YYYYMMDD-HHMMSS.json.gz
  # gõ YES enter
  ```

---

## 🔧 Cấu trúc hệ thống (dành cho Nam)

### 3 hạ tầng
| Nơi | Địa chỉ | Vai trò |
|---|---|---|
| **VPS Ubuntu** | `root@103.97.127.34:2018` | Host tất cả trang HTML tĩnh, Nginx, PM2 main-server |
| **Vercel** | project-fa985 | Serverless API (12 endpoints, cap Hobby) |
| **Upstash Redis** | welcome-grackle-150149 | Database (users, orders, coupons, leads, progress) |

### Files chính
| Path | Chức năng |
|---|---|
| `api/ipn.js` | Nhận webhook SePay khi paid |
| `api/save-data.js` | Lưu customer, coupon, admin ops |
| `api/verify-login.js` | Login /khoahoc/ |
| `api/activate-course.js` | Progress + activate khoá |
| `api/check-payment.js` | Check order paid + validate coupon |
| `api/get-orders.js` | Admin: list users/orders/leads/coupons |
| `api/nhan-qua.js` | Form nhận quà miễn phí |
| `api/_lib/products.js` | Config khoá học (thêm khoá mới: sửa file này) |
| `api/_lib/emails-goi-dau.js` | Email templates Gội Đầu |
| `ops/upstash-backup.py` | Script backup |

### Deploy
- Push GitHub → Vercel auto-deploy trong ~2 phút.
- Static VPS: sửa file qua SSH + upload SCP, nginx reload nếu cần.

### Env vars quan trọng (Vercel)
- `ADMIN_TOKENS` — password admin panel (CSV nhiều password OK)
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` — Upstash
- `RESEND_API_KEY` — gửi email
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — Bot Đậu notify Phương

---

## 📞 Liên hệ hỗ trợ

- **Bug web/technical**: Nam qua Zalo
- **Vercel dashboard**: https://vercel.com/elsaphongthai-1235s-projects/project-fa985
- **Upstash console**: https://console.upstash.com
- **Resend logs**: https://resend.com/emails
- **VPS SSH**: `ssh -p 2018 root@103.97.127.34`

_Cập nhật lần cuối: 2026-08-22 · Version 1.0_
