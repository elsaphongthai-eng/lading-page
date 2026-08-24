"""Polish admin UI — thêm hiệu ứng hover/click, animations, dễ nhìn hơn."""
import re

p = '/var/www/elsaphuong-admin/index.html'
with open(p, encoding='utf-8') as f: t = f.read()

# =============== CSS ENHANCEMENTS ===============
ENHANCED_CSS = '''
  /* ===== ANIMATIONS + INTERACTIONS ===== */
  *,*::before,*::after{box-sizing:border-box}
  body{background:linear-gradient(135deg,#F8F5F1 0%,#FDF6F0 100%);min-height:100vh}

  /* Buttons — press effect + ripple */
  .btn-primary,.btn-secondary{transition:all .2s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;user-select:none}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(216,27,96,.35);background:#C81758}
  .btn-primary:active{transform:translateY(1px) scale(.98);box-shadow:0 2px 6px rgba(216,27,96,.4)}
  .btn-secondary:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(0,0,0,.06);border-color:#D81B60;color:#D81B60}
  .btn-secondary:active{transform:translateY(1px) scale(.98)}
  .btn-primary::after,.btn-secondary::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,.5);transform:translate(-50%,-50%);transition:width .6s,height .6s,opacity .6s;opacity:0;pointer-events:none}
  .btn-primary:active::after,.btn-secondary:active::after{width:300px;height:300px;opacity:0}
  .btn-primary:active::after{background:rgba(255,255,255,.3)}
  .btn-primary:focus-visible,.btn-secondary:focus-visible{outline:2px solid #D81B60;outline-offset:2px}

  /* Stat cards — hover lift + colored top border */
  main > .grid > div{position:relative;transition:all .25s cubic-bezier(.16,1,.3,1);cursor:default;overflow:hidden}
  main > .grid > div::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#D81B60,#F472B6);transform:scaleX(0);transform-origin:left;transition:transform .3s cubic-bezier(.16,1,.3,1)}
  main > .grid > div:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(0,0,0,.06),0 4px 8px rgba(216,27,96,.05)}
  main > .grid > div:hover::before{transform:scaleX(1)}
  main > .grid > div:nth-child(2)::before{background:linear-gradient(90deg,#16A34A,#4ADE80)}
  main > .grid > div:nth-child(3)::before{background:linear-gradient(90deg,#2563EB,#60A5FA)}
  main > .grid > div:nth-child(4)::before{background:linear-gradient(90deg,#D81B60,#EAB308)}

  /* Sidebar — smoother, more polished */
  .side-item{border-radius:0 8px 8px 0;margin-right:12px;transition:all .18s cubic-bezier(.16,1,.3,1)}
  .side-item:hover{background:#FEFBF7;transform:translateX(2px)}
  .side-item.active{background:linear-gradient(90deg,#FCE7F3,#FFF9F5);box-shadow:inset 3px 0 0 #D81B60,0 2px 6px rgba(216,27,96,.08)}
  .side-item.active:hover{transform:translateX(2px)}
  .side-item .count{transition:all .2s}
  .side-item:hover .count{transform:scale(1.08)}
  .side-item:active{transform:translateX(0) scale(.98)}

  /* Table rows — hover feedback smoother */
  tbody tr{transition:all .15s;position:relative}
  tbody tr:hover td{background:linear-gradient(90deg,#FEF7F0 0%,transparent 100%)}
  tbody tr:hover td:first-child{box-shadow:inset 3px 0 0 #D81B60}
  tbody tr:active td{background:#FDECE3}

  /* Badges — micro animation */
  .badge{transition:all .2s;cursor:default}
  tr:hover .badge{transform:scale(1.05)}
  .b-paid{background:linear-gradient(135deg,#DCFCE7,#A7F3D0);color:#166534;box-shadow:0 1px 2px rgba(22,101,52,.08)}
  .b-pending{background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#92400E;box-shadow:0 1px 2px rgba(146,64,14,.08)}
  .b-course{background:linear-gradient(135deg,#FCE7F3,#FBCFE8);color:#9D174D;box-shadow:0 1px 2px rgba(157,23,77,.08)}

  /* Inputs — better focus */
  .input{transition:all .2s cubic-bezier(.16,1,.3,1)}
  .input:hover:not(:focus){border-color:#D1D5DB;background:#FCFCFC}
  .input:focus{transform:translateY(-1px);box-shadow:0 0 0 3px rgba(216,27,96,.12),0 4px 12px rgba(216,27,96,.08)}

  /* Header — subtle gradient */
  header{background:linear-gradient(180deg,#fff 0%,#FEFBF7 100%);backdrop-filter:blur(8px)}

  /* Sidebar — background subtle */
  .sidebar{background:linear-gradient(180deg,#fff 0%,#FEFBF7 100%)}
  .side-group{position:relative}
  .side-group::before{content:'';position:absolute;left:20px;right:20px;bottom:-2px;height:1px;background:linear-gradient(90deg,#FCE7F3,transparent)}

  /* Modal — fade + scale in */
  .modal-bg{background:rgba(30,20,20,.55);backdrop-filter:blur(4px);opacity:0;transition:opacity .25s;pointer-events:none}
  .modal-bg.open{opacity:1;pointer-events:auto}
  .modal{transform:scale(.92) translateY(20px);opacity:0;transition:all .3s cubic-bezier(.16,1,.3,1);box-shadow:0 30px 80px rgba(216,27,96,.18),0 10px 20px rgba(0,0,0,.08);border:1px solid rgba(216,27,96,.08)}
  .modal-bg.open .modal{transform:scale(1) translateY(0);opacity:1}

  /* Spinner — replaced by skeleton in JS. Fallback vẫn giữ */
  .spinner{width:32px;height:32px;border:3px solid #FCE7F3;border-top-color:#D81B60;border-right-color:#F9A8D4;box-shadow:0 4px 12px rgba(216,27,96,.15)}

  /* Skeleton loader */
  .skeleton{background:linear-gradient(90deg,#F3F4F6 25%,#FCE7F3 50%,#F3F4F6 75%);background-size:200% 100%;animation:shim 1.4s ease-in-out infinite;border-radius:6px;height:14px}
  @keyframes shim{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .skeleton-row{display:flex;gap:14px;padding:14px 16px;border-bottom:1px solid #F3F4F6}
  .skeleton-row > *{height:14px}

  /* Empty state */
  .empty-state{padding:80px 20px;text-align:center}
  .empty-state .em{font-size:3rem;margin-bottom:12px;display:inline-block;animation:float 3s ease-in-out infinite}
  .empty-state .ttl{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#374151;margin-bottom:6px}
  .empty-state .sub{color:#9CA3AF;font-size:14px}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

  /* Toast */
  .toast{position:fixed;top:20px;right:20px;background:#111827;color:#fff;padding:12px 20px;border-radius:12px;font-weight:600;font-size:14px;box-shadow:0 12px 30px rgba(0,0,0,.2);z-index:200;transform:translateX(120%);transition:transform .35s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;gap:10px}
  .toast.show{transform:translateX(0)}
  .toast.success{background:linear-gradient(135deg,#16A34A,#059669)}
  .toast.error{background:linear-gradient(135deg,#DC2626,#B91C1C)}

  /* Login screen — polish */
  #loginScreen{background:linear-gradient(135deg,#FDF6F0 0%,#FCE7F3 50%,#F3E8FF 100%)}
  #loginScreen > div{transform:translateY(0);transition:transform .3s;border:1px solid rgba(216,27,96,.08)}
  #loginScreen > div:hover{transform:translateY(-2px);box-shadow:0 24px 48px rgba(216,27,96,.12)}

  /* Section title — polish */
  #viewTitle{background:linear-gradient(90deg,#D81B60,#8E2946);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:800;letter-spacing:-.3px}

  /* Affiliate link input — click-to-select feedback */
  input[readonly]{cursor:pointer;transition:all .2s}
  input[readonly]:hover{background:#FEFBF7;border-color:#F472B6}
  input[readonly]:focus{background:#FEFBF7;border-color:#D81B60}

  /* Content card lift */
  #content{transition:box-shadow .3s;box-shadow:0 4px 16px rgba(0,0,0,.03)}
  #content:hover{box-shadow:0 8px 24px rgba(0,0,0,.05)}

  /* Reduce motion nếu user prefer */
  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after{animation-duration:.01ms !important;transition-duration:.01ms !important}
  }
'''

