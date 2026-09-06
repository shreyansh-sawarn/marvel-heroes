import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(process.cwd(), 'scratch', 'tom_holland_fullres');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function getFullResWallpapers() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Let's get full wallpaper links from WallpaperCave for Spider-Man Homecoming & No Way Home
  console.log('Navigating to WallpaperCave Homecoming...');
  await page.goto('https://wallpapercave.com/spiderman-homecoming-wallpapers', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const homecomingFullUrls = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('.wpimg, .wppic'));
    return imgs.map(img => img.src || img.getAttribute('data-src') || img.getAttribute('src')).filter(s => s && s.startsWith('http'));
  });
  console.log(`Found ${homecomingFullUrls.length} WallpaperCave Homecoming images`);

  console.log('Navigating to WallpaperCave No Way Home...');
  await page.goto('https://wallpapercave.com/spider-man-no-way-home-wallpapers', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const nwhFullUrls = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('.wpimg, .wppic'));
    return imgs.map(img => img.src || img.getAttribute('data-src') || img.getAttribute('src')).filter(s => s && s.startsWith('http'));
  });
  console.log(`Found ${nwhFullUrls.length} WallpaperCave No Way Home images`);

  console.log('Navigating to WallpaperCave Far From Home...');
  await page.goto('https://wallpapercave.com/spider-man-far-from-home-wallpapers', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const ffhFullUrls = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('.wpimg, .wppic'));
    return imgs.map(img => img.src || img.getAttribute('data-src') || img.getAttribute('src')).filter(s => s && s.startsWith('http'));
  });
  console.log(`Found ${ffhFullUrls.length} WallpaperCave Far From Home images`);

  await browser.close();

  const allUrls = [...homecomingFullUrls, ...nwhFullUrls, ...ffhFullUrls];
  console.log(`Total URLs found: ${allUrls.length}`);

  let downloadedCount = 0;
  for (let i = 0; i < Math.min(allUrls.length, 30); i++) {
    const url = allUrls[i];
    const filename = `wc_spidey_${i}.jpg`;
    const dest = path.join(outDir, filename);
    try {
      await download(url, dest);
      const meta = await sharp(dest).metadata();
      if (meta.width >= 1200 && meta.height >= 700) {
        console.log(`✓ Downloaded [${i}] ${meta.width}x${meta.height}: ${url.slice(0, 70)}...`);
        downloadedCount++;
      } else {
        fs.unlinkSync(dest);
      }
    } catch (e) {
      // ignore
    }
  }

  console.log(`Finished! Downloaded ${downloadedCount} high-res wallpapers to scratch/tom_holland_fullres`);
}

getFullResWallpapers().catch(console.error);
