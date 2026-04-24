import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove explicit overflow: hidden and adjust container padding
content = content.replace(
    'overflow: hidden;',
    'overflow: visible;'
).replace(
    'overflow: hidden !important;',
    'overflow: visible !important;'
).replace(
    'overflow:hidden;',
    'overflow:visible;'
)

# Update the wrapper we created last time that had padding: 0 16px;
content = content.replace(
    '.gifts-inner {\n    width: 100%;\n    box-sizing: border-box;\n    padding: 0 16px;\n    overflow: visible;',
    '.gifts-inner {\n    width: 100%;\n    max-width: 100%;\n    box-sizing: border-box;\n    padding: 0 20px;'
)

# Add media query to ensure blocks stack properly on mobile layout
new_media_query = """
  @media (max-width: 768px) {
    .bonus-grid, .gift-grid, .bonus-item, .gift-item, .gift-table, .gift-table tbody, .gift-table tr, .gift-table td {
      width: 100% !important;
      max-width: 100% !important;
      text-align: left !important;
      overflow: visible !important;
      display: block !important;
      box-sizing: border-box !important;
    }
    .gift-table td {
      padding: 12px 0 !important;
    }
  }
</style>
"""
if '@media (max-width: 768px)' not in content:
    content = content.replace('</style>', new_media_query)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_align4.")
