export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('BODY:', JSON.stringify(req.body));

  const body = req.body;
  const content = body.transaction_content || body.content || body.description || '';
  const amount = parseInt(body.amount_in || body.amount || 0);
  const match = content.match(/CHAM\d+/);

  if (match && amount >= 1000) {
    const orderCode = match[0];
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    // Lưu trạng thái thanh toán
    await fetch(`${url}/set/order_${orderCode}/paid`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Lưu đơn hàng vào danh sách
    const order = {
      code: orderCode,
      amount,
      content,
      time: new Date().toISOString(),
      status: 'paid'
    };

    await fetch(`${url}/lpush/orders/${JSON.stringify(order)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Saved order:', orderCode);
  }

  res.status(200).json({ success: true });
}
