export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('BODY:', JSON.stringify(req.body));
  
  const body = req.body;
  const content = body.transaction_content || body.content || body.description || '';
  const amount = parseInt(body.amount_in || body.amount || body.transferAmount || 0);
  
  console.log('content:', content, 'amount:', amount);

  const match = content.match(/CHAM\d+/);
  if (match && amount >= 1000) {
    const orderCode = match[0];
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    await fetch(`${url}/set/order_${orderCode}/paid`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Saved:', orderCode);
  }

  res.status(200).json({ success: true });
}
