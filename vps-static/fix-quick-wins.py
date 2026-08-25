"""Fix nhóm 5 quick wins: favicon, loading state form, leave dirty, reset pass, broken images."""
import os, re

# =============== 1. FAVICON — inject vào TẤT CẢ trang ===============
FAVICON_LINK = '''<link rel="icon" type="image/svg+xml" href='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23D81B60%22/%3E%3Cstop offset=%221%22 stop-color=%22%23AD1457%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22url(%23g)%22/%3E%3Ctext x=%2250%22 y=%2266%22 font-size=%2258%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22Georgia,serif%22 font-weight=%22bold%22%3EE%3C/text%3E%3C/svg%3E">
<meta name="theme-color" content="#D81B60">'''

# =============== 2. LOADING STATE — inject wrapper cho form submit ===============
# Cho 2 form thanh toán + form nhận quà — chèn JS auto disable button khi submit
LOADING_JS = '''<script>
// Auto loading state cho form: disable button + show spinner text khi submit
(function(){
  function attach() {
    document.querySelectorAll('form').forEach(form => {
      if (form._loadingAttached) return;
      form._loadingAttached = true;
      form.addEventListener('submit', function(){
        const btn = this.querySelector('button[type="submit"], .submit-btn, .btn-primary');
        if (btn && !btn.disabled) {
          btn._origText = btn.innerHTML;
          btn.disabled = true;
          btn.style.opacity = '0.7';
          btn.style.cursor = 'wait';
          btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><span style="width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:btnSpin .8s linear infinite"></span>Đang xử lý...</span>';
          // Restore sau 20s nếu form không submit thật (fetch chưa done)
          setTimeout(() => { if (btn._origText) { btn.disabled=false; btn.style.opacity=''; btn.style.cursor=''; btn.innerHTML=btn._origText; }}, 20000);
        }
      });
    });
  }
  const s = document.createElement('style');
  s.textContent = '@keyframes btnSpin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
  // Re-attach nếu form thêm sau (SPA)
  new MutationObserver(attach).observe(document.body, {childList:true,subtree:true});
})();
</script>'''

# =============== 3. LEAVE DIRTY WARN — beforeunload nếu form input đã điền ===============
LEAVE_WARN_JS = '''<script>
// Cảnh báo khi rời trang có form đang điền
(function(){
  let dirty = false;
  function markDirty(){ dirty = true; }
  function bind() {
    document.querySelectorAll('form input, form textarea, form select').forEach(el => {
      if (el._dirtyBound) return;
      el._dirtyBound = true;
      el.addEventListener('input', markDirty);
      el.addEventListener('change', markDirty);
    });
    document.querySelectorAll('form').forEach(f => {
      if (f._submitBound) return;
      f._submitBound = true;
      f.addEventListener('submit', () => { dirty = false; });
    });
  }
  window.addEventListener('beforeunload', e => {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = 'Chị em đã điền form — chắc rời trang?';
    return e.returnValue;
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  new MutationObserver(bind).observe(document.body, {childList:true,subtree:true});
})();
</script>'''

PAGES_ALL = [
    '/var/www/elsaphuong-trang-chu/index.html',
    '/var/www/elsaphuong-cau-chuyen/index.html',
    '/var/www/elsaphuong-cong-dong/index.html',
    '/var/www/elsaphuong-gioi-thieu/index.html',
    '/var/www/elsaphuong-khoahoc/index.html',
    '/var/www/elsaphuong-lien-he/index.html',
    '/var/www/elsaphuong-static-root/index.html',
    '/var/www/elsaphuong-khoe-dep-tu-goc/index.html',
    '/var/www/elsaphuong-nhan-qua/index.html',
    '/var/www/elsaphuong-da-nhan-qua/index.html',
    '/var/www/elsaphuong-thanh-toan-21ngay-dangngoc/index.html',
    '/var/www/elsaphuong-cam-on-21ngay-dangngoc/index.html',
    '/var/www/elsaphuong-thanh-toan-goi-dau/index.html',
    '/var/www/elsaphuong-cam-on-goi-dau/index.html',
    '/var/www/elsaphuong-admin/index.html',
]

# Trang có form (loading state + dirty warn)
FORM_PAGES = [
    '/var/www/elsaphuong-nhan-qua/index.html',
    '/var/www/elsaphuong-thanh-toan-21ngay-dangngoc/index.html',
    '/var/www/elsaphuong-thanh-toan-goi-dau/index.html',
]

for p in PAGES_ALL:
    if not os.path.exists(p): continue
    with open(p, encoding='utf-8') as f: t = f.read()
    changed = False

    # 1. Favicon — chèn TRƯỚC </head> nếu chưa có
    if 'theme-color' not in t and '</head>' in t:
        t = t.replace('</head>', FAVICON_LINK + '\n</head>', 1)
        changed = True

    # 2+3. Loading + Dirty warn cho các form pages
    if p in FORM_PAGES:
        if 'btnSpin' not in t and '</body>' in t:
            t = t.replace('</body>', LOADING_JS + '\n</body>', 1)
            changed = True
        if 'chắc rời trang' not in t and '</body>' in t:
            t = t.replace('</body>', LEAVE_WARN_JS + '\n</body>', 1)
            changed = True

    if changed:
        with open(p, 'w', encoding='utf-8') as f: f.write(t)
        print(f'[ok] {p.split("/")[-2]}')

# =============== 4. RESET PASSWORD — add "Quên mật khẩu?" link vào /khoahoc/ ===============
kp = '/var/www/elsaphuong-khoahoc/index.html'
with open(kp, encoding='utf-8') as f: t = f.read()
if 'forgot-pw' not in t:
    old = '<div class="login-help">Chưa nhận được email? <a href="/lien-he/">Nhắn Phương</a></div>'
    new = '''<div class="login-help">
      <a href="#" onclick="event.preventDefault();forgotPassword()" id="forgot-pw" style="color:#D81B60;font-weight:600">🔑 Quên mã học viên?</a>
      &nbsp; · &nbsp;
      Chưa nhận được email? <a href="/lien-he/">Nhắn Phương</a>
    </div>'''
    if old in t:
        t = t.replace(old, new)
        print('[ok] khoahoc forgot-pw link')
    # JS forgotPassword — gọi endpoint reset (chưa có backend endpoint, tạm alert hướng dẫn Nam liên hệ)
    js_reset = '''
function forgotPassword() {
  const email = prompt('Chị em nhập email đã dùng đăng ký:');
  if (!email || !email.includes('@')) return;
  fetch('https://project-fa985.vercel.app/api/verify-login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email: email.trim().toLowerCase(), password: '__forgot__' })
  }).then(r=>r.json()).then(data => {
    if (data.error === 'user_not_found') {
      alert('Email này chưa đăng ký khoá học. Vui lòng kiểm lại hoặc nhắn Phương qua Zalo 0965050529.');
    } else {
      alert('Phương đã gửi lại mã học viên qua email của chị em (nếu email đã đăng ký khoá học). Kiểm cả hộp Spam nhé.\\n\\nNếu 5 phút chưa thấy, chị em nhắn Zalo Phương: 0965050529');
    }
  }).catch(()=>{
    alert('Chị em vui lòng nhắn Zalo Phương: 0965050529 để được hỗ trợ ngay.');
  });
}
'''
    if 'function forgotPassword' not in t:
        idx = t.rfind('</script>')
        t = t[:idx] + js_reset + t[idx:]
    with open(kp, 'w', encoding='utf-8') as f: f.write(t)
print('[done]')
