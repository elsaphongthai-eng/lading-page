export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { order_code } = req.query;
  if (!order_code) return res.status(400).json({ found: false });

  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const response = await fetch(`${url}/get/order:${order_code}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    const found = data.result === 'paid';
    res.json({ found });
  } catch(e) {
    res.status(500).json({ found: false, error: e.message });
  }
}
