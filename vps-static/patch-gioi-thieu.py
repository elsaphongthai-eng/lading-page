"""Thêm Trang chủ + Nhận quà vào menu gioi-thieu."""
p = '/var/www/elsaphuong-gioi-thieu/index.html'
with open(p) as f: t = f.read()

if 'menu-qua' in t and '>Trang chủ<' in t:
    print('[skip] đã patch'); import sys; sys.exit(0)

# Inject CSS animation trước dòng .menu a{...}
css = """  .menu a.menu-qua{color:#D81B60 !important;font-weight:700}
  .menu a.menu-qua .qua-ico{display:inline-block;font-size:1.05em;transform-origin:50% 90%;animation:menuQuaWobble 1.2s ease-in-out infinite,menuQuaGlow 1.4s ease-in-out infinite;margin-right:2px}
  @keyframes menuQuaWobble{0%,60%,100%{transform:rotate(0)}10%{transform:rotate(-14deg)}20%{transform:rotate(12deg)}30%{transform:rotate(-10deg)}40%{transform:rotate(8deg)}50%{transform:rotate(-4deg)}}
  @keyframes menuQuaGlow{0%,100%{filter:drop-shadow(0 0 0 rgba(216,27,96,.7))}50%{filter:drop-shadow(0 0 8px rgba(232,181,71,.9))}}
"""

anchor_css = '  .menu a{position:relative;color:var(--choco);transition:color .25s}'
if anchor_css in t and 'menu-qua' not in t:
    t = t.replace(anchor_css, css + anchor_css, 1)

# Chèn Trang chủ TRƯỚC Về Phương
old_ve_phuong = '      <a href="/gioi-thieu/" class="active">Về Phương</a>'
new_menu = '      <a href="/">Trang chủ</a>\n' + old_ve_phuong
t = t.replace(old_ve_phuong, new_menu, 1)

# Chèn Nhận quà SAU Cộng Đồng
old_cong_dong = '      <a href="/cong-dong/">Cộng Đồng</a>'
new_cd = old_cong_dong + '\n      <a href="/nhan-qua/" class="menu-qua"><span class="qua-ico">🎁</span> Nhận quà</a>'
t = t.replace(old_cong_dong, new_cd, 1)

with open(p, 'w') as f: f.write(t)
print('[ok] patched gioi-thieu')
