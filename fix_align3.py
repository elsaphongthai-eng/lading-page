import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure container `.gifts-inner` gets the CSS
content = content.replace(
    '.gifts-inner {',
    '.gifts-inner {\n    width: 100%;\n    box-sizing: border-box;\n    padding: 0 16px;\n    overflow: hidden;'
)

# Insert the media query into <style>
media_query = """
  @media (max-width: 600px) {
    .gift-item, .bonus-item, .gift-list li, .gift-table td, .gift-table td:first-child { 
      text-align: left !important; 
      padding-right: 16px !important; 
      overflow: hidden !important; 
      word-wrap: break-word;
    }
  }
</style>
"""
content = content.replace('</style>', media_query)

# Change "chuyển hoá." to "chuyển&nbsp;hoá."
content = content.replace(
    'Phương trao cho Bạn một sự chuyển hoá.</strong></p>',
    'Phương trao cho Bạn một sự chuyển&nbsp;hoá.</strong></p>'
)

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_align3.")
