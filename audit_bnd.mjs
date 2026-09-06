import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\c66d5b94-c5ad-44f6-bdb8-5750fb9a0a1d';

async function auditBrandNewDay() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5199...');
  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));

  // 1. Hero Intro
  await page.screenshot({ path: path.join(artifactDir, 'bnd_01_hero.png'), fullPage: false });
  console.log('✓ Captured bnd_01_hero.png');

  // 2. Quote 1 / Spider-Sense
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.0));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'bnd_02_quote1.png'), fullPage: false });
  console.log('✓ Captured bnd_02_quote1.png');

  // 3. Dive Stage
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'bnd_03_dive.png'), fullPage: false });
  console.log('✓ Captured bnd_03_dive.png');

  // 4. Swing Stage
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.5));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'bnd_04_swing.png'), fullPage: false });
  console.log('✓ Captured bnd_04_swing.png');

  // 5. Chapter 2 Vertigo Dive
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5.2));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'bnd_05_cinematic.png'), fullPage: false });
  console.log('✓ Captured bnd_05_cinematic.png');

  // 6. Chapter 3 Systems
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 7.5));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'bnd_06_systems.png'), fullPage: false });
  console.log('✓ Captured bnd_06_systems.png');

  await browser.close();
  console.log('Brand New Day visual audit complete!');
}

auditBrandNewDay().catch(console.error);
