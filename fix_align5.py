import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the universal selector and inject global HTML/Body and Img rules
old_universal = '* { margin: 0; padding: 0; box-sizing: border-box; }'
new_universal = """html, body {
  max-width: 100%;
  overflow-x: hidden;
}

* {
  margin: 0; padding: 0; box-sizing: border-box;
  max-width: 100%;
}

img {
  max-width: 100%;
  height: auto;
}"""

if old_universal in content:
    content = content.replace(old_universal, new_universal)
elif '* { margin: 0; padding: 0; box-sizing: border-box; }\n\n  h1, h2, h3, h4, .sec-label, .sec-title, .hero-sub { text-wrap: balance; }\n  p, li { text-wrap: pretty; }' in content:
    content = content.replace(
        '* { margin: 0; padding: 0; box-sizing: border-box; }\n\n  h1, h2, h3, h4, .sec-label, .sec-title, .hero-sub { text-wrap: balance; }\n  p, li { text-wrap: pretty; }',
        new_universal + '\n\n  h1, h2, h3, h4, .sec-label, .sec-title, .hero-sub { text-wrap: balance; }\n  p, li { text-wrap: pretty; }'
    )
elif '* {\n  margin: 0; padding: 0; box-sizing: border-box;\n  max-width: 100%;\n}' not in content:
    # Safest fallback
    content = content.replace(
        '<style>',
        f'<style>\n{new_universal}'
    )

# 2. Append the new Media Query safely before </style>
new_media_query = """
@media (max-width: 768px) {
  body, div, section, p, h1, h2, h3, h4, li, span {
    max-width: 100% !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    white-space: normal !important;
  }
  
  .container, .inner, .prose, .section, .cham-inner, .deliver-inner, .value-inner, .promise-inner, .faq-inner, .ps-inner {
    padding-left: 16px !important;
    padding-right: 16px !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
"""
content = content.replace('</style>', new_media_query)


with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix_align5.")
