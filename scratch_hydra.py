import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.youtube.com/results?search_query=Captain+America+The+First+Avenger+destroying+Hydra+bases'
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, timeout=10) as r:
        html = r.read().decode('utf-8', errors='ignore')
        vids = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
        print('Unique video IDs:', list(dict.fromkeys(vids))[:6])
        for vid in list(dict.fromkeys(vids))[:6]:
            # test if maxresdefault exists
            thumb_url = f'https://img.youtube.com/vi/{vid}/maxresdefault.jpg'
            try:
                with urllib.request.urlopen(thumb_url, timeout=5) as tr:
                    if tr.status == 200:
                        data = tr.read()
                        with open(f'public/assets/hydra_{vid}.jpg', 'wb') as f:
                            f.write(data)
                        print(f'Downloaded maxres for {vid} ({len(data)} bytes)')
            except Exception as te:
                # try hqdefault
                try:
                    hq_url = f'https://img.youtube.com/vi/{vid}/hqdefault.jpg'
                    with urllib.request.urlopen(hq_url, timeout=5) as hr:
                        if hr.status == 200:
                            data = hr.read()
                            with open(f'public/assets/hydra_{vid}_hq.jpg', 'wb') as f:
                                f.write(data)
                            print(f'Downloaded hq for {vid} ({len(data)} bytes)')
                except Exception as he:
                    pass
except Exception as e:
    print('Error:', e)
