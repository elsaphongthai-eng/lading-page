// Webhook IPN từ SePay. Phân biệt gói theo SỐ TIỀN:
//   amount >= 750000 && amount < 900000  -> Khoá 21 Ngày Dáng Ngọc An Nhiên (799K)
//   else                                 -> Chạm Hành Trình Vươn Mình Rực Rỡ (990K, mặc định cũ)
// Mã đơn: hỗ trợ cả tiền tố CHAM (cũ) và DNAN (Dáng Ngọc An Nhiên, mới).
//
// 799K paid → sinh Student ID + password → lưu user_<email> Upstash → email kèm credentials.

// 4 ký tự random, bỏ I/O/L/0/1 cho dễ đọc trên điện thoại
function generatePassword(length) {
  length = length || 4;
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let p = '';
  for (let i = 0; i < length; i++) {
    p += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return p;
}

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

        const is799k = amount >= 750000 && amount < 900000;
        const endpoint  = is799k ? 'send-order-confirm-21ngay-dangngoc' : 'send-order-confirm';
        const product   = is799k ? 'Khoá 21 Ngày Dáng Ngọc An Nhiên' : 'Chạm Hành Trình Vươn Mình Rực Rỡ';
        console.log('Payment type:', is799k ? '799K (Dáng Ngọc An Nhiên)' : '990K (Chạm Hành Trình)', '| amount:', amount);

        // ===== 799K: sinh Student ID + password + lưu user record =====
        let studentId = null, password = null;
        if (is799k) {
          try {
            // Kiểm tra đã có user record chưa (idempotent — webhook có thể retry)
            const existingRes = await fetch(`${url}/get/user_${encodeURIComponent(customer.email.toLowerCase())}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existingData = await existingRes.json();
            if (existingData.result) {
              const existing = JSON.parse(existingData.result);
              studentId = existing.studentId;
              password = existing.password;
              console.log('User record đã tồn tại, dùng lại:', studentId);
            } else {
              // INCR atomic counter
              const incrRes = await fetch(`${url}/incr/student_count`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const incrData = await incrRes.json();
              const studentNum = incrData.result;
              studentId = 'DNAN' + String(studentNum).padStart(3, '0');
              password = generatePassword(4);

              const userRecord = {
                studentId,
                password,
                email: customer.email.toLowerCase(),
                name: customer.name || '',
                phone: customer.phone || '',
                orderCode,
                ngay_tham_gia: new Date().toISOString().slice(0, 10),
                status: 'active'
              };
              await fetch(`${url}/set/user_${encodeURIComponent(customer.email.toLowerCase())}/${encodeURIComponent(JSON.stringify(userRecord))}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('Created user record:', studentId, 'pwd:', password);
            }
          } catch (e) {
            console.error('Error creating user record:', e);
          }
        }

        const response = await fetch(`${protocol}://${host}/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customer.email,
            name: customer.name,
            code: orderCode,
            amount: amount,
            product: product,
            studentId,
            password
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
