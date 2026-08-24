"""Wire ?ref=EPXXX capture cho landing pages + inject referred_by khi thanh toán."""
import re, os

# Snippet capture (paste vào trước </body> mọi landing page)
CAPTURE_JS = '''<script>
// Capture ?ref=EPXXX từ URL vào localStorage — giữ 30 ngày để tracking affiliate
(function(){
  try {
    const u = new URLSearchParams(location.search);
    const r = u.get('ref');
    if (r && /^EP\\d{6}$/i.test(r)) {
      localStorage.setItem('elsa_ref', r.toUpperCase());
      localStorage.setItem('elsa_ref_at', String(Date.now()));
    }
    // Expire sau 30 ngày
    const at = Number(localStorage.getItem('elsa_ref_at')||0);
    if (at && Date.now() - at > 30*86400*1000) {
      localStorage.removeItem('elsa_ref'); localStorage.removeItem('elsa_ref_at');
    }
  } catch(_){}
})();
</script>
'''

LANDING_PAGES = [
    '/var/www/elsaphuong-trang-chu/index.html',
    '/var/www/elsaphuong-static-root/index.html',       # /khoa-21-ngay/
    '/var/www/elsaphuong-khoe-dep-tu-goc/index.html',
    '/var/www/elsaphuong-gioi-thieu/index.html',
    '/var/www/elsaphuong-cong-dong/index.html',
    '/var/www/elsaphuong-nhan-qua/index.html',
    '/var/www/elsaphuong-thanh-toan-21ngay-dangngoc/index.html',
    '/var/www/elsaphuong-thanh-toan-goi-dau/index.html',
]

for p in LANDING_PAGES:
    if not os.path.exists(p): print(f'[skip missing] {p}'); continue
    with open(p, encoding='utf-8') as f: t = f.read()
    if 'elsa_ref' in t:
        print(f'[skip] {p} đã có')
        continue
    if '</body>' not in t:
        print(f'[warn] {p} không có </body>'); continue
    t = t.replace('</body>', CAPTURE_JS + '</body>', 1)
    with open(p, 'w', encoding='utf-8') as f: f.write(t)
    print(f'[ok capture] {p}')

# Payment pages: inject referred_by vào body customers khi submit
PAYMENT_PAGES = [
    '/var/www/elsaphuong-thanh-toan-21ngay-dangngoc/index.html',
    '/var/www/elsaphuong-thanh-toan-goi-dau/index.html',
]
INJECT_PATTERN = "value: {\n      name: customerName,\n      phone: customerPhone,\n      email: customerEmail,\n      code: orderCode,\n      time: new Date().toISOString()\n    }"
INJECT_NEW = """value: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      code: orderCode,
      referred_by: (function(){try{return localStorage.getItem('elsa_ref')||null}catch(_){return null}})(),
      time: new Date().toISOString()
    }"""

for p in PAYMENT_PAGES:
    if not os.path.exists(p): continue
    with open(p, encoding='utf-8') as f: t = f.read()
    if 'referred_by:' in t:
        print(f'[skip pay] {p} đã inject')
        continue
    if INJECT_PATTERN in t:
        t = t.replace(INJECT_PATTERN, INJECT_NEW, 1)
        with open(p, 'w', encoding='utf-8') as f: f.write(t)
        print(f'[ok payment inject] {p}')
    else:
        print(f'[WARN payment] {p} pattern không match — cần inject thủ công')
print('done')
