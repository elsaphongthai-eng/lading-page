export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const headers = { Authorization: `Bearer ${token}` };

    const [r1, r2, r3] = await Promise.all([
      fetch(`${url}/lrange/orders/0/100`, { headers }),
      fetch(`${url}/lrange/customers/0/100`, { headers }),
      fetch(`${url}/lrange/products/0/100`, { headers })
    ]);

    const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);

    const parseProducts = arr => (arr || []).map(o => {
      if (typeof o === 'object') return o;
      // Try JSON first
      try { return JSON.parse(o); } catch(e) {}
      // Try pipe format: name|price|desc
      if (o.includes('|')) {
        const [name, price, desc] = o.split('|');
        return { name, price: parseInt(price) || 0, desc };
      }
      return { name: o, price: 0, desc: '' };
    });

    const parseOrders = arr => (arr || []).map(o => {
      if (typeof o === 'object') return o;
      try { return JSON.parse(o); } catch(e) { return { code: o }; }
    });

    res.json({
      orders: parseOrders(d1.result),
      customers: parseOrders(d2.result),
      products: parseProducts(d3.result)
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
