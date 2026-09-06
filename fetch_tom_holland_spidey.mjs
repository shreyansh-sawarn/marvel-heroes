import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const assetsDir = path.join(process.cwd(), 'public', 'assets');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function fetchAssets() {
  console.log('Launching browser to find top-tier Tom Holland Spider-Man stills...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Let's search wallpapercave / wallpaperaccess for Tom Holland Spider-Man
  console.log('Navigating to WallpaperAccess for Homecoming & Far From Home...');
  await page.goto('https://wallpaperaccess.com/spider-man-homecoming', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const homecomingImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img.ui'));
    return imgs.map(img => img.src || img.getAttribute('data-src')).filter(Boolean);
  });
  console.log(`Found ${homecomingImages.length} Homecoming images:`, homecomingImages.slice(0, 5));

  await page.goto('https://wallpaperaccess.com/spiderman-no-way-home', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const nwhImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img.ui'));
    return imgs.map(img => img.src || img.getAttribute('data-src')).filter(Boolean);
  });
  console.log(`Found ${nwhImages.length} No Way Home images:`, nwhImages.slice(0, 5));

  await page.goto('https://wallpaperaccess.com/spider-man-far-from-home', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const ffhImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img.ui'));
    return imgs.map(img => img.src || img.getAttribute('data-src')).filter(Boolean);
  });
  console.log(`Found ${ffhImages.length} Far From Home images:`, ffhImages.slice(0, 5));

  await browser.close();

  // Save list of URLs for inspection
  fs.writeFileSync('tom_holland_urls.json', JSON.stringify({
    homecoming: homecomingImages,
    noWayHome: nwhImages,
    farFromHome: ffhImages
  }, null, 2));

  console.log('Saved candidate URLs to tom_holland_urls.json');
}

fetchAssets().catch(console.error);
