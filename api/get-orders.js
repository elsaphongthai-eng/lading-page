// Endpoint đa dụng: /api/get-orders (backward compat) + /api/get-orders?resource=users|leads|orders
//
// Auth admin: yêu cầu header `X-Admin-Token: <ADMIN_TOKEN>` cho resource users/leads
// ADMIN_TOKEN được set env Vercel, chỉ Phương/Nam biết.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  // Chấp nhận NHIỀU password: env ADMIN_TOKENS (CSV) hoặc ADMIN_TOKEN (single, legacy).
  // Nam/Phương/Vân có thể dùng cùng 1 password, hoặc mỗi máy 1 password riêng.
  const adminTokens = [
    ...(process.env.ADMIN_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean),
    ...(process.env.ADMIN_TOKEN ? [process.env.ADMIN_TOKEN] : [])
  ];
  const headers = { Authorization: `Bearer ${token}` };
  const resource = req.query.resource;

  // ==== Public: /api/get-orders (giữ nguyên cho code cũ) ====
  if (!resource) {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`${url}/lrange/orders/0/100`, { headers }),
        fetch(`${url}/lrange/customers/0/100`, { headers }),
        fetch(`${url}/lrange/products/0/100`, { headers })
      ]);
      const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
      const parseJson = arr => (arr || []).map(o => {
        if (typeof o === 'object') return o;
        try { return JSON.parse(o); } catch { return { raw: o }; }
      });
      const parseProducts = arr => (arr || []).map(o => {
        if (typeof o === 'object') return o;
        try { return JSON.parse(o); } catch {}
        if (o.includes('|')) {
          const [name, price, desc] = o.split('|');
          return { name, price: parseInt(price) || 0, desc };
        }
        return { name: o, price: 0, desc: '' };
      });
      return res.json({
        orders: parseJson(d1.result),
        customers: parseJson(d2.result),
        products: parseProducts(d3.result)
      });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // ==== Admin: match bất kỳ 1 token nào trong list ====
  const clientToken = req.headers['x-admin-token'];
  if (!clientToken || !adminTokens.includes(clientToken)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    if (resource === 'users' || resource === 'leads') {
      const prefix = resource === 'users' ? 'user_' : 'lead:';
      // SCAN all keys với prefix
      const items = [];
      let cursor = '0';
      let iters = 0;
      do {
        const r = await fetch(`${url}/scan/${cursor}?match=${encodeURIComponent(prefix + '*')}&count=500`, { headers });
        const d = await r.json();
        cursor = d.result[0];
        const keys = d.result[1] || [];
        // Pipeline GET
        if (keys.length) {
          const pipeBody = keys.map(k => ['GET', k]);
          const pr = await fetch(`${url}/pipeline`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(pipeBody)
          });
          const pd = await pr.json();
          keys.forEach((k, i) => {
            const raw = pd[i]?.result;
            if (!raw) return;
            try {
              const obj = JSON.parse(raw);
              items.push({ key: k, ...obj });
            } catch {
              items.push({ key: k, raw });
            }
          });
        }
        iters++;
      } while (cursor !== '0' && iters < 20);
      return res.json({ resource, count: items.length, items });
    }

    if (resource === 'orders') {
      const r = await fetch(`${url}/lrange/orders/0/1000`, { headers });
      const d = await r.json();
      const items = (d.result || []).map(o => {
        try { return JSON.parse(o); } catch { return { raw: o }; }
      });
      return res.json({ resource, count: items.length, items });
    }

    if (resource === 'customers') {
      const r = await fetch(`${url}/lrange/customers/0/1000`, { headers });
      const d = await r.json();
      const items = (d.result || []).map(o => {
        try { return JSON.parse(o); } catch { return { raw: o }; }
      });
      return res.json({ resource, count: items.length, items });
    }

    return res.status(400).json({ error: 'unknown_resource', valid: ['users', 'leads', 'orders', 'customers'] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
