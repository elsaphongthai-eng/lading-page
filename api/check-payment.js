export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { order_code } = req.query;
  if (!order_code) return res.status(400).json({ found: false });

  try {
    const response = await fetch(
      'https://my.sepay.vn/userapi/transactions/list?account_number=0945461368&limit=20',
      {
        headers: {
          'Authorization': 'Bearer spsk_live_BPS7BrW58ooQKJjJpxo6HjjU3fFQKpQ6',
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    const found = data.transactions?.some(t =>
      t.transaction_content?.includes(order_code) &&
      parseInt(t.amount_in) >= 990000
    );
    res.json({ found: !!found });
  } catch(e) {
    res.status(500).json({ found: false, error: e.message });
  }
}