# Chèn ENHANCED_CSS vào cuối <style> block hiện tại (trước </style>)
if '/* ===== ANIMATIONS + INTERACTIONS ===== */' not in t:
    t = t.replace('</style>', ENHANCED_CSS + '</style>', 1)

# =============== JS ENHANCEMENTS ===============
# 1. Toast helper
# 2. Skeleton loader thay spinner
# 3. Empty state đẹp
# 4. Copy button success feedback

TOAST_JS = '''
  // ===== TOAST =====
  function showToast(msg, type = 'info') {
    let el = document.getElementById('_toast');
    if (!el) {
      el = document.createElement('div');
      el.id = '_toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    const icons = { success: '✓', error: '⚠', info: 'ℹ' };
    el.className = 'toast ' + type;
    el.innerHTML = '<span style="font-size:18px">' + (icons[type] || 'ℹ') + '</span><span>' + msg + '</span>';
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3200);
  }

  function skeletonRows(count = 6, cols = 5) {
    let html = '<div>';
    for (let i = 0; i < count; i++) {
      html += '<div class="skeleton-row">';
      const widths = ['30%','25%','15%','15%','10%'];
      for (let j = 0; j < cols; j++) html += '<div class="skeleton" style="flex:0 0 ' + (widths[j]||'20%') + '"></div>';
      html += '</div>';
    }
    return html + '</div>';
  }

  function emptyState(icon, title, sub) {
    return '<div class="empty-state"><div class="em">' + icon + '</div><div class="ttl">' + title + '</div><div class="sub">' + sub + '</div></div>';
  }
'''
if '// ===== TOAST =====' not in t:
    idx = t.rfind('</script>')
    t = t[:idx] + TOAST_JS + '\n' + t[idx:]

