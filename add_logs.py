import codecs

with codecs.open(r'c:\Users\LAM DAT\Desktop\lading-page-main\api\ipn.js', 'r', 'utf-8') as f:
    content = f.read()

# 1. Update the first console log
content = content.replace(
    "console.log('BODY:', JSON.stringify(req.body));",
    "console.log('IPN received:', req.body);"
)

# 2. Add customer found log
content = content.replace(
    "const customer = customers.find(c => c.code === orderCode);",
    "const customer = customers.find(c => c.code === orderCode);\n      console.log('Customer found:', customer);"
)

# 3. Capture fetch response and log status
# First let's find the fetch command and assign it to "const response"
if "await fetch(`${protocol}://${host}/api/send-order-confirm`" in content:
    content = content.replace(
        "await fetch(`${protocol}://${host}/api/send-order-confirm`",
        "const response = await fetch(`${protocol}://${host}/api/send-order-confirm`"
    )

# Then add the status log right after the console.log('Sent confirmation email to:'...)
if "console.log('Sent confirmation email to:', customer.email);" in content:
    content = content.replace(
        "console.log('Sent confirmation email to:', customer.email);",
        "console.log('Sent confirmation email to:', customer.email);\n        console.log('Email API response:', response.status);"
    )

with codecs.open(r'c:\Users\LAM DAT\Desktop\lading-page-main\api\ipn.js', 'w', 'utf-8') as f:
    f.write(content)

print("Added console.logs")
