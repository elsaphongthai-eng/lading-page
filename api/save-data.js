export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { key, value } = req.body;
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    let data;
    if (key === 'products') {
      data = `${value.name}|${value.price}|${value.desc}`;
    } else {
      data = JSON.stringify(value);
    }

    await fetch(`${url}/lpush/${key}/${encodeURIComponent(data)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
