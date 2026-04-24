import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Responsive Wrap
content = content.replace(
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    '* { margin: 0; padding: 0; box-sizing: border-box; }\n\n  h1, h2, h3, h4, .sec-label, .sec-title, .hero-sub { text-wrap: balance; }\n  p, li { text-wrap: pretty; }'
)

# 2. Phóng to + Màu xanh lá đậm #2d6a4f
# "Vì sao chúng ta học mãi..."
content = content.replace(
    '<span class="sec-label">Vì sao chúng ta học mãi, đọc mãi... mà cuộc đời vẫn không thay đổi?</span>',
    '<span class="sec-label" style="font-size: 1.25rem; font-weight: bold; color: #2d6a4f; text-transform: none; letter-spacing: normal;">Vì sao chúng ta học mãi, đọc mãi... mà cuộc đời vẫn không thay đổi?</span>'
)
# "Phương đã từng là một 'chiếc ly..."
content = content.replace(
    '<span class="sec-label">Phương đã từng là một "chiếc ly không đáy" như thế…</span>',
    '<span class="sec-label" style="font-size: 1.25rem; font-weight: bold; color: #2d6a4f; text-transform: none; letter-spacing: normal;">Phương đã từng là một "chiếc ly không đáy" như thế…</span>'
)
# "Chuyển hoá xuất hiện khi thay đổi bắt đầu đúng chỗ"
content = content.replace(
    '<h3 class="cham-method-sub">Chuyển hoá xuất hiện khi thay đổi bắt đầu đúng chỗ</h3>',
    '<h3 class="cham-method-sub" style="color: #2d6a4f; font-weight: bold;">Chuyển hoá xuất hiện khi thay đổi bắt đầu đúng chỗ</h3>'
)
# "Vì 90% chương trình ..."
content = content.replace(
    '<p style="color:#E8275A; font-weight:600;">Vì 90% chương trình phát triển bản thân hiện nay bắt đầu từ M (Kỹ năng, thói quen, ngoại hình) mà bỏ qua <strong style="color:#E8275A">C, H, A. Nền móng chưa có, xây gì cũng đổ.</strong></p>',
    '<p style="color:#2d6a4f; font-weight:600;">Vì 90% chương trình phát triển bản thân hiện nay bắt đầu từ M (Kỹ năng, thói quen, ngoại hình) mà bỏ qua <strong style="color:#2d6a4f">C, H, A. Nền móng chưa có, xây gì cũng đổ.</strong></p>'
)
# "Để đảm bảo Bạn không đi một mình..."
content = content.replace(
    '<span class="sec-label" style="text-align:center;">Để đảm bảo Bạn không đi một mình và đạt được kết quả thật, Phương thiết kế một lộ trình đồng hành sát sao:</span>',
    '<span class="sec-label" style="text-align:center; color:#2d6a4f; font-weight:bold; font-size: 1.1rem; text-transform:none; letter-spacing:normal;">Để đảm bảo Bạn không đi một mình và đạt được kết quả thật, Phương thiết kế một lộ trình đồng hành sát sao:</span>'
)
# Đầu tư một lần...
content = content.replace(
    '<h2 class="sec-title" style="text-align:center;">Đầu tư một lần, thay đổi cả đời</h2>',
    '<h2 class="sec-title" style="text-align:center; color: #2d6a4f;">Đầu tư một lần,<br>thay đổi cả đời</h2>'
)
# Vì Phương không bán...
content = content.replace(
    '<p><strong style="color:#E8275A; font-size:18px;">Vì Phương không bán một khoá học, Phương trao cho Bạn một sự chuyển hoá.</strong></p>',
    '<p><strong style="color:#2d6a4f; font-size:18px;">Vì Phương không bán một khoá học,<br>Phương trao cho Bạn một sự chuyển hoá.</strong></p>'
)
# Đừng để nỗi sợ...
content = content.replace(
    '<p style="font-size: 18px;">Lời kết: Đừng để nỗi sợ hay sự bận rộn ngăn cản Bạn trở về với chính mình.</p>',
    '<p style="font-size: 18px; color: #2d6a4f; font-weight: bold;">Đừng để nỗi sợ hay sự bận rộn<br>ngăn cản Bạn trở về với chính mình</p>'
)

