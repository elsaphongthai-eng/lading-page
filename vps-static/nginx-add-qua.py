"""Thêm route /qua/ serve PDF quà tặng."""
p = '/etc/nginx/sites-enabled/elsaphuong'
with open(p) as f: t = f.read()

new_block = """
    location /qua/ {
        alias /var/www/elsaphuong-quatang/;
        add_header Content-Disposition "inline";
        add_header X-Robots-Tag "noindex, nofollow" always;
        expires 1h;
    }
"""

if 'location /qua/' in t:
    print('[skip] đã có /qua/ route')
else:
    anchor = '    location = /nhan-qua {'
    if anchor in t:
        t = t.replace(anchor, new_block.rstrip() + '\n\n' + anchor, 1)
        with open(p, 'w') as f: f.write(t)
        print('[ok] thêm route /qua/')
    else:
        print('[error] không tìm thấy anchor'); import sys; sys.exit(1)
