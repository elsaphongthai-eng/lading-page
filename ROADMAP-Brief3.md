# ROADMAP — Brief #3 Quản Lí Học Viên (2 tuần)

Người soạn: Claude (cho Nam phê duyệt)
Ngày: 2026-06-22

---

## Quyết định kiến trúc (Claude tự chọn theo "tối ưu nhất")

**Giữ `/khoahoc/` static + Vercel + Upstash + Resend.** Không migrate WordPress LearnDash.

Lý do:
- Hệ hiện tại đã chạy, có học viên thật, đã có drip 24h + countdown + activate-course.
- LearnDash mất $199/năm + 3-4 tuần setup + training Phương UI mới + risk migrate dữ liệu Upstash.
- Brief #3 mô tả "WP + drip plugin" là giả định mặc định, không phải yêu cầu cứng. Mọi logic brief yêu cầu (điểm danh, đúng hạn, quà, cộng đồng 30 ngày) đều cài được trên Vercel + Upstash.
- "Điểm danh trên trang học" = học viên dán link FB + dán link video + bấm "Hoàn thành ngày X" trên `/khoahoc/`. Không cần WP user session.

---

## 7 bước build (theo brief mục 7) — chia 2 tuần

### TUẦN 1 — Lõi check-in + Admin panel scaffold

#### B1. Endpoint điểm danh (2 ngày)
- File mới: `api/checkin.js` — POST `{email, day_number}` → ghi `checkin:{email}:{day}` Upstash
- Idempotent: `SETNX` (chỉ ghi lần đầu)
- Update `progress:{email}` schema (13 field như brief 5.2)
- Auth: dùng login token đã có (`localStorage.dna_session` trên `/khoahoc/`)
- Test: bấm 2 lần cùng ngày → chỉ ghi 1
- **Trigger từ frontend**: thêm nút "✅ Đã hoàn thành ngày X + đã đăng FB" mỗi card ngày trên `/khoahoc/`

#### B2. Logic đúng hạn (1 ngày)
- Cửa sổ 24h kể từ khi bài mở (drip)
- Lỡ ≤1 ngày → vẫn đủ điều kiện
- Helper: `computeOnTime(checkin_ts, day_unlock_ts)`
- Test: simulate 21 timestamps khác nhau

#### B5 (sớm). Admin panel scaffold (3 ngày)
- VPS path mới: `/admin-hocvien/` (Nginx route, basic auth tạm: phuong/PASS)
- Frontend: HTML table list tất cả user, columns: tên / email / studentId / X/21 ngày đúng hạn / X ngày lỡ / form_pre / form_post / fb / video / quà nào mở
- Endpoint mới: `api/admin/list-students.js`, `api/admin/student-detail.js`
- Auth admin: env `ADMIN_PASSWORD` + Phương/Vân account riêng (xem mục Vân bên dưới)
- Nút **Duyệt** placeholder (chưa fire action, B6 mới wire)

**Cuối tuần 1: demo cho Nam test luồng check-in + admin xem list.**

---

### TUẦN 2 — Form webhook + Cron + Mở quà + Cộng đồng

#### B3. Ô nộp link FB + link video + Google Form webhook (2 ngày)
- Trên `/khoahoc/`:
  - Ô nhập link FB cho mỗi ngày (post → `api/submit-fb.js` → `progress.fb_post_link`)
  - Ô nhập link video cuối khoá (post → `api/submit-video.js` → `progress.video_link`)
- Google Apps Script:
  - 2 Google Form (trước + sau) → onSubmit trigger → POST `api/form-webhook.js?type=pre|post&email=X`
  - Tự đánh dấu `progress.form_pre = true` / `form_post = true`
- Endpoint webhook bảo mật bằng `FORM_WEBHOOK_SECRET` env

#### B4. Bộ xét hoàn thành (cron) (1 ngày)
- Vercel Cron Jobs (free 1 hr granularity): `api/cron/check-eligibility.js` chạy hằng ngày 6:00 ICT
- Quét tất cả `progress:*`, set:
  - `special_eligible = days_on_time>=20 && form_pre && form_post` (admin còn duyệt fb_post thủ công)
  - `diamond_eligible = video_link != null` (admin còn duyệt video thủ công)
- Đẩy vào hàng `pending_review:{type}:{email}` để admin xem

