import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;
    const content = body.transaction_content || '';
    const amount = parseInt(body.amount_in || 0);

    if (amount >= 990000) {
      // Tìm mã đơn hàng CHAM... trong nội dung CK
      const match = content.match(/CHAM\d+/);
      if (match) {
        const orderCode = match[0];
        // Lưu trạng thái vào Vercel KV
        await kv.set(`order:${orderCode}`, 'paid', { ex: 86400 });
      }
    }

    res.status(200).json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
