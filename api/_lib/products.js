// Product config table — map orderCode prefix → product info.
// Thêm gói mới: chỉ cần add 1 entry, không đụng ipn/save-data.
//
// codePrefix   : regex prefix (uppercase, ASCII only)
// amount       : giá VND (bắt buộc match trong IPN với sai số ±1000)
// name         : tên khoá (dùng cho email + Telegram)
// slug         : dùng cho payment URL
// sendRegEmail : endpoint email "chúc mừng đăng ký" (chưa paid) — có thể null nếu chưa có
// sendConfirmEmail: endpoint email "đã thanh toán" (kèm credentials)
// createStudent: true = sinh EP + password sau khi paid (khoá học có login), false = ebook/dịch vụ 1 lần
// telegramLabel: text tag ngắn cho Bot Đậu

export const PRODUCTS = [
  {
    codePrefix: 'DNAN',
    amount: 799000,
    name: 'Khoá 21 Ngày Dáng Ngọc An Nhiên',
    slug: '21ngay-dangngoc',
    sendRegEmail: 'send-registration-email',            // legacy endpoint
    sendConfirmEmail: 'send-order-confirm-21ngay-dangngoc',
    createStudent: true,
    telegramLabel: 'Dáng Ngọc An Nhiên'
  },
  {
    codePrefix: 'GDCN',
    amount: 399000,
    name: 'Gội Đầu Thông Khí — Gói Cá Nhân',
    slug: 'goi-dau-thong-khi',
    emailModule: 'goi-dau',       // ← module trong _lib/emails-*.js
    createStudent: true,
    telegramLabel: 'Gội Đầu · Cá Nhân'
  },
  {
    codePrefix: 'GDDV',
    amount: 999000,
    name: 'Gội Đầu Thông Khí — Gói Dịch Vụ',
    slug: 'goi-dau-thong-khi',
    emailModule: 'goi-dau',
    createStudent: true,
    telegramLabel: 'Gội Đầu · Dịch Vụ'
  },
  {
    codePrefix: 'CHAM',
    amount: 990000,
    name: 'Chạm Hành Trình Vươn Mình Rực Rỡ',
    slug: 'cham-hanh-trinh',
    sendRegEmail: null,          // luồng cũ dùng send-email.js drip 3 email
    sendConfirmEmail: 'send-order-confirm',
    createStudent: false,        // luồng cũ chưa có student login
    telegramLabel: 'Chạm Hành Trình'
  }
];

// Regex bắt tất cả prefix (case-insensitive). Auto-build từ PRODUCTS.
export const CODE_REGEX = new RegExp(
  '(?:' + PRODUCTS.map(p => p.codePrefix).join('|') + ')[A-Z0-9]+',
  'i'
);

// Lookup product từ orderCode. Fallback null nếu không match.
export function productFromCode(orderCode) {
  if (!orderCode) return null;
  const upper = orderCode.toUpperCase();
  return PRODUCTS.find(p => upper.startsWith(p.codePrefix)) || null;
}

// Nếu có nhiều product cùng prefix (không nên), phân biệt bằng amount.
export function productFromCodeAndAmount(orderCode, amount) {
  const upper = (orderCode || '').toUpperCase();
  const candidates = PRODUCTS.filter(p => upper.startsWith(p.codePrefix));
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1 && amount) {
    return candidates.reduce((best, p) =>
      !best || Math.abs(p.amount - amount) < Math.abs(best.amount - amount) ? p : best
    , null);
  }
  return candidates[0] || null;
}
