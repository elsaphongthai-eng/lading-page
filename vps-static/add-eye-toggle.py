"""Thêm eye toggle vào password fields: admin + khoahoc login."""

# ADMIN
p1 = '/var/www/elsaphuong-admin/index.html'
with open(p1, encoding='utf-8') as f: t = f.read()

if 'eyeToggle' not in t:
    old = '<input id="adminToken" type="password" class="input w-full text-lg" placeholder="Nhập mật khẩu" autofocus onkeypress="if(event.key===\'Enter\')doLogin()">'
    new = '''<div style="position:relative">
      <input id="adminToken" type="password" class="input w-full text-lg" style="padding-right:44px" placeholder="Nhập mật khẩu" autofocus onkeypress="if(event.key==='Enter')doLogin()">
      <button type="button" onclick="eyeToggle('adminToken', this)" aria-label="Hiện/ẩn mật khẩu" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;padding:6px;cursor:pointer;color:#9CA3AF;font-size:18px;transition:color .2s" onmouseover="this.style.color='#D81B60'" onmouseout="this.style.color='#9CA3AF'">👁</button>
    </div>'''
    if old in t:
        t = t.replace(old, new)
        print('[ok] admin eye HTML')

if 'function eyeToggle' not in t:
    js = '''
  function eyeToggle(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; btn.setAttribute('aria-label','Ẩn mật khẩu'); }
    else { inp.type = 'password'; btn.textContent = '👁'; btn.setAttribute('aria-label','Hiện mật khẩu'); }
  }
'''
    idx = t.rfind('</script>')
    t = t[:idx] + js + t[idx:]
    print('[ok] admin eye JS')

with open(p1, 'w', encoding='utf-8') as f: f.write(t)

# KHOAHOC
p2 = '/var/www/elsaphuong-khoahoc/index.html'
with open(p2, encoding='utf-8') as f: t = f.read()

if 'eyeToggle' not in t:
    old = '<input type="password" id="password" placeholder="Mật khẩu Phương gửi qua email" required>'
    new = '''<div style="position:relative">
        <input type="password" id="password" placeholder="Mật khẩu Phương gửi qua email" required style="padding-right:44px;width:100%">
        <button type="button" onclick="eyeToggle('password', this)" aria-label="Hiện/ẩn mật khẩu" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;padding:6px;cursor:pointer;color:#8B6F5C;font-size:18px;transition:color .2s" onmouseover="this.style.color='#D81B60'" onmouseout="this.style.color='#8B6F5C'">👁</button>
      </div>'''
    if old in t:
        t = t.replace(old, new)
        print('[ok] khoahoc eye HTML')

if 'function eyeToggle' not in t:
    js = '''
function eyeToggle(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}
'''
    idx = t.rfind('</script>')
    t = t[:idx] + js + t[idx:]
    print('[ok] khoahoc eye JS')

with open(p2, 'w', encoding='utf-8') as f: f.write(t)
print('[done]')
