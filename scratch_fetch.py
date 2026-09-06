import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
query = 'Captain America throwing shield explosion movie'
url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&qft=+filterui:imagesize-large'
req = urllib.request.Request(url, headers=headers)

with urllib.request.urlopen(req) as r:
    html = r.read().decode('utf-8', errors='ignore')
    print('Bing html length:', len(html))
    # Bing stores murl: "https://..." in m="{...}"
    murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+?\.(?:jpg|png|jpeg))&quot;', html)
    print('Bing murls:', len(murls))
    for i, u in enumerate(murls[:10]):
        print(f'{i}: {u}')
        try:
            req_img = urllib.request.Request(u, headers=headers)
            with urllib.request.urlopen(req_img, timeout=10) as ir:
                data = ir.read()
                if len(data) > 50000:
                    with open(f'public/assets/cap_bing_scene_{i}.jpg', 'wb') as f:
                        f.write(data)
                    print(f'Saved cap_bing_scene_{i}.jpg ({len(data)} bytes)')
        except Exception as e:
            print(f'Failed {u}: {e}')
