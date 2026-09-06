import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
queries = [
    'Captain America First Avenger explosion forest shield throw',
    'Captain America First Avenger rescue Bucky explosion shield',
    'Captain America throwing shield like a boss',
    'Captain America Age of Ultron opening forest explosion shield throw'
]

for q in queries:
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(q) + '&qft=+filterui:imagesize-large'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+?\.(?:jpg|png|jpeg))&quot;', html)
            print(f'Query: {q} -> Found {len(murls)} images')
            for i, u in enumerate(murls[:5]):
                try:
                    req_img = urllib.request.Request(u, headers=headers)
                    with urllib.request.urlopen(req_img, timeout=8) as ir:
                        data = ir.read()
                        if len(data) > 60000:
                            clean_q = re.sub(r'[^a-zA-Z0-9]', '_', q)[:20]
                            fname = f'public/assets/candidate_{clean_q}_{i}.jpg'
                            with open(fname, 'wb') as f:
                                f.write(data)
                            print(f'  Saved {fname} ({len(data)} bytes)')
                except Exception as e:
                    pass
    except Exception as e:
        print(f'Error for {q}: {e}')
