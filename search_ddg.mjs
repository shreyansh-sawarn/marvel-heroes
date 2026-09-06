import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const assetsDir = path.join(process.cwd(), 'public', 'assets');

async function searchAndDownload() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Search 1: Tom Holland Spider-Man crouch / perch on building or rooftop
  console.log('Searching for Tom Holland Spider-Man crouch / perch...');
  await page.goto('https://duckduckgo.com/?q=Tom+Holland+Spider-Man+Homecoming+crouch+high+resolution+wallpaper&iax=images&ia=images', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 3000));

  const perchUrls = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('.tile--img__img, img[src*="duckduckgo.com/iu/?u="]'));
    return tiles.map(t => {
      const src = t.getAttribute('data-src') || t.getAttribute('src') || '';
      if (src.includes('u=')) {
        const match = src.match(/u=(.+?)&/);
        if (match) return decodeURIComponent(match[1]);
      }
      return src;
    }).filter(s => s && s.startsWith('http'));
  });

  console.log(`Found ${perchUrls.length} perch candidates:`, perchUrls.slice(0, 5));

  // Search 2: Tom Holland Spider-Man leap / dive / web wings
  console.log('Searching for Tom Holland Spider-Man dive / web wings...');
  await page.goto('https://duckduckgo.com/?q=Spider-Man+Homecoming+web+wings+glide+dive+Tom+Holland+wallpaper&iax=images&ia=images', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 3000));

  const leapUrls = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('.tile--img__img, img[src*="duckduckgo.com/iu/?u="]'));
    return tiles.map(t => {
      const src = t.getAttribute('data-src') || t.getAttribute('src') || '';
      if (src.includes('u=')) {
        const match = src.match(/u=(.+?)&/);
        if (match) return decodeURIComponent(match[1]);
      }
      return src;
    }).filter(s => s && s.startsWith('http'));
  });

  console.log(`Found ${leapUrls.length} leap candidates:`, leapUrls.slice(0, 5));

  // Search 3: Tom Holland Spider-Man swing
  console.log('Searching for Tom Holland Spider-Man swing...');
  await page.goto('https://duckduckgo.com/?q=Tom+Holland+Spider-Man+Far+From+Home+No+Way+Home+swing+wallpaper+4k&iax=images&ia=images', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 3000));

  const swingUrls = await page.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('.tile--img__img, img[src*="duckduckgo.com/iu/?u="]'));
    return tiles.map(t => {
      const src = t.getAttribute('data-src') || t.getAttribute('src') || '';
      if (src.includes('u=')) {
        const match = src.match(/u=(.+?)&/);
        if (match) return decodeURIComponent(match[1]);
      }
      return src;
    }).filter(s => s && s.startsWith('http'));
  });

  console.log(`Found ${swingUrls.length} swing candidates:`, swingUrls.slice(0, 5));

  await browser.close();

  fs.writeFileSync('tom_holland_ddg_candidates.json', JSON.stringify({
    perch: perchUrls,
    leap: leapUrls,
    swing: swingUrls
  }, null, 2));

  console.log('Saved candidate URLs to tom_holland_ddg_candidates.json');
}

searchAndDownload().catch(console.error);
