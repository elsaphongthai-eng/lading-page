export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { key, value } = req.body;
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    let data;
    if (key === 'products') {
      data = `${value.name}|${value.price}|${value.description}`;
    } else {
      data = JSON.stringify(value);
    }

    await fetch(`${url}/lpush/${key}/${encodeURIComponent(data)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Gửi Email 1 tự động khi có khách hàng mới
    if (key === 'customers' && value.email) {
      const isTest = value.email.includes('+test');
      const baseUrl = 'https://www.elsaphuong.com';

      // Gửi Email 1 ngay lập tức
      await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value.email, name: value.name, emailNumber: 1 })
      });

      if (isTest) {
        // Chế độ test: gửi Email 2 và 3 ngay lập tức
        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value.email, name: value.name, emailNumber: 2 })
        });
        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value.email, name: value.name, emailNumber: 3 })
        });
      }
    }

    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}