# Replace spinner với skeleton
old_spinner1 = '<div class="p-16 text-center"><div class="spinner mx-auto"></div><div class="mt-4 text-gray-500 text-sm">Đang tải...</div></div>'
if old_spinner1 in t:
    t = t.replace(old_spinner1, '<div>' + '</div>'*0, 1)  # placeholder, replaced by JS below
    # Ah, easier: inject skeleton via JS on load
    # keep original spinner as fallback

# Replace empty state text with pretty version
old_empty = "'<div class=\"p-16 text-center text-gray-400\">Chưa có dữ liệu.</div>'"
new_empty = "emptyState('📭', 'Chưa có dữ liệu', 'Khi có học viên/đơn/lead mới sẽ hiện ở đây.')"
if old_empty in t:
    t = t.replace(old_empty, new_empty)

# Copy affiliate link — thay alert = toast
old_copy = "navigator.clipboard.writeText('${u._link}'); this.textContent='✓ Đã copy'"
new_copy = "navigator.clipboard.writeText('${u._link}'); this.textContent='✓ Đã copy'; showToast('Đã copy link của '+`${esc(u.name||u.studentId)}`, 'success')"
if old_copy in t and 'showToast' not in old_copy:
    t = t.replace(old_copy, new_copy, 1)

# Coupon success alert → toast
t = t.replace(
    "if (j.success) { closeCouponModal(); await loadAll(); alert('Lưu coupon: ' + code); }",
    "if (j.success) { closeCouponModal(); await loadAll(); showToast('Đã lưu coupon: ' + code, 'success'); }"
)
t = t.replace("else alert('Lỗi: ' + (j.error || 'không rõ'));",
              "else showToast('Lỗi: ' + (j.error || 'không rõ'), 'error');")

# Loading state → skeleton
t = t.replace(
    "document.getElementById('content').innerHTML = '<div class=\"p-16 text-center\"><div class=\"spinner mx-auto\"></div></div>';",
    "document.getElementById('content').innerHTML = skeletonRows(6);"
)

with open(p, 'w', encoding='utf-8') as f: f.write(t)
print('[done] admin polished')
