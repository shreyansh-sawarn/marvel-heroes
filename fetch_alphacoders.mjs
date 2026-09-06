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
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
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

async function getAlphaCoders() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Navigating to AlphaCoders Homecoming...');
  await page.goto('https://wall.alphacoders.com/by_movie.php?movie_id=25575', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));

  const homecomingUrls = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img.thumb_img, img.img-responsive, img[src*="alphacoders.com"]'));
    return imgs.map(i => i.src || i.getAttribute('data-src')).filter(Boolean);
  });
  console.log(`Found ${homecomingUrls.length} Homecoming images:`, homecomingUrls.slice(0, 5));

  console.log('Navigating to AlphaCoders No Way Home...');
  await page.goto('https://wall.alphacoders.com/by_movie.php?movie_id=74431', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));

  const nwhUrls = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img.thumb_img, img.img-responsive, img[src*="alphacoders.com"]'));
    return imgs.map(i => i.src || i.getAttribute('data-src')).filter(Boolean);
  });
  console.log(`Found ${nwhUrls.length} No Way Home images:`, nwhUrls.slice(0, 5));

  await browser.close();

  const allUrls = [...homecomingUrls, ...nwhUrls];
  for (let i = 0; i < allUrls.length; i++) {
    // In AlphaCoders: thumbnail URL `https://imagesX.alphacoders.com/thumb-350-12345.jpg` or `https://imagesX.alphacoders.com/thumb-1920-12345.jpg`
    // Full image URL is `https://imagesX.alphacoders.com/123/12345.jpg` or `https://imagesX.alphacoders.com/thumb-1920-12345.jpg`
    let fullUrl = allUrls[i];
    if (fullUrl.includes('thumb-350-')) {
      fullUrl = fullUrl.replace('thumb-350-', 'thumb-1920-');
    }
    const dest = path.join(outDir, `ac_spidey_${i}.jpg`);
    try {
      await download(fullUrl, dest);
      const meta = await sharp(dest).metadata();
      console.log(`✓ [${i}] ${meta.width}x${meta.height}: ${fullUrl}`);
    } catch (e) {
      // try original thumbnail URL
      try {
        await download(allUrls[i], dest);
        const meta = await sharp(dest).metadata();
        console.log(`✓ [${i}] (thumb) ${meta.width}x${meta.height}`);
      } catch (e2) {}
    }
  }
}

getAlphaCoders().catch(console.error);
