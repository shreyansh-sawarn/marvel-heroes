import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(process.cwd(), 'scratch', 'iron_man_fullres');

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      timeout: 15000
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

async function scrapeFlightAndUnibeam() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const targets = [
    { q: 'Tony Stark Iron Man flying flight clouds 4k wallpaper 3840x2160', tag: 'im_flying' },
    { q: 'Iron Man repulsor blast unibeam chest beam 4k wallpaper', tag: 'im_chest_blast' },
    { q: 'Iron Man Mark 50 nanotech 4k wallpaper 3840x2160', tag: 'im_nanotech' }
  ];

  for (const t of targets) {
    console.log(`Searching Google Images for ${t.q}...`);
    try {
      await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(t.q)}&tbs=isz:lt,islt:4mp`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await new Promise((r) => setTimeout(r, 2500));

      const imgUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(i => i.src).filter(s => s && s.startsWith('http'));
      });

      // Also try Bing image search
      await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(t.q)}&qft=+filterui:imagesize-custom_3840_2160`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await new Promise((r) => setTimeout(r, 2000));

      const bingData = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('a.iusc'));
        return items.map(a => {
          try {
            const m = JSON.parse(a.getAttribute('m') || '{}');
            return m.murl;
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      });

      const allUrls = [...bingData, ...imgUrls];
      console.log(`Found ${allUrls.length} image URLs for ${t.tag}`);
      let count = 0;
      for (let i = 0; i < allUrls.length && count < 5; i++) {
        const url = allUrls[i];
        const dest = path.join(outDir, `${t.tag}_${i}.jpg`);
        try {
          await downloadUrl(url, dest);
          const meta = await sharp(dest).metadata();
          if (meta.width >= 1920 && meta.height >= 1080) {
            console.log(`✓ [${t.tag}_${i}] ${meta.width}x${meta.height}`);
            count++;
          } else {
            fs.unlinkSync(dest);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error(`Error on ${t.q}:`, e.message);
    }
  }

  await browser.close();
}

scrapeFlightAndUnibeam().catch(console.error);
