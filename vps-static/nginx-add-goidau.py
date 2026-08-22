"""Thêm route /thanh-toan-goi-dau/ + /cam-on-goi-dau/ + wire nút card 1 trên /khoe-dep-tu-goc/."""
import re, subprocess

nginx = '/etc/nginx/sites-enabled/elsaphuong'
subprocess.run(['cp', nginx, nginx + '.bak.before-goidau'], check=True)
with open(nginx) as f: nc = f.read()

if '/thanh-toan-goi-dau/' not in nc:
    new_block = """
    location = /thanh-toan-goi-dau {
        return 301 /thanh-toan-goi-dau/;
    }
    location ^~ /thanh-toan-goi-dau/ {
        alias /var/www/elsaphuong-thanh-toan-goi-dau/;
        index index.html;
        try_files $uri $uri/ /thanh-toan-goi-dau/index.html;
    }

    location = /cam-on-goi-dau {
        return 301 /cam-on-goi-dau/;
    }
    location ^~ /cam-on-goi-dau/ {
        alias /var/www/elsaphuong-cam-on-goi-dau/;
        index index.html;
        try_files $uri $uri/ =404;
    }
"""
    anchor = '    location = /nhan-qua {'
    nc = nc.replace(anchor, new_block.rstrip() + '\n\n' + anchor, 1)
    with open(nginx, 'w') as f: f.write(nc)
    print('[ok] nginx routes added')
else:
    print('[skip] routes đã có')

# Wire nút "Xem chi tiết →" trên card 1 (Gội Đầu Thông Khí) → /thanh-toan-goi-dau/
kdg = '/var/www/elsaphuong-khoe-dep-tu-goc/index.html'
with open(kdg) as f: kt = f.read()
old_btn = '<a class="btn" href="https://goi-dau-thong-khi.elsa-phongthai.chatgpt.site/" target="_blank" rel="noopener">Xem chi tiết →</a>'
new_btn = '<a class="btn" href="/thanh-toan-goi-dau/">Đăng ký ngay →</a>'
if old_btn in kt:
    kt = kt.replace(old_btn, new_btn, 1)
    with open(kdg, 'w') as f: f.write(kt)
    print('[ok] card 1 button wired')
elif '/thanh-toan-goi-dau/' in kt:
    print('[skip] card đã trỏ /thanh-toan-goi-dau/')
else:
    print('[warn] card 1 button pattern không match, giữ nguyên')
print('done')
