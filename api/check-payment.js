export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { order_code } = req.query;
  if (!order_code) return res.status(400).json({ found: false });

  try {
    const upstashUrl = process.env.KV_REST_API_URL;
    const upstashToken = process.env.KV_REST_API_TOKEN;
    
    const r = await fetch(`${upstashUrl}/get/order_${order_code}`, {
      headers: { Authorization: `Bearer ${upstashToken}` }
    });
    const data = await r.json();
    res.json({ found: data.result === 'paid' });
  } catch(e) {
    res.status(500).json({ found: false, error: e.message });
  }
}
