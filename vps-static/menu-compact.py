"""Nén menu ngang: nowrap từng item, giảm gap+font, logo thu gọn."""
import re

# CSS override chung — chèn vào </head> của mỗi trang, chạy sau CSS gốc
CSS_OVERRIDE = """<style id="menu-compact-fix">
  /* .dgan-menu — 5 trang */
  .dgan-wrap{max-width:1200px !important;padding:0 20px !important;gap:16px}
  .dgan-menu{gap:18px !important;font-size:13.5px !important;flex-wrap:nowrap !important;align-items:center !important}
  .dgan-menu a{white-space:nowrap !important;line-height:1.2 !important}
  .dgan-logo{font-size:18px !important;white-space:nowrap;flex-shrink:0}
  .dgan-logo span{font-size:14px !important}
  @media (max-width:900px){
    .dgan-menu{gap:14px !important;font-size:12.5px !important}
    .dgan-logo{font-size:16px !important}
    .dgan-logo span{font-size:12px !important}
  }
  @media (max-width:768px){
    /* mobile giữ burger như cũ, menu vẫn column */
    .dgan-menu{flex-wrap:wrap !important}
  }

  /* .menu (gioi-thieu) — cùng nguyên tắc */
  header .wrap.nav{max-width:1200px !important;gap:16px}
  .menu{gap:18px !important;font-size:13.5px !important;flex-wrap:nowrap !important;align-items:center !important}
  .menu a{white-space:nowrap !important;line-height:1.2 !important}
  .logo{font-size:18px !important;white-space:nowrap;flex-shrink:0;line-height:1.15 !important}
  .logo span{font-size:14px !important}
  @media (max-width:900px){
    .menu{gap:14px !important;font-size:12.5px !important}
    .logo{font-size:16px !important}
    .logo span{font-size:12px !important}
  }
  @media (max-width:768px){
    .menu{flex-wrap:wrap !important}
  }
</style>"""

PAGES = [
    '/var/www/elsaphuong-cau-chuyen/index.html',
    '/var/www/elsaphuong-cong-dong/index.html',
    '/var/www/elsaphuong-gioi-thieu/index.html',
    '/var/www/elsaphuong-khoahoc/index.html',
    '/var/www/elsaphuong-lien-he/index.html',
    '/var/www/elsaphuong-static-root/index.html',
    '/var/www/elsaphuong-nhan-qua/index.html',
    '/var/www/elsaphuong-da-nhan-qua/index.html',
]

for p in PAGES:
    try:
        with open(p) as f: t = f.read()
    except FileNotFoundError:
        print(f'[skip missing] {p}'); continue
    if 'id="menu-compact-fix"' in t:
        # Đã có → remove old + thay mới
        t = re.sub(r'<style id="menu-compact-fix">.*?</style>', CSS_OVERRIDE, t, count=1, flags=re.DOTALL)
    else:
        t = t.replace('</head>', CSS_OVERRIDE + '</head>', 1)
    with open(p, 'w') as f: f.write(t)
    print(f'[ok] {p}')
print('done')
