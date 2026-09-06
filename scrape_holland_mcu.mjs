import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(process.cwd(), 'scratch', 'tom_holland_fullres');

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      timeout: 10000
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

async function scrapeMore() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const searches = [
    { query: 'Spider-Man Homecoming web wings glide 4k wallpaper', tag: 'glide' },
    { query: 'Spider-Man Homecoming Washington monument freefall 4k wallpaper', tag: 'dive' },
    { query: 'Spider-Man Far From Home web swinging 4k wallpaper', tag: 'swing_mcu' },
    { query: 'Spider-Man No Way Home final swing 4k wallpaper', tag: 'final_swing' },
    { query: 'Tom Holland Spider-Man Iron Spider 4k wallpaper', tag: 'iron_spider' }
  ];

  for (const s of searches) {
    console.log(`Searching Bing for: ${s.query}...`);
    await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(s.query)}&qft=+filterui:imagesize-wallpaper`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2500));

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

    console.log(`Found ${imgData.length} items for ${s.tag}`);
    let successCount = 0;
    for (let i = 0; i < imgData.length && successCount < 8; i++) {
      const item = imgData[i];
      const dest = path.join(outDir, `${s.tag}_${i}.jpg`);
      try {
        await downloadUrl(item.murl, dest);
        const meta = await sharp(dest).metadata();
        if (meta.width >= 1200 && meta.height >= 700) {
          console.log(`✓ SUCCESS [${s.tag}_${i}] ${meta.width}x${meta.height}, format=${meta.format}`);
          successCount++;
        } else {
          fs.unlinkSync(dest);
        }
      } catch (e) {
        // try next
      }
    }
  }

  await browser.close();
  console.log('Scrape complete!');
}

scrapeMore().catch(console.error);
