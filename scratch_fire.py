import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
queries = [
    'massive fireball explosion night cinematic 4k wallpaper',
    'cinematic fiery explosion dark background 4k',
    'action movie explosion fiery smoke 4k'
]

for q in queries:
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(q) + '&qft=+filterui:imagesize-wallpaper'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+?\.(?:jpg|png|jpeg))&quot;', html)
            print(f'Query: {q} -> Found {len(murls)} images')
            for i, u in enumerate(murls[:3]):
                try:
                    req_img = urllib.request.Request(u, headers=headers)
                    with urllib.request.urlopen(req_img, timeout=8) as ir:
                        data = ir.read()
                        if len(data) > 100000:
                            clean_q = re.sub(r'[^a-zA-Z0-9]', '_', q)[:15]
                            fname = f'public/assets/fire_bg_{clean_q}_{i}.jpg'
                            with open(fname, 'wb') as f:
                                f.write(data)
                            print(f'  Saved {fname} ({len(data)} bytes)')
                except Exception as e:
                    pass
    except Exception as e:
        print('Error:', e)
