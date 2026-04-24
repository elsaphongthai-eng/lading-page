import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the text globally
content = content.replace(
    'Vì Phương không bán một khoá học,',
    'Vì Phương không bán một khoá&nbsp;học,'
)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_nbsp.py")
