// Webhook IPN từ SePay. Phân biệt gói theo SỐ TIỀN:
//   amount >= 750000 && amount < 900000  -> Khoá 21 Ngày Dáng Ngọc An Nhiên (799K)
//   else                                 -> Chạm Hành Trình Vươn Mình Rực Rỡ (990K, mặc định cũ)
// Mã đơn: hỗ trợ cả tiền tố CHAM (cũ) và DNAN (Dáng Ngọc An Nhiên, mới).

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('IPN received:', req.body);

  const body = req.body;
  const content = body.transaction_content || body.content || body.description || '';
  const amount = parseInt(body.transferAmount || body.amount_in || body.amount || 0);
  const match = content.match(/(?:CHAM|DNAN)[A-Z0-9]+/i);
  console.log('content:', content, 'amount:', amount, 'match:', match);

  if (match && amount >= 1000) {
    const orderCode = match[0].toUpperCase();
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

    // Tìm thông tin khách hàng
    try {
      const customersRes = await fetch(`${url}/lrange/customers/0/100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const customersData = await customersRes.json();
      const customers = (customersData.result || []).map(c => {
        try { return JSON.parse(c); } catch { return null; }
      }).filter(Boolean);

      console.log('orderCode looking for:', orderCode);
      const customer = customers.find(c => c.code && c.code.toUpperCase() === orderCode);
      console.log('Customer found:', customer);

      if (customer && customer.email) {
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const protocol = 'https';

        // Phân biệt gói theo số tiền (an toàn: chỉ thêm nhánh 799K, giữ y nguyên hành vi cũ)
        const is799k = amount >= 750000 && amount < 900000;
        const endpoint  = is799k ? 'send-order-confirm-21ngay-dangngoc' : 'send-order-confirm';
        const product   = is799k ? 'Khoá 21 Ngày Dáng Ngọc An Nhiên' : 'Chạm Hành Trình Vươn Mình Rực Rỡ';
        console.log('Payment type:', is799k ? '799K (Dáng Ngọc An Nhiên)' : '990K (Chạm Hành Trình)', '| amount:', amount);

        const response = await fetch(`${protocol}://${host}/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customer.email,
            name: customer.name,
            code: orderCode,
            amount: amount,
            product: product
          })
        });
        console.log('Sent confirmation email to:', customer.email);
        console.log('Email API response:', response.status);
      }
    } catch(e) {
      console.error('Error sending confirmation email:', e);
    }
  }

  res.status(200).json({ success: true });
}
