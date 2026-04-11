export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;
    const content = body.transaction_content || '';
    const amount = parseInt(body.amount_in || 0);

    const match = content.match(/CHAM\d+/);
    if (match && amount >= 1000) {
      const orderCode = match[0];
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;
      
      await fetch(`${url}/set/order:${orderCode}/paid/ex/86400`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    res.status(200).json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
