import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all hrefs for this specific text
content = re.sub(
    r'<a\s+href="[^"]*"([^>]*)>(MÌNH MUỐN VƯƠN MÌNH RỰC RỠ NGAY BÂY GIỜ!)</a>',
    r'<a href="https://www.elsaphuong.com/thanh-toan"\1>\2</a>',
    content
)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_cta.py")
