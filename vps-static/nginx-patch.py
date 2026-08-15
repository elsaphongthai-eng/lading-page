"""Đổi location = / từ 301 redirect sang serve trang chủ mới."""
p = '/etc/nginx/sites-enabled/elsaphuong'
with open(p) as f: t = f.read()

old = """    location = / {
        return 301 /khoa-21-ngay/;
    }"""

new = """    location = / {
        root /var/www/elsaphuong-trang-chu;
        try_files /index.html =404;
    }"""

if old in t:
    t = t.replace(old, new)
    with open(p, 'w') as f: f.write(t)
    print('[ok] location = / đã đổi sang serve trang-chu')
elif 'root /var/www/elsaphuong-trang-chu' in t:
    print('[skip] đã sửa rồi')
else:
    print('[error] không tìm thấy pattern location = /')
    import sys; sys.exit(1)
