export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { code, status } = req.body;

    if (!code || !status) {
      return res.status(400).json({ error: 'Missing code or status' });
    }

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Doc toan bo danh sach orders tu Upstash
    const r = await fetch(`${url}/lrange/orders/0/1000`, { headers });
    const d = await r.json();
    const raw = d.result || [];

    // 2. Parse tung phan tu
    const orders = raw.map(o => {
      if (typeof o === 'object') return o;
      try { return JSON.parse(o); } catch(e) { return { code: o }; }
    });

    // 3. Tim va cap nhat don hang theo code
    let found = false;
    let updatedOrder = null;
    const updated = orders.map(o => {
      if (o.code && o.code.toUpperCase() === code.toUpperCase()) {
        found = true;
        updatedOrder = {
          ...o,
          status,
          approved_time: new Date().toISOString()
        };
        return updatedOrder;
      }
      return o;
    });

    if (!found) {
      return res.status(404).json({ error: `Order ${code} not found` });
    }

    // 4. Xoa list cu tren Upstash
    await fetch(`${url}/del/orders`, { method: 'POST', headers });

    // 5. Ghi lai toan bo list theo thu tu goc (rpush de giu thu tu)
    for (const order of updated) {
      await fetch(
        `${url}/rpush/orders/${encodeURIComponent(JSON.stringify(order))}`,
        { method: 'POST', headers }
      );
    }

    // 6. Neu duyet thanh paid -> gui email xac nhan cho khach
    if (status === 'paid' && updatedOrder) {
      try {
        // Tim thong tin khach hang
        const customersRes = await fetch(`${url}/lrange/customers/0/100`, { headers });
        const customersData = await customersRes.json();
        const customers = (customersData.result || []).map(c => {
          if (typeof c === 'object') return c;
          try { return JSON.parse(c); } catch { return null; }
        }).filter(Boolean);

        // Tim khach hang theo code don
        const customer = customers.find(
          c => c.code && c.code.toUpperCase() === code.toUpperCase()
        );

        // Neu khong tim thay trong customers, lay tu chinh don hang
        const email = (customer && customer.email) || updatedOrder.email;
        const name = (customer && customer.name) || updatedOrder.name || 'Chị em';
        const amount = updatedOrder.amount || 990000;

        if (email) {
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          const emailRes = await fetch(`https://${host}/api/send-order-confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name,
              code: code.toUpperCase(),
              amount,
              product: 'Cham Hanh Trinh Vuon Minh Ruc Ro'
            })
          });
          console.log('Manual approval email sent to:', email, '| status:', emailRes.status);
        } else {
          console.log('No email found for order:', code);
        }
      } catch(e) {
        console.error('Error sending approval email:', e);
        // Khong throw - van tra ve success vi don da duoc cap nhat
      }
    }

    res.json({ success: true, code: code.toUpperCase(), status });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
