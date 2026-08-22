#!/usr/bin/env python3
"""
Upstash Redis daily backup — dump toàn bộ keys ra JSON.gz.

Usage:
  python3 upstash-backup.py [dump|restore <file>]

Cron (đã cài /etc/cron.d/upstash-backup):
  0 4 * * * root /usr/bin/python3 /opt/upstash-backup/upstash-backup.py dump

Backups lưu tại /opt/upstash-backup/backups/upstash-YYYYMMDD-HHMMSS.json.gz
Rotate: giữ 30 file cuối.
"""
import os, sys, json, gzip, glob, time, urllib.request, urllib.parse

# Config đọc từ /opt/my-website/.env (đã có sẵn)
def load_env():
    env = {}
    with open('/opt/my-website/.env') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line: continue
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env

E = load_env()
URL = E['KV_REST_API_URL']
TOKEN = E['KV_REST_API_TOKEN']
BACKUP_DIR = '/opt/upstash-backup/backups'
KEEP_DAYS = 30

def req(path, method='GET', body=None):
    """Call Upstash REST API."""
    r = urllib.request.Request(f'{URL}/{path}', method=method,
        headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'},
        data=json.dumps(body).encode() if body else None)
    return json.loads(urllib.request.urlopen(r, timeout=30).read())

def scan_all_keys():
    """SCAN cursor loop → yield all keys."""
    cursor = '0'
    while True:
        r = req(f'scan/{cursor}?count=500')
        cursor, keys = r['result']
        for k in keys: yield k
        if cursor == '0': break

def dump_key(key):
    """Get value + type. Returns (type, value)."""
    t = req(f'type/{urllib.parse.quote(key, safe="")}')['result']
    if t == 'string':
        return ('string', req(f'get/{urllib.parse.quote(key, safe="")}')['result'])
    if t == 'list':
        return ('list', req(f'lrange/{urllib.parse.quote(key, safe="")}/0/-1')['result'])
    if t == 'hash':
        return ('hash', req(f'hgetall/{urllib.parse.quote(key, safe="")}')['result'])
    if t == 'set':
        return ('set', req(f'smembers/{urllib.parse.quote(key, safe="")}')['result'])
    if t == 'zset':
        return ('zset', req(f'zrange/{urllib.parse.quote(key, safe="")}/0/-1?withscores=true')['result'])
    return ('unknown', None)

def do_dump():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    ts = time.strftime('%Y%m%d-%H%M%S')
    out = f'{BACKUP_DIR}/upstash-{ts}.json.gz'
    data = {'meta': {'ts': ts, 'source': URL}, 'keys': {}}
    n = 0
    for k in scan_all_keys():
        try:
            t, v = dump_key(k)
            data['keys'][k] = {'type': t, 'value': v}
            n += 1
        except Exception as e:
            print(f'[warn] key {k!r}: {e}', file=sys.stderr)
    with gzip.open(out, 'wt', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    size = os.path.getsize(out)
    print(f'[ok] dumped {n} keys → {out} ({size:,} bytes)')

    # Rotate: giữ KEEP_DAYS file cuối
    files = sorted(glob.glob(f'{BACKUP_DIR}/upstash-*.json.gz'))
    for old in files[:-KEEP_DAYS]:
        os.remove(old); print(f'[rotate] deleted {old}')

def do_restore(path):
    """Restore từ backup file. CẨN THẬN — sẽ overwrite key hiện tại."""
    with gzip.open(path, 'rt', encoding='utf-8') as f:
        data = json.load(f)
    print(f'[restore] {len(data["keys"])} keys từ {data["meta"]["ts"]}')
    print(f'[restore] target: {URL}')
    if input('Type YES to confirm: ') != 'YES':
        print('cancelled'); return
    for k, entry in data['keys'].items():
        t, v = entry['type'], entry['value']
        kq = urllib.parse.quote(k, safe='')
        try:
            if t == 'string':
                req(f'set/{kq}/{urllib.parse.quote(v, safe="")}')
            elif t == 'list':
                req(f'del/{kq}')  # clear trước
                for item in v:
                    req(f'rpush/{kq}/{urllib.parse.quote(item, safe="")}')
            elif t == 'hash':
                req(f'del/{kq}')
                # HSET pairs
                req(f'hset/{kq}', method='POST', body=v)
            elif t == 'set':
                req(f'del/{kq}')
                for m in v: req(f'sadd/{kq}/{urllib.parse.quote(m, safe="")}')
            print(f'[ok] {t} {k}')
        except Exception as e:
            print(f'[err] {k}: {e}')

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'dump'
    if cmd == 'dump': do_dump()
    elif cmd == 'restore' and len(sys.argv) > 2: do_restore(sys.argv[2])
    else:
        print('Usage: upstash-backup.py [dump|restore <file>]')
        sys.exit(1)
