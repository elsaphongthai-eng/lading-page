"""Fix nested template literal trong onclick copy button."""
p = '/var/www/elsaphuong-admin/index.html'
with open(p, encoding='utf-8') as f: t = f.read()

# Đoạn cần fix — tìm bằng marker unique
if 'showToast(' in t and 'Đã copy link' in t:
    # Line 563: onclick copy — thay toàn bộ dòng
    import re
    # Pattern: showToast('Đã copy link của '+`${...}`, 'success')
    fixed_count = 0
    # Replace nested template với plain
    pattern = re.compile(r"showToast\('Đã copy link của '\+`\$\{[^`]+\}`, 'success'\)")
    new_str = "showToast('Đã copy link', 'success')"
    t_new, n = pattern.subn(new_str, t)
    if n > 0:
        with open(p, 'w', encoding='utf-8') as f: f.write(t_new)
        print(f'[ok] fixed {n} occurrence')
    else:
        print('[skip] pattern not found — probably already fixed')
        # Show context around 'Đã copy'
        idx = t.find('Đã copy')
        print(t[max(0,idx-50):idx+200])
