import re

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace variables
content = content.replace('--rose: #C0687A;', '--rose: #E8275A;')
content = content.replace('--rose-light: #f5e6e9;', '--rose-light: #fde8ee;')
content = content.replace('--rose-dark: #9e4f62;', '--rose-dark: #c41e48;')
content = content.replace('--rose-pale: #fdf3f5;', '--rose-pale: #fff0f4;')
content = content.replace('--cream: #fdf8f5;', '--cream: #fff8fa;')

# Helper function to easily replace inside a block
def update_block(css, selector, replacements):
    pattern = r'(' + re.escape(selector) + r'\s*\{)([^}]*)(\})'
    def repl(m):
        block = m.group(2)
        for old_val, new_val in replacements:
            block = block.replace(old_val, new_val)
        return m.group(1) + block + m.group(3)
    return re.sub(pattern, repl, css)

content = update_block(content, '.topbar', [
    ('background: var(--dark);', 'background: var(--rose);'),
    ('color: #e8c8cf;', 'color: white;')
])

content = update_block(content, '.hero', [
    ('background: linear-gradient(160deg, #2a1a1e 0%, #4a2530 50%, #2a1a1e 100%);', 'background: linear-gradient(160deg, #fff0f4 0%, #fde8ee 50%, #fff0f4 100%);'),
    ('color: var(--white);', 'color: var(--dark);')
])
content = update_block(content, '.hero::before', [('rgba(192,104,122,0.25)', 'rgba(232,39,90,0.1)')])
content = update_block(content, '.hero h1', [('color: var(--white);', 'color: var(--dark);')])
content = update_block(content, '.hero h1 span', [('color: #e8a0b0;', 'color: var(--rose);')])
content = update_block(content, '.hero-sub', [('color: #d4a0ac;', 'color: var(--rose);')])
content = update_block(content, '.hero-desc', [('color: #e8d8db;', 'color: var(--text);')])
content = update_block(content, '.hero-note', [('color: #b08090;', 'color: var(--text-light);')])

content = update_block(content, '.cham-bg', [
    ('background: linear-gradient(160deg, #2a1a1e 0%, #3d2030 100%);', 'background: #fff3e0;'), 
    ('color: white;', 'color: var(--dark);')
])
content = update_block(content, '.cham-bg .sec-title', [('color: white;', 'color: var(--dark);')])
content = update_block(content, '.cham-bg .sec-label', [('color: #e8a0b0;', 'color: var(--rose);')])
content = update_block(content, '.cham-method-title', [('color: white;', 'color: var(--rose);')])
content = update_block(content, '.cham-method-sub', [('color: #d4a0ac;', 'color: var(--text-light);')])

content = update_block(content, '.step-card', [
    ('background: rgba(255,255,255,0.04);', 'background: white;'),
    ('border: 1px solid rgba(192,104,122,0.25);', 'border: 1px solid var(--rose-light);')
])
content = update_block(content, '.step-letter', [('color: rgba(192,104,122,0.2);', 'color: var(--rose-light);')])
content = update_block(content, '.step-tag', [('color: #e8a0b0;', 'color: var(--rose);')])
content = update_block(content, '.step-title', [('color: white;', 'color: var(--rose);')])
content = update_block(content, '.step-body', [('color: #d4c8cb;', 'color: var(--text);')])
content = update_block(content, '.step-items li', [('color: #e8d8db;', 'color: var(--text);')])
content = update_block(content, '.step-items strong', [('color: #f0d0d8;', 'color: var(--dark);')])
content = update_block(content, '.step-result', [('background: rgba(192,104,122,0.12);', 'background: var(--rose-pale);')])
content = update_block(content, '.step-result-label', [('color: #e8a0b0;', 'color: var(--rose);')])
content = update_block(content, '.step-result p', [('color: #e8d8db;', 'color: var(--text);')])

content = update_block(content, '.cham-closing', [('border: 1px solid rgba(192,104,122,0.3);', 'border: 1px dashed var(--rose);')])
content = update_block(content, '.cham-closing p', [('color: #d4c8cb;', 'color: var(--text);')])
content = update_block(content, '.cham-closing strong', [('color: #f0d0d8;', 'color: var(--rose);')])

content = update_block(content, '.gifts-bg', [
    ('background: var(--dark);', 'background: #fff8fa;'), 
    ('color: white;', 'color: var(--dark);')
])
content = update_block(content, '.gifts-bg .sec-label', [('color: #e8a0b0;', 'color: var(--rose);')])
content = update_block(content, '.gifts-bg .sec-title', [('color: white;', 'color: var(--rose);')])
content = update_block(content, '.gifts-intro', [('color: #d4c8cb;', 'color: var(--text);')])
content = update_block(content, '.gift-table tr', [('border-bottom: 1px solid rgba(192,104,122,0.15);', 'border-bottom: 1px solid var(--rose-light);')])
content = update_block(content, '.gift-table tr:last-child', [('background: rgba(192,104,122,0.1);', 'background: var(--rose-pale);')])
content = update_block(content, '.gift-table td:first-child', [('color: #e8d8db;', 'color: var(--text);')])
content = update_block(content, '.gift-table td:first-child strong', [('color: #f0c8d4;', 'color: var(--rose);')])
content = update_block(content, '.gift-total-row td', [('color: white !important;', 'color: var(--dark) !important;')])
content = update_block(content, '.gifts-note', [('color: #e8a0b0;', 'color: var(--rose);')])

content = update_block(content, '.register-bg', [
    ('background: linear-gradient(160deg, #2a1a1e 0%, #4a2530 100%);', 'background: #fff3e0;'),
    ('color: white;', 'color: var(--dark);')
])
content = update_block(content, '.register-bg h2', [('color: white;', 'color: var(--rose);')])
content = update_block(content, '.register-bg p', [('color: #d4a0ac;', 'color: var(--text-light);')])
content = update_block(content, '.register-note', [('color: #b08090;', 'color: var(--text-light);')])

content = update_block(content, 'footer', [
    ('background: var(--dark);', 'background: white; border-top: 1px solid #f0e0e4;'),
    ('color: #b08090;', 'color: var(--text-light);')
])

with open(r'c:\Users\LAM DAT\Desktop\lading-page-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Restyle complete!")
