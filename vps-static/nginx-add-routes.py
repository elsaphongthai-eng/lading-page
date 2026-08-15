"""Thêm 2 location cho /nhan-qua/ và /da-nhan-qua/ vào nginx elsaphuong."""
p = '/etc/nginx/sites-enabled/elsaphuong'
with open(p) as f: t = f.read()

new_block = """
    location = /nhan-qua {
        return 301 /nhan-qua/;
    }
    location ^~ /nhan-qua/ {
        alias /var/www/elsaphuong-nhan-qua/;
        index index.html;
        try_files $uri $uri/ =404;
    }

    location = /da-nhan-qua {
        return 301 /da-nhan-qua/;
    }
    location ^~ /da-nhan-qua/ {
        alias /var/www/elsaphuong-da-nhan-qua/;
        index index.html;
        try_files $uri $uri/ =404;
    }
"""

if '/nhan-qua/' in t:
    print('[skip] đã có nhan-qua route')
else:
    # Chèn trước "location = /" (khối trang chủ)
    anchor = '    location = / {'
    if anchor in t:
        t = t.replace(anchor, new_block.rstrip() + '\n\n' + anchor, 1)
        with open(p, 'w') as f: f.write(t)
        print('[ok] đã thêm 2 route /nhan-qua/ + /da-nhan-qua/')
    else:
        print('[error] không tìm thấy anchor location = /')
        import sys; sys.exit(1)
