export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('IPN received:', req.body);

  const body = req.body;
  const content = body.transaction_content || body.content || body.description || '';
  const amount = parseInt(body.transferAmount || body.amount_in || body.amount || 0);
  const match = content.match(/CHAM[A-Z0-9]+/i);
  console.log('content:', content, 'amount:', amount, 'match:', match);

  if (match && amount >= 1000) {
    const orderCode = match[0].toUpperCase();
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Danh dau thanh toan thanh cong (dung boi check-payment.js)
    await fetch(`${url}/set/order_${orderCode}/paid`, { headers });

    // 2. Doc danh sach orders, tim don pending co cung orderCode
    let orderSaved = false;
    try {
      const listRes = await fetch(`${url}/lrange/orders/0/1000`, { headers });
      const listData = await listRes.json();
      const rawOrders = listData.result || [];

      const orders = rawOrders.map(o => {
        if (typeof o === 'object') return o;
        try { return JSON.parse(o); } catch(e) { return null; }
      }).filter(Boolean);

      const pendingIndex = orders.findIndex(
        o => o.code && o.code.toUpperCase() === orderCode && o.status === 'pending'
      );

      if (pendingIndex !== -1) {
        // Tim thay don pending -> cap nhat status va amount thuc te
        orders[pendingIndex] = {
          ...orders[pendingIndex],
          status: 'paid',
          amount: amount,
          paid_time: new Date().toISOString()
        };

        // Ghi lai toan bo list (xoa cu -> rpush theo thu tu)
        await fetch(`${url}/del/orders`, { method: 'POST', headers });
        for (const order of orders) {
          await fetch(
            `${url}/rpush/orders/${encodeURIComponent(JSON.stringify(order))}`,
            { method: 'POST', headers }
          );
        }
        console.log('Updated pending order to paid:', orderCode);
        orderSaved = true;
      }
    } catch(e) {
      console.error('Error reading/updating orders list:', e);
    }

    // 3. Neu khong tim thay don pending -> tao don moi paid (fallback)
    if (!orderSaved) {
      const newOrder = {
        code: orderCode,
        amount,
        content,
        time: new Date().toISOString(),
        status: 'paid'
      };
      await fetch(
        `${url}/lpush/orders/${encodeURIComponent(JSON.stringify(newOrder))}`,
        { headers }
      );
      console.log('Created new paid order (no pending found):', orderCode);
    }

    // 4. Tim thong tin khach hang va gui email xac nhan (khong thay doi)
    try {
      const customersRes = await fetch(`${url}/lrange/customers/0/100`, { headers });
      const customersData = await customersRes.json();
      const customers = (customersData.result || []).map(c => {
        try { return JSON.parse(c); } catch { return null; }
      }).filter(Boolean);

      console.log('orderCode looking for:', orderCode);
      const customer = customers.find(c => c.code && c.code.toUpperCase() === orderCode);
      console.log('Customer found:', customer);

      if (customer && customer.email) {
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const response = await fetch(`https://${host}/api/send-order-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customer.email,
            name: customer.name,
            code: orderCode,
            amount: amount,
            product: 'Cham Hanh Trinh Vuon Minh Ruc Ro'
          })
        });
        console.log('Sent confirmation email to:', customer.email, '| status:', response.status);
      }
    } catch(e) {
      console.error('Error sending confirmation email:', e);
    }
  }

  res.status(200).json({ success: true });
}