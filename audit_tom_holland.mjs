import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\c66d5b94-c5ad-44f6-bdb8-5750fb9a0a1d';

async function auditTomHolland() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Navigating to http://localhost:5199...');
  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Initial Hero view
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_01_hero.png'), fullPage: false });
  console.log('✓ Captured spidey_mcu_01_hero.png');

  // 2. Scroll into Chapter 1 mid-scrub (Spider-Sense + Quote 1)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_02_quote1.png'), fullPage: false });
  console.log('✓ Captured spidey_mcu_02_quote1.png');

  // 3. Scroll into Chapter 1 Dive transition (Quote 2)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_03_dive.png'), fullPage: false });
  console.log('✓ Captured spidey_mcu_03_dive.png');

  // 4. Scroll into Chapter 1 Swing apex (Quote 3)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.4));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_04_swing.png'), fullPage: false });
  console.log('✓ Captured spidey_mcu_04_swing.png');

  // 5. Scroll into Chapter 2 Vertigo Dive Cinematic
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5.0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_05_cinematic.png'), fullPage: false });
  console.log('✓ Captured spidey_mcu_05_cinematic.png');

  // 6. Scroll into Systems Telemetry
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 9.0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_06_systems.png'), fullPage: false });
  console.log('✓ Captured spidey_mcu_06_systems.png');

  await browser.close();
  console.log('Tom Holland visual audit complete!');
}

auditTomHolland().catch(console.error);
