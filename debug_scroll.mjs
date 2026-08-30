import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\094a7c76-0ddd-4027-9dd0-da8f46e689bc';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', (err) => console.log('ERROR:', err));

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  for (const scrollY of [0, 400, 800, 1400, 2000, 2600, 3200]) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise((r) => setTimeout(r, 400));
    const info = await page.evaluate(() => {
      const s1 = document.getElementById('spiderman-hero');
      const rect = s1?.getBoundingClientRect();
      return {
        scrollY: window.scrollY,
        s1_top: rect?.top,
        s1_height: rect?.height,
      };
    });
    console.log(`Scroll ${scrollY}:`, JSON.stringify(info));
    await page.screenshot({ path: path.join(outDir, `debug_scroll_${scrollY}.png`) });
  }

  await browser.close();
}

run();
