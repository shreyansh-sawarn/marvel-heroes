import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactsDir = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\c66d5b94-c5ad-44f6-bdb8-5750fb9a0a1d';

async function testFix() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0', timeout: 30000 });

  // Open Hero Selector and switch to Iron Man
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('SWITCH') || b.textContent.includes('AVENGERS ROSTER')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('h3')).find(h => h.textContent && h.textContent.includes('Iron Man'));
    if (cards) {
      const card = cards.closest('.group');
      if (card) card.click();
    }
  });
  await new Promise(r => setTimeout(r, 1400));

  // 1. Capture 1440x900
  await page.screenshot({ path: path.join(artifactsDir, 'test_ironman_fixed_1440x900.png') });
  console.log('✓ test_ironman_fixed_1440x900.png captured');

  // 2. Resize to 1920x950 (user viewport)
  await page.setViewport({ width: 1920, height: 950, deviceScaleFactor: 1 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactsDir, 'test_ironman_fixed_1920x950.png') });
  console.log('✓ test_ironman_fixed_1920x950.png captured');

  await browser.close();
}

testFix().catch(console.error);
