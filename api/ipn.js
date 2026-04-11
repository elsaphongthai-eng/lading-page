export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;
    const content = body.transaction_content || '';
    const amount = parseInt(body.amount_in || 0);

    const match = content.match(/CHAM\d+/);
    if (match && amount >= 1000) {
      const orderCode = match[0];
      const upstashUrl = process.env.KV_REST_API_URL;
      const upstashToken = process.env.KV_REST_API_TOKEN;
      
      const setUrl = `${upstashUrl}/set/order_${orderCode}/paid`;
      await fetch(setUrl, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['EX', '86400'])
      });
    }

    res.status(200).json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
