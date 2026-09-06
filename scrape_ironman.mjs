import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(process.cwd(), 'scratch', 'iron_man_fullres');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      timeout: 12000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      fs.unlink(dest, () => {});
      reject(new Error('Timeout'));
    });
  });
}

async function scrapeIronMan() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const queries = [
    { q: '"Iron Man" "Mark 85" OR "Mark LXXXV" 4k wallpaper 3840x2160', tag: 'im_mk85' },
    { q: '"Iron Man" unibeam blast "Avengers Endgame" 4k wallpaper', tag: 'im_unibeam' },
    { q: '"Iron Man" flight supersonic 4k wallpaper 3840x2160', tag: 'im_flight' },
    { q: 'site:wallpaperaccess.com "iron man endgame 4k"', tag: 'im_wa' },
    { q: 'site:4kwallpapers.com "iron man mark 85" 4k', tag: 'im_4k' }
  ];

  for (const item of queries) {
    console.log(`Searching Bing for: ${item.q}...`);
    try {
      await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(item.q)}&qft=+filterui:imagesize-wallpaper`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise((r) => setTimeout(r, 2000));

      const imgData = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('a.iusc'));
        return items.map(a => {
          try {
            const m = JSON.parse(a.getAttribute('m') || '{}');
            return { murl: m.murl, turl: m.turl, desc: m.desc, w: m.w, h: m.h };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      });

      console.log(`Found ${imgData.length} items for ${item.tag}`);
      let count = 0;
      for (let i = 0; i < imgData.length && count < 6; i++) {
        const it = imgData[i];
        const dest = path.join(outDir, `${item.tag}_${i}.jpg`);
        try {
          await downloadUrl(it.murl, dest);
          const meta = await sharp(dest).metadata();
          if (meta.width >= 1600 && meta.height >= 900) {
            console.log(`✓ [${item.tag}_${i}] ${meta.width}x${meta.height}: ${it.desc?.slice(0, 40)}`);
            count++;
          } else {
            fs.unlinkSync(dest);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error(`Error on query ${item.q}:`, e.message);
    }
  }

  await browser.close();
  console.log('Iron Man scrape complete!');
}

scrapeIronMan().catch(console.error);
