export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { order_code } = req.query;
  if (!order_code) return res.status(400).json({ found: false });

  try {
    const response = await fetch(
      'https://my.sepay.vn/userapi/transactions/list?account_number=0945461368&limit=20',
      {
        method: 'GET',
        headers: {
         'Authorization': 'Bearer spsk_live_BPS7BrW5BooQKJJJpxo6HjjU3fFQKpQ6', 
          'Content-Type': 'application/json'
        }
      }
    );
    
    const text = await response.text();
    console.log('SePay response:', text);
    
    let data;
    try { data = JSON.parse(text); } 
    catch(e) { return res.json({ found: false, error: 'Parse error', raw: text.slice(0,200) }); }
    
    const found = data.transactions?.some(t =>
      t.transaction_content?.includes(order_code) &&
      parseInt(t.amount_in) >= 990000
    );
    
    res.json({ found: !!found, count: data.transactions?.length });
  } catch(e) {
    res.status(500).json({ found: false, error: e.message });
  }
}
