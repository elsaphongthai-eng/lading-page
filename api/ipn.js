export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;
    const content = body.transaction_content || '';
    const amount = parseInt(body.amount_in || 0);

    console.log('IPN received:', JSON.stringify(body));

    if (amount >= 1000) {
      const match = content.match(/CHAM\d+/);
      if (match) {
        const orderCode = match[0];
        // Lưu vào Upstash Redis
        const url = process.env.KV_REST_API_URL;
        const token = process.env.KV_REST_API_TOKEN;
        await fetch(`${url}/set/order:${orderCode}/paid`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Order marked paid:', orderCode);
      }
    }

    res.status(200).json({ success: true });
  } catch(e) {
    console.error('IPN error:', e);
    res.status(500).json({ error: e.message });
  }
}
