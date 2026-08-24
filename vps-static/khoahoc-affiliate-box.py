"""Chèn box Affiliate vào dashboard /khoahoc/ — hiện link cá nhân + số người mời."""
p = '/var/www/elsaphuong-khoahoc/index.html'
with open(p, encoding='utf-8') as f: t = f.read()

if 'affiliate-box' in t:
    print('[skip] đã có'); import sys; sys.exit(0)

# CSS
extra_css = '''
  .affiliate-box{background:linear-gradient(135deg,#FFF9F5,#FDECE3);border:1px solid rgba(216,27,96,.2);border-radius:16px;padding:22px 24px;margin-top:20px}
  .affiliate-box h3{font-family:var(--serif);font-size:1.1rem;color:#D81B60;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px}
  .affiliate-box .desc{font-size:.88rem;color:#6B4E3F;margin-bottom:14px}
  .affiliate-link{display:flex;gap:6px;background:#fff;border:1px dashed #D81B60;border-radius:10px;padding:6px 6px 6px 12px;align-items:center}
  .affiliate-link input{flex:1;border:0;outline:0;font-size:13px;background:transparent;font-family:'SF Mono',Menlo,monospace;color:#D81B60;font-weight:600}
  .affiliate-link button{background:#D81B60;color:#fff;border:0;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--sans)}
  .affiliate-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
  .aff-stat{background:#fff;border-radius:10px;padding:12px 14px;text-align:center}
  .aff-stat .num{font-family:var(--serif);font-size:1.6rem;font-weight:700;color:#D81B60;line-height:1}
  .aff-stat .lab{font-size:.75rem;color:#8B6F5C;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
'''
if '.affiliate-box' not in t:
    idx = t.find('</style>')
    t = t[:idx] + extra_css + t[idx:]

# HTML box — chèn vào end of aside sidebar left (sau progress-box)
box_html = '''
      <div class="affiliate-box" id="affiliateBox" style="display:none">
        <h3>🔗 Link giới thiệu bạn bè</h3>
        <div class="desc">Gửi link này cho bạn — khi bạn đăng ký khoá bất kỳ, chị em được ghi nhận là đã mời.</div>
        <div class="affiliate-link">
          <input id="affLink" readonly onclick="this.select()">
          <button onclick="copyAffLink()">Copy</button>
        </div>
        <div class="affiliate-stats">
          <div class="aff-stat"><div class="num" id="affCount">0</div><div class="lab">Đã mời</div></div>
          <div class="aff-stat"><div class="num" id="affSid">—</div><div class="lab">Mã HV</div></div>
        </div>
      </div>
'''
# Anchor: sau progress-box (đã close </div>)
anchor = '<div class="progress-box">'
end_anchor_pos = t.find('</div>', t.find(anchor, 0))
# Find end of progress-box <div> — count nested divs
# Simpler: chèn TRƯỚC </aside>
sidebar_end = t.find('</aside>')
if sidebar_end > 0 and '<aside class="sidebar"' in t[:sidebar_end]:
    t = t[:sidebar_end] + box_html + t[sidebar_end:]

# JS — hàm updateAffiliateBox + copyAffLink
new_js = '''
  function updateAffiliateBox() {
    if (!USER_SESSION || !USER_SESSION.studentId) return;
    const box = document.getElementById('affiliateBox');
    if (!box) return;
    const link = 'https://elsaphuong.com/?ref=' + USER_SESSION.studentId;
    document.getElementById('affLink').value = link;
    document.getElementById('affSid').textContent = USER_SESSION.studentId;
    document.getElementById('affCount').textContent = USER_SESSION.referral_count || 0;
    box.style.display = 'block';
  }
  function copyAffLink() {
    navigator.clipboard.writeText(document.getElementById('affLink').value);
    event.target.textContent = '✓ Đã copy';
    setTimeout(()=>event.target.textContent='Copy',2000);
  }
'''
if 'updateAffiliateBox' not in t:
    idx = t.rfind('</script>')
    t = t[:idx] + new_js + '\n' + t[idx:]

# Gọi updateAffiliateBox() sau renderActiveCourse — thêm inline vào cuối hàm
old_render = 'function renderActiveCourse() {\n  const swBtn = document.getElementById(\'switchCourseBtn\');'
if old_render in t:
    # Chèn call updateAffiliateBox ngay đầu hàm
    t = t.replace(old_render, old_render + '\n  updateAffiliateBox();', 1)

# Cũng cần verify-login return referral_count field. Nó là user record → có sẵn nếu backend save.
# USER_SESSION là {email, name, studentId, ngay_tham_gia, activated_at, enrolled_courses, progress}
# Cần add referral_count vào USER_SESSION construction — patch login handler
old_session = '''USER_SESSION = {
      email: data.email, name: data.name, studentId: data.studentId,
      ngay_tham_gia: data.ngay_tham_gia,
      activated_at: data.activated_at,
      enrolled_courses: data.enrolled_courses || [],
      progress: data.progress || {}
    };'''
new_session = '''USER_SESSION = {
      email: data.email, name: data.name, studentId: data.studentId,
      ngay_tham_gia: data.ngay_tham_gia,
      activated_at: data.activated_at,
      enrolled_courses: data.enrolled_courses || [],
      progress: data.progress || {},
      referral_count: data.referral_count || 0
    };'''
if old_session in t:
    t = t.replace(old_session, new_session, 1)

with open(p, 'w', encoding='utf-8') as f: f.write(t)
print('[done]')
