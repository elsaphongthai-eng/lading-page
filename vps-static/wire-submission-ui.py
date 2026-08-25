"""Wire submission + feedback UI vào /khoahoc/ (student) + admin panel."""

# ===================== 1. STUDENT DASHBOARD =====================
p = '/var/www/elsaphuong-khoahoc/index.html'
with open(p, encoding='utf-8') as f: t = f.read()

# CSS mới cho feedback box
extra_css = '''
  .feedback-box{background:linear-gradient(135deg,#F1F8E9,#DCEDC8);border-left:4px solid #4CAF50;border-radius:10px;padding:12px 16px;margin-top:12px}
  .feedback-box.pending{background:linear-gradient(135deg,#FFF8E1,#FFECB3);border-left-color:#F5D472}
  .feedback-box .lab{font-family:var(--sans);font-weight:700;font-size:.8rem;color:#2E7D32;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:6px}
  .feedback-box.pending .lab{color:#7B5A0D}
  .feedback-box .msg{color:#33691E;font-family:var(--body);font-size:.95rem;line-height:1.55}
  .feedback-box.pending .msg{color:#7B5A0D;font-style:italic}
  .feedback-box .ts{font-size:.75rem;color:#8B6F5C;margin-top:6px}
'''
if 'feedback-box' not in t:
    t = t.replace('</style>', extra_css + '</style>', 1)

# JS: updateSubmissionFeedback — hàm gọi khi render lesson
# Thay submitLink cũ để dùng API mới (POST activate-course action=submit-lesson)
old_submit = '''function submitLink(day) {
  const inp = document.getElementById('linkInput-' + day);
  const link = inp.value.trim();
  if (!link.startsWith('http')) { alert('Vui lòng dán đúng link bài đăng'); return; }
  LESSONS[day].submitted = link;
  alert('Đã gửi link bài Ngày ' + day + '. Phương sẽ ghi nhận.');
}'''

new_submit = '''async function submitLink(day) {
  const inp = document.getElementById('linkInput-' + day);
  const link = inp.value.trim();
  if (!link.startsWith('http')) { alert('Vui lòng dán đúng link bài đăng'); return; }
  const btn = inp.parentElement.querySelector('.btn-send');
  const originalText = btn.textContent;
  btn.disabled = true; btn.textContent = 'Đang gửi...';
  try {
    const res = await fetch('https://project-fa985.vercel.app/api/activate-course', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        email: USER_SESSION.email,
        course: ACTIVE_COURSE || '21ngay-dangngoc',
        action: 'submit-lesson',
        lesson: day,
        link
      })
    });
    const data = await res.json();
    if (data.success) {
      LESSONS[day].submitted = link;
      USER_SESSION.progress[ACTIVE_COURSE || '21ngay-dangngoc'] = data.progress;
      btn.textContent = 'Đã gửi ✓';
      btn.style.background = '#4CAF50';
      // Show pending feedback box
      const box = document.getElementById('feedback-' + day);
      if (box) {
        box.className = 'feedback-box pending';
        box.innerHTML = '<div class="lab">⏳ Phương sẽ chấm bài trong 1-2 ngày</div><div class="msg">Cảm ơn chị em đã nộp bài Ngày ' + day + '. Nếu có nhận xét từ Phương, sẽ hiện ở đây.</div>';
        box.style.display = 'block';
      }
    } else {
      btn.disabled = false; btn.textContent = originalText;
      alert('Gửi thất bại, thử lại nhé');
    }
  } catch (e) {
    btn.disabled = false; btn.textContent = originalText;
    alert('Lỗi kết nối');
  }
}

function renderFeedbackForLesson(day, submissions) {
  const box = document.getElementById('feedback-' + day);
  if (!box) return;
  const s = (submissions || {})[String(day)];
  if (!s) { box.style.display = 'none'; return; }
  if (s.feedback) {
    box.className = 'feedback-box';
    const ts = s.feedback_at ? new Date(s.feedback_at).toLocaleDateString('vi-VN') : '';
    box.innerHTML = '<div class="lab">💬 Nhận xét từ Phương</div><div class="msg">' + s.feedback.replace(/</g,'&lt;').replace(/\\n/g,'<br>') + '</div>' + (ts ? '<div class="ts">Chấm ngày ' + ts + '</div>' : '');
  } else {
    box.className = 'feedback-box pending';
    box.innerHTML = '<div class="lab">⏳ Phương sẽ chấm bài trong 1-2 ngày</div><div class="msg">Cảm ơn chị em đã nộp bài Ngày ' + day + '. Phương sẽ ghi nhận và gửi nhận xét sớm.</div>';
  }
  box.style.display = 'block';
}'''
if 'submit-lesson' not in t:
    if old_submit in t:
        t = t.replace(old_submit, new_submit)
        print('[ok] submitLink upgraded')

# HTML: thêm div feedback-{i} ngay sau submit-link-box trong template renderTasks
old_task = '''              ${lesson.submitted ? '<div class="submitted-link">✓ Đã ghi nhận lúc ' + new Date().toLocaleDateString('vi-VN') + '</div>' : ''}
            </div>'''
new_task = '''              ${lesson.submitted ? '<div class="submitted-link">✓ Đã ghi nhận lúc ' + new Date().toLocaleDateString('vi-VN') + '</div>' : ''}
              <div class="feedback-box" id="feedback-${i}" style="display:none"></div>
            </div>'''
if '<div class="feedback-box" id="feedback-' not in t:
    if old_task in t:
        t = t.replace(old_task, new_task)
        print('[ok] feedback slot added to lesson template')

# updateCompletedCount → cũng render feedback từ progress.submissions
old_upd = '''function updateCompletedCount(completedLessons) {
    const cnt = completedLessons.length;'''
new_upd = '''function updateCompletedCount(completedLessons) {
    const cnt = completedLessons.length;
    // Render feedback cho các bài đã có submission
    const p = (USER_SESSION.progress || {})[ACTIVE_COURSE || '21ngay-dangngoc'] || {};
    const subs = p.submissions || {};
    Object.keys(subs).forEach(day => renderFeedbackForLesson(parseInt(day), subs));'''
if 'renderFeedbackForLesson' in t and 'const p = (USER_SESSION.progress' not in t.split('function updateCompletedCount')[1][:200]:
    t = t.replace(old_upd, new_upd, 1)
    print('[ok] updateCompletedCount renders feedback')

with open(p, 'w', encoding='utf-8') as f: f.write(t)
print('[done student]')
