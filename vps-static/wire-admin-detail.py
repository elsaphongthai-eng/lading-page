"""Overhaul admin: chi tiết học viên hiển thị progress bar mỗi khoá + timeline bài nộp + feedback UI."""

p = '/var/www/elsaphuong-admin/index.html'
with open(p, encoding='utf-8') as f: t = f.read()

# CSS mới cho student detail
extra_css = '''
  /* ===== STUDENT DETAIL MODAL ===== */
  .std-modal{max-width:820px}
  .std-header{background:linear-gradient(135deg,#FCE7F3,#FFF9F5);padding:20px 24px;margin:-32px -32px 20px;border-radius:16px 16px 0 0;display:flex;align-items:center;gap:16px}
  .std-avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#D81B60,#AD1457);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-weight:700;font-size:1.6rem;flex-shrink:0}
  .std-info h4{font-size:1.15rem;font-weight:700;color:#111827;margin:0}
  .std-info .sub{font-size:.85rem;color:#6B7280;margin-top:2px}
  .std-info .sid{display:inline-block;background:#fff;color:#D81B60;padding:2px 10px;border-radius:12px;font-family:monospace;font-weight:700;font-size:.85rem;margin-top:4px;border:1px solid rgba(216,27,96,.2)}

  .course-progress{background:#F9FAFB;border-radius:12px;padding:16px 18px;margin-bottom:14px}
  .course-progress .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .course-progress .name{font-weight:700;color:#111827;font-size:.95rem}
  .course-progress .pct{font-family:'Playfair Display',serif;font-weight:700;color:#D81B60;font-size:1.3rem}
  .prog-bar{height:8px;background:#E5E7EB;border-radius:4px;overflow:hidden}
  .prog-bar .fill{height:100%;background:linear-gradient(90deg,#D81B60,#F472B6);transition:width .6s}
  .course-progress .meta{display:flex;gap:16px;margin-top:10px;font-size:.78rem;color:#6B7280;flex-wrap:wrap}
  .course-progress .meta span b{color:#111827}

  .submission-item{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px;margin-bottom:10px;transition:.2s}
  .submission-item:hover{border-color:#D81B60}
  .submission-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
  .submission-head .day{font-weight:700;color:#111827;font-size:.95rem}
  .badge-pending{background:#FEF3C7;color:#92400E}
  .badge-reviewed{background:#DCFCE7;color:#166534}
  .submission-item .link a{color:#D81B60;font-size:.85rem;word-break:break-all}
  .submission-item .text{font-size:.9rem;color:#374151;margin:6px 0}
  .fb-area{margin-top:10px;padding-top:10px;border-top:1px dashed #E5E7EB}
  .fb-area textarea{width:100%;min-height:60px;padding:8px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;font-family:inherit;resize:vertical}
  .fb-area textarea:focus{outline:none;border-color:#D81B60}
  .fb-existing{background:#F1F8E9;padding:10px 14px;border-radius:8px;border-left:3px solid #4CAF50;font-size:.9rem;color:#33691E;margin-bottom:8px}
  .fb-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}

  .detail-tabs{display:flex;gap:2px;background:#F3F4F6;padding:4px;border-radius:10px;margin-bottom:16px}
  .detail-tabs button{flex:1;background:transparent;border:0;padding:8px 14px;border-radius:8px;font-weight:600;font-size:13px;color:#6B7280;cursor:pointer;transition:.2s}
  .detail-tabs button.active{background:#fff;color:#D81B60;box-shadow:0 2px 4px rgba(0,0,0,.06)}
'''
if '/* ===== STUDENT DETAIL MODAL ===== */' not in t:
    t = t.replace('</style>', extra_css + '</style>', 1)

