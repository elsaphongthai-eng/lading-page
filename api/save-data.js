export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { key, value } = req.body;
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    await fetch(`${url}/lpush/${key}/${JSON.stringify(value)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
