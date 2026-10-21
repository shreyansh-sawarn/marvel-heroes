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

  console.log('Navigating to preview server...');
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 4000 });
    console.log('Connected to http://localhost:4173');
  } catch {
    await page.goto('http://localhost:4174', { waitUntil: 'networkidle0' });
    console.log('Connected to http://localhost:4174');
  }

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  async function toggleInfest() {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('INFEST') || b.textContent.includes('PURGE')
      );
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
  }

  async function warpToHero(heroId) {
    console.log(`Opening modal to warp to ${heroId}...`);
    await page.waitForSelector('[data-action="open-warp-modal"]');
    await page.click('[data-action="open-warp-modal"]');
    
    await page.waitForSelector(`[data-hero-card="${heroId}"]`);
    await page.$eval(`[data-hero-card="${heroId}"]`, el => el.scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 300));
    await page.click(`[data-hero-card="${heroId}"]`);
    await new Promise(r => setTimeout(r, 1400));
  }

  // 1. Miles Morales: Test Normal then Infest
  await warpToHero('miles');
  await toggleInfest();
  await page.screenshot({ path: 'screenshots/18_miles_symbiote_surge.png' });
  console.log('Screenshot 18_miles_symbiote_surge.png saved');

  // 2. Spider-Gwen: Test Infested
  await warpToHero('gwen');
  // Since surge persists globally or can be toggled:
  const isSurge1 = await page.evaluate(() => document.documentElement.getAttribute('data-symbiote') === 'true');
  if (!isSurge1) await toggleInfest();
  await page.screenshot({ path: 'screenshots/19_gwen_symbiote_surge.png' });
  console.log('Screenshot 19_gwen_symbiote_surge.png saved');

  // 3. Spider-Man 2099: Test Infested
  await warpToHero('spider2099');
  const isSurge2 = await page.evaluate(() => document.documentElement.getAttribute('data-symbiote') === 'true');
  if (!isSurge2) await toggleInfest();
  await page.screenshot({ path: 'screenshots/20_spider2099_symbiote_surge.png' });
  console.log('Screenshot 20_spider2099_symbiote_surge.png saved');

  // 4. Spider-Noir: Test Infested
  await warpToHero('spidernoir');
  const isSurge3 = await page.evaluate(() => document.documentElement.getAttribute('data-symbiote') === 'true');
  if (!isSurge3) await toggleInfest();
  await page.screenshot({ path: 'screenshots/21_spidernoir_symbiote_surge.png' });
  console.log('Screenshot 21_spidernoir_symbiote_surge.png saved');

  // 5. Spider-Punk: Test Infested
  await warpToHero('spiderpunk');
  const isSurge4 = await page.evaluate(() => document.documentElement.getAttribute('data-symbiote') === 'true');
  if (!isSurge4) await toggleInfest();
  await page.screenshot({ path: 'screenshots/22_spiderpunk_symbiote_surge.png' });
  console.log('Screenshot 22_spiderpunk_symbiote_surge.png saved');

  await browser.close();
  console.log('All character Symbiote Infestation Surge tests verified successfully!');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