#### B6. Nút Duyệt + mở quà + email Resend (2 ngày)
- Endpoint `api/admin/approve.js` POST `{email, type: 'special'|'community', action: 'approve'|'reject'}`
- Phân quyền: special → chỉ Phương; community → Phương/Vân
- Khi approve special: `special_unlocked=true` → frontend `/khoahoc/` show section "Chuyển Hoá Tâm Thức"
- Khi approve community: `community_unlocked=true`, `community_start_date=today`, `community_expiry_date=today+30d`
- Gửi 3 email Resend (template sẵn trong brief):
  - `api/send-gift-special.js`
  - `api/send-gift-diamond.js`
  - `api/send-gift-both.js` (nếu cả 2 cùng approve trong cùng request)

#### B7. Vòng đời Cộng Đồng + gia hạn (2 ngày)
- Cron daily `api/cron/community-expiry.js`:
  - Quét `progress.community_expiry_date < today` → set `community_active = false`
  - Quét trước hết hạn 3 ngày → gửi email nhắc gia hạn 1 lần
- Trang `/khoahoc/` cộng đồng box: hiện ngày bắt đầu + đếm ngược ngày còn lại
- Gia hạn:
  - 2 link SePay mới: gói 3 tháng (giá Nam quyết) + gói 1 năm (giá Nam quyết)
  - IPN handler thêm regex `(?:CD3M|CD1Y)EP[0-9]+` → gia hạn `community_expiry_date += 90/365 days`, set `community_plan`

---

## Thông tin cần Nam cấp trước khi code

| # | Thông tin | Mục đích | Khi nào cần |
|---|-----------|----------|-------------|
| 1 | Email + tên đầy đủ Vân | Tạo admin account thứ 2 (role: community_only) | Trước B5 |
| 2 | 2 link Google Form (trước + sau) | Webhook + dán vào `/khoahoc/` thay placeholder # | Trước B3 |
| 3 | Drive folder share PUBLIC (anyone with link can view) hoặc gửi link file bài 1 trực tiếp | Tôi đã thử fetch `1FC3U1r9kQoUL1O3Su0clBcQlGKiyo8_O` nhưng folder private | Demo brief #4 + B6 mở section "Chuyển Hoá" |
| 4 | Giá gói cộng đồng 3 tháng + 1 năm | Trang thanh toán SePay gia hạn | Trước B7 |
| 5 | Quyết định "đúng hạn" giờ cụ thể nào trong ngày | Brief nói "trước khi bài kế tiếp mở" — bài mở vào giờ kích hoạt; có cần normalize về 0:00 ICT không? | Trước B2 |
| 6 | Email Phương dùng làm admin login (gmail elsa.phongthai? hay tạo riêng?) | Cấp `admin:phuong` | Trước B5 |
| 7 | Nội dung khoá "Chuyển Hoá Tâm Thức - Làm Chủ Cuộc Đời" (slide/video/bài viết) | Sau khi approve thì hiện gì trên trang học | Trước B6 |
| 8 | Nội dung Cộng Đồng 30 ngày (Telegram group / Facebook group / nội dung học?) | Mở quyền = link gì? | Trước B6 |

---

## Rủi ro / không chắc

- **Vercel Cron Free**: 2 cron jobs / project. Đã dự kiến 2 (`check-eligibility` + `community-expiry`) → vừa đủ, không có dư.
- **Upstash Free**: 10K commands/day. Cron quét tất cả user mỗi ngày → tốn ~50 commands/user. Với 100 user = 5K/day → OK. Trên 200 user cần upgrade ($10/tháng).
- **Bảo mật admin panel**: dùng basic auth tạm; lâu dài cần JWT + 2FA nếu có nhiều admin.
- **Phân biệt "bài đã đăng FB rồi" vs "chưa đăng"**: hệ chỉ có học viên dán link. Không tự crawl FB được. Brief đã chấp nhận duyệt tay → OK.
- **Không có tính năng "chấm điểm bài tập"**: brief chỉ yêu cầu điểm danh xong/không xong, không có grading. Khớp.

---

## Tổng chi phí (ngày công)

- Tuần 1: B1 (2) + B2 (1) + B5 (3) = 6 ngày
- Tuần 2: B3 (2) + B4 (1) + B6 (2) + B7 (2) = 7 ngày
- Buffer test + bug fix: 2 ngày
- **Tổng: ~15 ngày làm việc** (3 tuần thực tế nếu xen công việc khác)

---

## Phê duyệt

Nam đọc xong, OK thì tôi bắt đầu B1 ngay. Nếu thay đổi thứ tự / scope / bỏ phần nào → reply trước khi code.

Cần Nam cấp tối thiểu **info #1, #5, #6, #7, #8** trước khi vào tuần 1; #2, #3, #4 có thể cấp khi đến lúc cần.
