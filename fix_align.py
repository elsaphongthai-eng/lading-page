import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix alignment of gifts table
content = content.replace(
    '<tr><td><strong style="color:#E8275A !important; font-weight:700;">',
    '<tr><td style="text-align: right;"><strong style="color:#E8275A !important; font-weight:700;">'
)

# Replace image 2 (2).jpg with 4.png
content = content.replace(
    '<img src="2 (2).jpg" alt="Elsa Phương"',
    '<img src="4.png" alt="Elsa Phương"'
)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_align.")