# 3. Đổi màu xanh lá đoạn Hero desc:
content = content.replace(
    '<p class="hero-desc" style="color: var(--text); font-weight:500; font-size:17px;">Ngay cả khi hoàn cảnh chưa thay đổi. Đừng để bản thân "ngủ quên" trong những vai trò và đánh mất chính mình thêm nữa.</p>',
    '<p class="hero-desc" style="color: #2d6a4f; font-weight:500; font-size:17px;">Ngay cả khi hoàn cảnh chưa thay đổi. Đừng để bản thân "ngủ quên" trong những vai trò và đánh mất chính mình thêm nữa.</p>'
)
# Also check if it was using #E8275A just in case the previous state had something else:
content = content.replace(
    '<p class="hero-desc" style="color:#E8275A; font-weight:500; font-size:17px;">Ngay cả khi hoàn cảnh chưa thay đổi. Đừng để bản thân "ngủ quên" trong những vai trò và đánh mất chính mình thêm nữa.</p>',
    '<p class="hero-desc" style="color: #2d6a4f; font-weight:500; font-size:17px;">Ngay cả khi hoàn cảnh chưa thay đổi. Đừng để bản thân "ngủ quên" trong những vai trò và đánh mất chính mình thêm nữa.</p>'
)

# 4. Ảnh Hero (từ tròn sang hình chữ nhật, bo góc 12px)
hero_img_css = """  .hero img {
    width: 100%;
    max-width: 320px;
    height: auto;
    border-radius: 12px;
    object-fit: cover;
    margin: 0 auto 36px;
    display: block;
    box-shadow: 0 10px 30px rgba(192,104,122,0.2);
  }"""
old_hero_img_css = re.search(r'\.hero img\s*\{[^}]*\}', content).group(0)
content = content.replace(old_hero_img_css, hero_img_css)

# 5. Di chuyển hình ảnh Trước Sau:
# Lấy HTML của thẻ img
img_tag = '    <img src="HÌNH TRUOC - SAU.jpg" alt="Hành trình của Phương" class="photo-full">'
# Xoá ảnh khỏi vị trí cũ
content = content.replace(img_tag + '\n', '')
# Đưa ảnh xuống dưới dòng "Đó là lý do Phương ở đây..."
target_line = '<p><strong style="color:#E8275A">Đó là lý do Phương ở đây, để cùng Bạn phá vỡ vòng lặp này.</strong></p>'
content = content.replace(target_line, target_line + '\n' + img_tag)

# 6. Căn phải danh sách quà tặng
# Adding text-align: right to .gift-table td
content = content.replace(
    '.gift-table td {\n    padding: 20px 16px;\n    vertical-align: top;\n    font-size: 15px;\n    line-height: 1.6;\n  }',
    '.gift-table td {\n    padding: 20px 16px;\n    vertical-align: top;\n    font-size: 15px;\n    line-height: 1.6;\n    text-align: right;\n  }'
)
# Ensure content alignment in the first column is also pushed explicitly right
content = content.replace(
    '.gift-table td:first-child {\n    color: var(--text);\n    width: 75%;\n  }',
    '.gift-table td:first-child {\n    color: var(--text);\n    width: 75%;\n    text-align: right;\n  }'
)

# 7. Lời kết
# Remove extra dot in Khai giảng: 06/06/2026.
content = content.replace(
    '<strong style="color:#E8275A">Khai giảng: 06/06/2026.</strong>',
    '<strong style="color:#E8275A">Khai giảng: 06/06/2026</strong>'
)
# Remove standalone dot between lines
content = content.replace(
    '<strong style="color:#E8275A">"CHẠM HÀNH TRÌNH VƯƠN MÌNH RỰC RỠ"</strong>.</strong>',
    '<strong style="color:#E8275A">"CHẠM HÀNH TRÌNH VƯƠN MÌNH RỰC RỠ"</strong></strong>'
)
# Decrease line height for the wrapping block
content = content.replace(
    '<p style="color:#E8275A; font-size:22px; font-weight:700; font-family:\'Playfair Display\', serif; font-style:italic; margin-top:16px;">',
    '<p style="color:#E8275A; font-size:22px; font-weight:700; font-family:\'Playfair Display\', serif; font-style:italic; margin-top:16px; line-height: 1.3;">'
)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied.")
