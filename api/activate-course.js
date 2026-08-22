// Endpoint đa dụng progress học viên. POST body:
//   { email, course, action?: 'activate'|'mark-done'|'unmark', lesson?: N }
// Default action = 'activate' (giữ backward-compat với client cũ chỉ gửi { email }).
//
// user.progress = {
//   "<courseSlug>": { activated_at, completed_lessons: [1,2,3], last_seen }
// }
// Migration: user.activated_at cũ → user.progress["21ngay-dangngoc"].activated_at

import { notifyTelegram } from './_lib/notify-telegram.js';

const COURSE_LABEL = {
  '21ngay-dangngoc': 'Dáng Ngọc An Nhiên',
  'goi-dau-thong-khi': 'Gội Đầu Thông Khí'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'method_not_allowed' });

  try {
    const { email, action = 'activate', lesson } = req.body || {};
    let { course } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: 'missing_email' });

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const key = `user_${encodeURIComponent(String(email).trim().toLowerCase())}`;

    const userRes = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = await userRes.json();
    if (!userData.result) return res.status(404).json({ success: false, error: 'user_not_found' });

    let user;
    try { user = JSON.parse(userData.result); }
    catch { return res.status(500).json({ success: false, error: 'corrupted_record' }); }

    // Default course = first enrolled (backward compat)
    if (!course) course = (user.enrolled_courses || [])[0] || '21ngay-dangngoc';

    // Đảm bảo user.progress exist + migrate activated_at cũ
    user.progress = user.progress || {};
    if (user.activated_at && !user.progress['21ngay-dangngoc']) {
      user.progress['21ngay-dangngoc'] = {
        activated_at: user.activated_at,
        completed_lessons: [],
        last_seen: user.activated_at
      };
    }

    if (!(user.enrolled_courses || []).includes(course)) {
      return res.status(403).json({ success: false, error: 'not_enrolled', course });
    }

    const now = new Date().toISOString();
    const p = user.progress[course] = user.progress[course] || {};

    let notifyMsg = null;
    if (action === 'activate') {
      if (p.activated_at) {
        return res.status(200).json({ success: true, already: true, course, progress: p });
      }
      p.activated_at = now;
      p.completed_lessons = p.completed_lessons || [];
      p.last_seen = now;
      notifyMsg = '🌸 *Học viên kích hoạt khoá học*\n\n' +
        '*Khoá:* ' + (COURSE_LABEL[course] || course) + '\n' +
        '*Mã HV:* `' + (user.studentId || '?') + '`\n' +
        '*Tên:* ' + (user.name || '—') + '\n' +
        '*Email:* ' + user.email + '\n' +
        '*Bắt đầu lúc:* ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    } else if (action === 'mark-done') {
      const n = parseInt(lesson);
      if (!n || n < 1) return res.status(400).json({ success: false, error: 'invalid_lesson' });
      p.completed_lessons = [...new Set([...(p.completed_lessons || []), n])].sort((a,b)=>a-b);
      p.last_seen = now;
    } else if (action === 'unmark') {
      const n = parseInt(lesson);
      if (!n) return res.status(400).json({ success: false, error: 'invalid_lesson' });
      p.completed_lessons = (p.completed_lessons || []).filter(x => x !== n);
      p.last_seen = now;
    } else {
      return res.status(400).json({ success: false, error: 'unknown_action' });
    }

    await fetch(`${url}/set/${key}/${encodeURIComponent(JSON.stringify(user))}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (notifyMsg) {
      try { await notifyTelegram(notifyMsg); } catch (e) { console.error('tg err:', e); }
    }

    return res.status(200).json({ success: true, course, progress: p });
  } catch (e) {
    console.error('activate-course error:', e);
    return res.status(500).json({ success: false, error: 'server_error', message: e.message });
  }
}
