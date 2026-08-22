// Endpoint đa dụng:
//   ?order_code=X                                → check trạng thái đơn (paid?)
//   ?coupon=CODE&amount=X&course=X               → validate coupon + trả giá sau giảm

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const upstashUrl = process.env.KV_REST_API_URL;
  const upstashToken = process.env.KV_REST_API_TOKEN;
  const headers = { Authorization: `Bearer ${upstashToken}` };

  const { order_code, coupon, amount, course } = req.query;

  // ==== Check coupon ====
  if (coupon) {
    try {
      const code = String(coupon).trim().toUpperCase();
      const r = await fetch(`${upstashUrl}/get/coupon:${encodeURIComponent(code)}`, { headers });
      const data = await r.json();
      if (!data.result) return res.json({ valid: false, message: 'Mã giảm giá không tồn tại' });
      const c = JSON.parse(data.result);
      // Kiểm tra hết hạn
      if (c.expires && new Date(c.expires) < new Date()) {
        return res.json({ valid: false, message: 'Mã đã hết hạn' });
      }
      // Kiểm tra số lượt còn
      if (typeof c.uses_left === 'number' && c.uses_left <= 0) {
        return res.json({ valid: false, message: 'Mã đã hết lượt sử dụng' });
      }
      // Kiểm tra khoá áp dụng
      if (course && Array.isArray(c.applies_to) && c.applies_to.length > 0 && !c.applies_to.includes(course)) {
        return res.json({ valid: false, message: 'Mã không áp dụng cho khoá này' });
      }
      // Tính giảm
      const amt = Number(amount) || 0;
      let discount = 0;
      if (c.discount_amount) discount = Number(c.discount_amount);
      else if (c.discount_percent) discount = Math.round(amt * c.discount_percent / 100);
      const final = Math.max(0, amt - discount);
      return res.json({
        valid: true, code, discount, final,
        discount_percent: c.discount_percent || null,
        discount_amount: c.discount_amount || null,
        message: `Áp dụng thành công: giảm ${discount.toLocaleString('vi-VN')}đ`
      });
    } catch (e) { return res.status(500).json({ valid: false, error: e.message }); }
  }

  // ==== Check order status (cũ) ====
  if (!order_code) return res.status(400).json({ found: false });
  try {
    const r = await fetch(`${upstashUrl}/get/order_${order_code}`, { headers });
    const data = await r.json();
    res.json({ found: data.result === 'paid' });
  } catch (e) {
    res.status(500).json({ found: false, error: e.message });
  }
}
