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

    const parse = arr => (arr || []).map(o => {
      if (typeof o !== 'string') return o;
      try { return JSON.parse(o); } catch(e) {}
      try { return JSON.parse(o.replace(/\\"/g, '"').replace(/\\n/g, '')); } catch(e) {}
      // Xử lý format bị escape kiểu \name\:\value\
      try {
        const fixed = o.replace(/\\([^\\])/g, '"$1').replace(/\\/g, '"');
        return JSON.parse(fixed);
      } catch(e) {}
      return { raw: o };
    });

    res.json({
      orders: parse(d1.result),
      customers: parse(d2.result),
      products: parse(d3.result)
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
