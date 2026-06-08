// Endpoint xác thực login cho khu vực học viên /khoahoc/.
// POST { email, password } → query Upstash `user_<email>` → trả thông tin học viên.

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'method_not_allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'missing_credentials' });
    }

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const key = `user_${encodeURIComponent(String(email).trim().toLowerCase())}`;

    const userRes = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = await userRes.json();
    if (!userData.result) {
      return res.status(200).json({ success: false, error: 'user_not_found' });
    }

    let user;
    try { user = JSON.parse(userData.result); }
    catch { return res.status(500).json({ success: false, error: 'corrupted_record' }); }

    if (user.password !== password) {
      return res.status(200).json({ success: false, error: 'wrong_password' });
    }

    // Trả tối thiểu — không trả password
    return res.status(200).json({
      success: true,
      studentId: user.studentId,
      name: user.name || '',
      email: user.email,
      ngay_tham_gia: user.ngay_tham_gia,
      status: user.status || 'active'
    });
  } catch (e) {
    console.error('verify-login error:', e);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
}
