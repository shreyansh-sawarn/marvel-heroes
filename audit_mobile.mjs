import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\c66d5b94-c5ad-44f6-bdb8-5750fb9a0a1d';

async function auditMobile() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true });

  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_mobile_hero.png'), fullPage: false });

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5.0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'spidey_mcu_mobile_dive.png'), fullPage: false });

  await browser.close();
  console.log('Mobile audit complete!');
}

auditMobile().catch(console.error);
