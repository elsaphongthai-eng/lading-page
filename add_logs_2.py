import codecs

with codecs.open(r'c:\Users\LAM DAT\Desktop\lading-page-main\api\ipn.js', 'r', 'utf-8') as f:
    content = f.read()

# Target line to insert before
target = "const customer = customers.find(c => c.code === orderCode);"

# New logs to inject
logs = """console.log('orderCode looking for:', orderCode);
      console.log('All customers data:', JSON.stringify(customers));
      const customer = customers.find(c => c.code === orderCode);"""

if target in content:
    content = content.replace(target, logs)

with codecs.open(r'c:\Users\LAM DAT\Desktop\lading-page-main\api\ipn.js', 'w', 'utf-8') as f:
    f.write(content)

print("Added detailed customer logs.")
