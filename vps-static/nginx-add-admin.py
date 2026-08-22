"""Thêm route /admin/ vào nginx elsaphuong."""
import subprocess
nginx = '/etc/nginx/sites-enabled/elsaphuong'
subprocess.run(['cp', nginx, nginx + '.bak.before-admin'], check=True)
with open(nginx) as f: nc = f.read()

if '/admin/' in nc and 'elsaphuong-admin' in nc:
    print('[skip] /admin/ route đã có'); import sys; sys.exit(0)

new_block = """
    location = /admin {
        return 301 /admin/;
    }
    location ^~ /admin/ {
        alias /var/www/elsaphuong-admin/;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
        add_header X-Robots-Tag "noindex, nofollow" always;
    }
"""
anchor = '    location = /nhan-qua {'
nc = nc.replace(anchor, new_block.rstrip() + '\n\n' + anchor, 1)
with open(nginx, 'w') as f: f.write(nc)
print('[ok] added /admin/ route')