old_show_marker = '// ===== Detail modal ====='
new_show = '''  // ===== Detail modal — student RICH UI =====
  const COURSE_TOTAL = { '21ngay-dangngoc': 21, 'goi-dau-thong-khi': 5 };
  const COURSE_NAME = { '21ngay-dangngoc': '🌸 Dáng Ngọc An Nhiên', 'goi-dau-thong-khi': '🌿 Gội Đầu Thông Khí' };

  function showDetail(idx) {
    const items = filterItems();
    const it = items[idx];
    if (!it) return;
    document.querySelector('#detailModal .modal').classList.add('std-modal');
    document.getElementById('modalTitle').style.display = 'none';
    if (activeView.startsWith('users-')) return showStudentDetail(it);
    // Fallback simple table cho orders/leads
    document.getElementById('modalTitle').style.display = '';
    document.querySelector('#detailModal .modal').classList.remove('std-modal');
    document.getElementById('modalTitle').textContent =
      activeView.startsWith('orders-') ? `Đơn hàng: ${it.code}` :
      activeView==='leads' ? `Lead: ${it.name||it.email}` : 'Chi tiết';
    const rows = Object.entries(it).map(([k,v]) =>
      `<tr><td class="text-gray-500 pr-4 py-1.5 text-xs uppercase tracking-widest align-top w-1/3">${esc(k)}</td>
       <td class="py-1.5 break-all">${esc(typeof v==='object'?JSON.stringify(v,null,2):v)}</td></tr>`
    ).join('');
    document.getElementById('modalBody').innerHTML = `<table class="w-full">${rows}</table>`;
    document.getElementById('detailModal').classList.add('open');
  }

  function showStudentDetail(u) {
    const initial = (u.name || u.email || 'H').charAt(0).toUpperCase();
    const enrolled = u.enrolled_courses || [];
    const progress = u.progress || {};
    if (u.activated_at && !progress['21ngay-dangngoc']) {
      progress['21ngay-dangngoc'] = { activated_at: u.activated_at, completed_lessons: [], last_seen: u.activated_at };
    }

    let html = '<div class="std-header">';
    html += '<div class="std-avatar">'+esc(initial)+'</div>';
    html += '<div class="std-info"><h4>'+esc(u.name||'—')+'</h4>';
    html += '<div class="sub">'+esc(u.email||'')+' · '+esc(u.phone||'')+'</div>';
    html += '<div class="sid">'+esc(u.studentId||'—')+'</div></div></div>';

    html += '<div class="detail-tabs">';
    html += '<button class="active" onclick="showStdTab(\\'progress\\',this)">📊 Tiến độ</button>';
    html += '<button onclick="showStdTab(\\'submissions\\',this)">📝 Bài nộp</button>';
    html += '<button onclick="showStdTab(\\'meta\\',this)">🔧 Meta</button></div>';

    // TAB 1: PROGRESS
    html += '<div id="stdTab-progress">';
    if (!enrolled.length) {
      html += '<div class="text-center text-gray-400 py-8">Học viên chưa enroll khoá nào</div>';
    } else {
      enrolled.forEach(course => {
        const p = progress[course] || {};
        const done = (p.completed_lessons || []).length;
        const total = COURSE_TOTAL[course] || 1;
        const pct = Math.round(done / total * 100);
        const lastSeen = p.last_seen ? new Date(p.last_seen).toLocaleDateString('vi-VN') : '—';
        const startedAt = p.activated_at ? new Date(p.activated_at).toLocaleDateString('vi-VN') : 'Chưa bắt đầu';
        html += '<div class="course-progress"><div class="head">';
        html += '<div class="name">'+(COURSE_NAME[course] || course)+'</div>';
        html += '<div class="pct">'+pct+'%</div></div>';
        html += '<div class="prog-bar"><div class="fill" style="width:'+pct+'%"></div></div>';
        html += '<div class="meta">';
        html += '<span>Đã học: <b>'+done+'/'+total+'</b> bài</span>';
        html += '<span>Bắt đầu: <b>'+startedAt+'</b></span>';
        html += '<span>Hoạt động cuối: <b>'+lastSeen+'</b></span>';
        html += '</div></div>';
      });
    }
    html += '</div>';

    // TAB 2: SUBMISSIONS
    html += '<div id="stdTab-submissions" style="display:none">';
    const allSubs = [];
    enrolled.forEach(course => {
      const p = progress[course] || {};
      const subs = p.submissions || {};
      Object.keys(subs).map(Number).sort((a,b)=>a-b).forEach(day => {
        allSubs.push({ course, day, ...subs[String(day)] });
      });
    });
    if (!allSubs.length) {
      html += '<div class="text-center text-gray-400 py-8">Chưa có bài nộp nào</div>';
    } else {
      allSubs.forEach(s => {
        const badge = s.status === 'reviewed'
          ? '<span class="badge badge-reviewed">✓ Đã chấm</span>'
          : '<span class="badge badge-pending">⏳ Chờ chấm</span>';
        const submittedTs = s.submitted_at ? new Date(s.submitted_at).toLocaleString('vi-VN') : '';
        const courseName = (COURSE_NAME[s.course]||s.course).replace(/[🌸🌿]\\s/,'');
        const taId = 'fb-'+esc(u.email)+'-'+s.course+'-'+s.day;
        html += '<div class="submission-item"><div class="submission-head">';
        html += '<div class="day">Ngày '+s.day+' · '+courseName+'</div>'+badge+'</div>';
        html += '<div class="text-xs text-gray-500 mb-1">Nộp lúc: '+submittedTs+'</div>';
        if (s.link) html += '<div class="link">🔗 <a href="'+esc(s.link)+'" target="_blank" rel="noopener">'+esc(s.link)+'</a></div>';
        if (s.text) html += '<div class="text">💭 '+esc(s.text)+'</div>';
        html += '<div class="fb-area">';
        if (s.feedback) html += '<div class="fb-existing"><b>💬 Nhận xét cũ:</b> '+esc(s.feedback)+'</div>';
        html += '<textarea id="'+taId+'" placeholder="'+(s.feedback?'Sửa nhận xét...':'Nhập nhận xét cho bài này...')+'">'+esc(s.feedback||'')+'</textarea>';
        html += '<div class="fb-actions"><button class="btn-primary" onclick="submitFeedback(\\''+esc(u.email)+'\\',\\''+s.course+'\\','+s.day+')">💾 Lưu nhận xét</button></div>';
        html += '</div></div>';
      });
    }
    html += '</div>';

    // TAB 3: META
    const rows = Object.entries(u).map(([k,v]) =>
      '<tr><td class="text-gray-500 pr-4 py-1.5 text-xs uppercase tracking-widest align-top w-1/3">'+esc(k)+'</td>'+
      '<td class="py-1.5 break-all">'+esc(typeof v==='object'?JSON.stringify(v,null,2):v)+'</td></tr>'
    ).join('');
    html += '<div id="stdTab-meta" style="display:none"><table class="w-full text-sm">'+rows+'</table></div>';

    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('detailModal').classList.add('open');
  }

  function showStdTab(name, btn) {
    ['progress','submissions','meta'].forEach(n => {
      const el = document.getElementById('stdTab-'+n);
      if (el) el.style.display = n===name ? '' : 'none';
    });
    btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  async function submitFeedback(email, course, day) {
    const ta = document.getElementById('fb-'+email+'-'+course+'-'+day);
    const feedback = ta.value.trim();
    if (!feedback) { showToast('Nhập nội dung nhận xét', 'error'); return; }
    try {
      const res = await fetch('https://project-fa985.vercel.app/api/activate-course', {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'X-Admin-Token': TOKEN},
        body: JSON.stringify({ email, course, action: 'feedback', lesson: day, feedback, status: 'reviewed' })
      });
      const j = await res.json();
      if (j.success) {
        showToast('Đã lưu nhận xét ngày '+day, 'success');
        await loadAll();
        const u = data.users.find(x => x.email === email);
        if (u) showStudentDetail(u);
      } else {
        showToast('Lỗi: ' + (j.error||'?'), 'error');
      }
    } catch(e) { showToast('Lỗi mạng: ' + e.message, 'error'); }
  }'''

# Find and replace the old block: từ '// ===== Detail modal =====' đến hết `function closeModal()` cũ (bao gồm luôn showDetail cũ)
import re
# Match từ marker đến trước `function closeModal`
pat = re.compile(r'  // ===== Detail modal =====\n.*?(?=  function closeModal)', re.DOTALL)
if 'showStudentDetail' not in t:
    m = pat.search(t)
    if m:
        t = t[:m.start()] + new_show + '\n\n  ' + t[m.end():]
        print('[ok] admin detail modal upgraded')
    else:
        print('[error] marker not found')

with open(p, 'w', encoding='utf-8') as f: f.write(t)
print('[done admin]')
