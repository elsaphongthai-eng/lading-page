import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS mapping back to left
content = content.replace(
    '.gift-table td {\n    padding: 20px 16px;\n    vertical-align: top;\n    font-size: 15px;\n    line-height: 1.6;\n    text-align: right;\n  }',
    '.gift-table td {\n    padding: 20px 16px;\n    vertical-align: top;\n    font-size: 15px;\n    line-height: 1.6;\n    text-align: left;\n  }'
)
content = content.replace(
    '.gift-table td:first-child {\n    color: var(--text);\n    width: 75%;\n    text-align: right;\n  }',
    '.gift-table td:first-child {\n    color: var(--text);\n    width: 75%;\n    text-align: left;\n  }'
)

# Revert the inline styles
content = content.replace(
    '<tr><td style="text-align: right;"><strong style="color:#E8275A !important; font-weight:700;">',
    '<tr><td style="text-align: left; padding: 20px 24px;"><strong style="color:#E8275A !important; font-weight:700;">'
)

# Prevent orphans 
content = content.replace(
    '<p><strong style="color:#2d6a4f; font-size:18px;">Vì Phương không bán một khoá học,<br>Phương trao cho Bạn một sự chuyển hoá.</strong></p>',
    '<p style="hyphens: none; overflow-wrap: break-word; word-break: keep-all;"><strong style="color:#2d6a4f; font-size:18px;">Vì Phương không bán một khoá học,<br>Phương trao cho Bạn một sự chuyển hoá.</strong></p>'
)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_align2.")
