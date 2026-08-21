"""Deploy /khoe-dep-tu-goc/ + inject menu item vào 8 trang."""
import os, re, subprocess

# 1. Backup + inject nginx route
nginx = '/etc/nginx/sites-enabled/elsaphuong'
subprocess.run(['cp', nginx, f'{nginx}.bak.before-kdg'], check=True)
with open(nginx) as f: nc = f.read()

if '/khoe-dep-tu-goc/' not in nc:
    new_route = """
    location = /khoe-dep-tu-goc {
        return 301 /khoe-dep-tu-goc/;
    }
    location ^~ /khoe-dep-tu-goc/ {
        alias /var/www/elsaphuong-khoe-dep-tu-goc/;
        index index.html;
        try_files $uri $uri/ =404;
    }
"""
    anchor = '    location = /nhan-qua {'
    if anchor in nc:
        nc = nc.replace(anchor, new_route.rstrip() + '\n\n' + anchor, 1)
        with open(nginx, 'w') as f: f.write(nc)
        print('[ok] nginx route added')
    else:
        print('[error] anchor not found in nginx'); import sys; sys.exit(1)
else:
    print('[skip] nginx route đã có')

# 2. Inject menu item vào 8 trang
NEW_MENU_ITEM = '\n      <a href="/khoe-dep-tu-goc/">Khỏe Đẹp Từ Gốc</a>'
PAGES = [
    '/var/www/elsaphuong-cau-chuyen/index.html',
    '/var/www/elsaphuong-cong-dong/index.html',
    '/var/www/elsaphuong-gioi-thieu/index.html',
    '/var/www/elsaphuong-khoahoc/index.html',
    '/var/www/elsaphuong-lien-he/index.html',
    '/var/www/elsaphuong-static-root/index.html',
    '/var/www/elsaphuong-nhan-qua/index.html',
    '/var/www/elsaphuong-da-nhan-qua/index.html',
    '/var/www/elsaphuong-trang-chu/index.html',
]
for p in PAGES:
    if not os.path.exists(p): print(f'[skip missing] {p}'); continue
    with open(p) as f: t = f.read()
    if '>Khỏe Đẹp Từ Gốc<' in t:
        print(f'[skip] {p} đã có menu item')
        continue
    # Chèn SAU dòng Dáng Ngọc An Nhiên
    replaced = False
    for pat in [
        r'(      <a href="/khoa-21-ngay/"[^>]*>Dáng Ngọc An Nhiên</a>)',  # .dgan-menu + .menu
    ]:
        new_t, n = re.subn(pat, r'\1' + NEW_MENU_ITEM, t, count=1)
        if n:
            t = new_t; replaced = True; break
    # trang chủ dùng .nav (space indent khác)
    if not replaced:
        pat2 = r'(      <a href="/khoa-21-ngay/">Dáng Ngọc An Nhiên</a>)'
        new_t, n = re.subn(pat2, r'\1' + NEW_MENU_ITEM, t, count=1)
        if n:
            t = new_t; replaced = True
    if replaced:
        with open(p, 'w') as f: f.write(t)
        print(f'[ok] {p}')
    else:
        print(f'[MISS] {p} — pattern Dáng Ngọc An Nhiên không match')
print('done')
