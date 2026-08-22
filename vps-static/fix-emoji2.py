"""Fix double-encoded emoji: bytes UTF-8 emoji đã bị đọc Latin-1 + re-encode UTF-8."""
import re, os

def fix_dbl_encoded(t):
    """Chỉ decode lại các đoạn liên tiếp start bằng ký tự U+00C3 (Ã) hoặc U+00F0 (ð)
       — đây là dấu hiệu bytes UTF-8 bị mis-decode Latin-1."""
    # Đơn giản: regex tìm sequence các byte-echo Latin-1 (Ã, ð, â, Â...) ≥ 2 chars
    # rồi thử decode như UTF-8. Nếu OK và ra ký tự > ÿ thì replace.
    def replace(m):
        seg = m.group(0)
        try:
            fixed = seg.encode('latin-1').decode('utf-8')
            # Chỉ chấp nhận nếu output có ít nhất 1 char > U+007F
            if any(ord(c) > 127 for c in fixed) and len(fixed) < len(seg):
                return fixed
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass
        return seg
    # Sequence các char thuộc range U+00C0..U+00FF (Latin-1 supplement chars typical mis-decode)
    return re.sub(r'[À-ÿ][-ÿ]+', replace, t)

PAGES = [
    '/var/www/elsaphuong-thanh-toan-goi-dau/index.html',
]
for p in PAGES:
    if not os.path.exists(p): continue
    with open(p, encoding='utf-8') as f: t = f.read()
    fixed = fix_dbl_encoded(t)
    if fixed != t:
        with open(p, 'w', encoding='utf-8') as f: f.write(fixed)
        # Đếm bytes 0xC3 0xB0 để verify (ð UTF-8)
        with open(p, 'rb') as f: b = f.read()
        remaining = b.count(b'\xc3\xb0\xc2')
        print(f'[fixed] {p} — còn {remaining} sequence corrupt (mong 0)')
    else:
        print(f'[skip] {p} — không thay đổi')
