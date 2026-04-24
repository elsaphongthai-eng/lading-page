import urllib.request
import json

url = "https://project-fa985.vercel.app/api/send-order-confirm"
data = json.dumps({
    "email": "lamdat18@gmail.com",
    "name": "Dat testing system",
    "code": "CHAM123",
    "amount": 1000,
    "product": "System Diagnostic Test"
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')

try:
    response = urllib.request.urlopen(req)
    print("STATUS:", response.status)
    print("RESPONSE:", response.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
    if hasattr(e, 'read'):
        print("ERROR BODY:", e.read().decode('utf-8'))
