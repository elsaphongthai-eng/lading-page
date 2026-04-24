import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Neutralize white-space: nowrap globally and add wrap rules
content = content.replace(
    'white-space: nowrap;',
    'white-space: normal;\n    word-wrap: break-word;\n    overflow-wrap: break-word;\n    width: 100%;'
)

# 2. Append the targeted mobile CTA/Gifts rules
media_query = """
@media (max-width: 480px) {
  .cta-btn {
    font-size: 14px !important;
    padding: 16px 12px !important;
    white-space: normal !important;
    word-break: keep-all !important;
  }
  
  .gift-table, .gift-table td, .gift-table th, .bonus-item *, .gift-item *, .gift-list * {
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
"""

content = content.replace('</style>', media_query)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_align6.py")
