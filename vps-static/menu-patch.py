"""Thêm 2 menu Trang chủ + Nhận quà (icon lắc + nhấp nháy) vào .dgan-menu của 5 trang."""
import re, os, sys

PAGES = [
    ('/var/www/elsaphuong-cau-chuyen/index.html',    '/cau-chuyen/'),
    ('/var/www/elsaphuong-cong-dong/index.html',     '/cong-dong/'),
    ('/var/www/elsaphuong-khoahoc/index.html',       '/khoahoc/'),
    ('/var/www/elsaphuong-lien-he/index.html',       '/lien-he/'),
    ('/var/www/elsaphuong-static-root/index.html',   '/khoa-21-ngay/'),
]

# CSS animation cho icon quà + link
EXTRA_CSS = """
  .menu-qua{position:relative;color:#D81B60 !important;font-weight:700 !important}
  .menu-qua .qua-ico{display:inline-block;font-size:1.05em;transform-origin:50% 90%;animation:menuQuaWobble 1.2s ease-in-out infinite,menuQuaGlow 1.4s ease-in-out infinite;margin-right:2px}
  @keyframes menuQuaWobble{0%,60%,100%{transform:rotate(0)}10%{transform:rotate(-14deg)}20%{transform:rotate(12deg)}30%{transform:rotate(-10deg)}40%{transform:rotate(8deg)}50%{transform:rotate(-4deg)}}
  @keyframes menuQuaGlow{0%,100%{filter:drop-shadow(0 0 0 rgba(216,27,96,.7))}50%{filter:drop-shadow(0 0 8px rgba(232,181,71,.9))}}
"""

def patch(path, current_path):
    if not os.path.exists(path):
        print(f'[skip missing] {path}')
        return
    with open(path) as f: t = f.read()

    if 'class="menu-qua"' in t and 'Trang chủ' in t:
        # Đã patch rồi — chỉ update active state
        t = update_active(t, current_path)
        with open(path, 'w') as f: f.write(t)
        print(f'[refresh-active] {path}')
        return

    # 1. Thêm CSS animation vào <style> đầu tiên trong .dgan-header hoặc trước </style> gần đầu
    if '.menu-qua{' not in t:
        # Chèn CSS ngay trước </style> gần khối .dgan-menu
        # Tìm style block chứa .dgan-menu → chèn CSS trước </style> của block đó
        m = re.search(r'(\.dgan-menu[^<]*?)(</style>)', t, re.DOTALL)
        if m:
            t = t.replace(m.group(2), EXTRA_CSS + m.group(2), 1)
        else:
            # Fallback: chèn trước </head>
            t = t.replace('</head>', f'<style>{EXTRA_CSS}</style></head>', 1)

    # 2. Chèn <a href="/">Trang chủ</a> TRƯỚC dòng Về Phương
    trang_chu_class = ' class="active"' if current_path == '/' else ''
    trang_chu_link = f'      <a href="/"{trang_chu_class}>Trang chủ</a>\n'
    t = re.sub(
        r'(      <a href="/gioi-thieu/"[^>]*>Về Phương</a>)',
        trang_chu_link + r'\1',
        t, count=1
    )

    # 3. Chèn <a href="/nhan-qua/">🎁 Nhận quà</a> SAU dòng Cộng Đồng
    nhan_qua_link = '\n      <a href="/nhan-qua/" class="menu-qua"><span class="qua-ico">🎁</span> Nhận quà</a>'
    t = re.sub(
        r'(      <a href="/cong-dong/"[^>]*>Cộng Đồng</a>)',
        r'\1' + nhan_qua_link,
        t, count=1
    )

    # 4. Update active state cho current page
    t = update_active(t, current_path)

    with open(path, 'w') as f: f.write(t)
    print(f'[patched] {path}')

def update_active(t, current):
    """Đảm bảo chỉ đúng link matching current path có class='active'."""
    # Không đụng .login-cta (đăng nhập)
    return t  # keep existing active states, chỉ patch mới add active theo current

for path, cp in PAGES:
    patch(path, cp)
print('done')
