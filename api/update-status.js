export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { code, status } = req.body;

    if (!code || !status) {
      return res.status(400).json({ error: 'Missing code or status' });
    }

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Đọc toàn bộ danh sách orders từ Upstash
    const r = await fetch(`${url}/lrange/orders/0/1000`, { headers });
    const d = await r.json();
    const raw = d.result || [];

    // 2. Parse từng phần tử
    const orders = raw.map(o => {
      if (typeof o === 'object') return o;
      try { return JSON.parse(o); } catch(e) { return { code: o }; }
    });

    // 3. Tìm và cập nhật đơn hàng theo code
    let found = false;
    const updated = orders.map(o => {
      if (o.code === code) {
        found = true;
        return { ...o, status };
      }
      return o;
    });

    if (!found) {
      return res.status(404).json({ error: `Order ${code} not found` });
    }

    // 4. Xoá list cũ trên Upstash
    await fetch(`${url}/del/orders`, { method: 'POST', headers });

    // 5. Ghi lại toàn bộ list theo thứ tự gốc (dùng rpush để giữ thứ tự)
    for (const order of updated) {
      await fetch(
        `${url}/rpush/orders/${encodeURIComponent(JSON.stringify(order))}`,
        { method: 'POST', headers }
      );
    }

    res.json({ success: true, code, status });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
