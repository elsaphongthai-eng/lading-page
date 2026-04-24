import urllib.request
import json

url = "https://project-fa985.vercel.app/api/ipn"
data = json.dumps({
    "content": "CHAMTEST123",
    "amount": 2000
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
