import codecs

with codecs.open(r'c:\Users\LAM DAT\Desktop\lading-page-main\api\ipn.js', 'r', 'utf-8') as f:
    content = f.read()

# Fix 1: Protocol Dynamic URL
target1 = "await fetch('https://www.elsaphuong.com/api/send-order-confirm'"
replacement1 = """const host = req.headers['x-forwarded-host'] || req.headers.host;
        const protocol = 'https';
        await fetch(`${protocol}://${host}/api/send-order-confirm`"""
content = content.replace(target1, replacement1)

# Fix 2: Order Matching Logic
target2 = "const customer = customers[0];"
replacement2 = "const customer = customers.find(c => c.code === orderCode);"
content = content.replace(target2, replacement2)

with codecs.open(r'c:\Users\LAM DAT\Desktop\lading-page-main\api\ipn.js', 'w', 'utf-8') as f:
    f.write(content)

print("Applied API logic fixes.")
