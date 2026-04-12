export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    
    // Lấy danh sách đơn hàng
    const r = await fetch(`${url}/lrange/orders/0/100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    const orders = (data.result || []).map(o => {
      try { return JSON.parse(o); } catch(e) { return null; }
    }).filter(Boolean);

    // Lấy danh sách khách hàng
    const r2 = await fetch(`${url}/lrange/customers/0/100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data2 = await r2.json();
    const customers = (data2.result || []).map(c => {
      try { return JSON.parse(c); } catch(e) { return null; }
    }).filter(Boolean);

    // Lấy danh sách sản phẩm
    const r3 = await fetch(`${url}/lrange/products/0/100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data3 = await r3.json();
    const products = (data3.result || []).map(p => {
      try { return JSON.parse(p); } catch(e) { return null; }
    }).filter(Boolean);

    res.json({ orders, customers, products });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
