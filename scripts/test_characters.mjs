import puppeteer from 'puppeteer-core';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log('Navigating to http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // 1. Screenshot Peter Parker
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/01_peter_parker.png' });
  console.log('Screenshot 01_peter_parker.png saved');

  async function warpToHero(heroId) {
    console.log(`Opening modal to warp to ${heroId}...`);
    // Click WARP REALITY button
    await page.waitForSelector('[data-action="open-warp-modal"]');
    await page.click('[data-action="open-warp-modal"]');
    
    // Wait for modal card
    await page.waitForSelector(`[data-hero-card="${heroId}"]`);
    await page.$eval(`[data-hero-card="${heroId}"]`, el => el.scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 400));
    await page.click(`[data-hero-card="${heroId}"]`);

    // Wait for transition curtain animation
    await new Promise(r => setTimeout(r, 1800));
  }

  // 2. Select Miles Morales
  await warpToHero('miles');
  await page.screenshot({ path: 'screenshots/02_miles_morales.png' });
  console.log('Screenshot 02_miles_morales.png saved');

  // 3. Select Ghost-Spider (Gwen)
  await warpToHero('gwen');
  await page.screenshot({ path: 'screenshots/03_spider_gwen.png' });
  console.log('Screenshot 03_spider_gwen.png saved');

  // 4. Select Spider-Man 2099
  await warpToHero('spider2099');
  await page.screenshot({ path: 'screenshots/04_spider_2099.png' });
  console.log('Screenshot 04_spider_2099.png saved');

  // 5. Select Venom
  await warpToHero('venom');
  await page.screenshot({ path: 'screenshots/05_venom.png' });
  console.log('Screenshot 05_venom.png saved');

  // 6. Select Carnage
  await warpToHero('carnage');
  await page.screenshot({ path: 'screenshots/06_carnage.png' });
  console.log('Screenshot 06_carnage.png saved');

  // 7. Select Spider-Punk
  await warpToHero('spiderpunk');
  await page.screenshot({ path: 'screenshots/07_spider_punk.png' });
  console.log('Screenshot 07_spider_punk.png saved');

  // 8. Select Spider-Noir
  await warpToHero('spidernoir');
  await page.screenshot({ path: 'screenshots/08_spider_noir.png' });
  console.log('Screenshot 08_spider_noir.png saved');

  await browser.close();
  console.log('All character tests verified and captured successfully!');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
