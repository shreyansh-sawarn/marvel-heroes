import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  const status1 = await page.evaluate(() => {
    const s1 = document.getElementById('spiderman-hero');
    const c1 = s1?.querySelector('canvas');
    const s2 = document.getElementById('cinematic-chapter');
    const c2 = s2?.querySelector('canvas');
    return {
      s1: s1 ? { height: s1.offsetHeight, rect: s1.getBoundingClientRect() } : null,
      c1: c1 ? { width: c1.width, height: c1.height, rect: c1.getBoundingClientRect() } : null,
      s2: s2 ? { height: s2.offsetHeight, rect: s2.getBoundingClientRect() } : null,
      c2: c2 ? { width: c2.width, height: c2.height, rect: c2.getBoundingClientRect() } : null,
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
    };
  });
  console.log('INITIAL STATUS:', JSON.stringify(status1, null, 2));

  // Now scroll 1500px down
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise((r) => setTimeout(r, 500));

  const status2 = await page.evaluate(() => {
    const s1 = document.getElementById('spiderman-hero');
    const c1 = s1?.querySelector('canvas');
    return {
      rect: s1?.getBoundingClientRect(),
      c1_rect: c1?.getBoundingClientRect(),
      scrollY: window.scrollY,
    };
  });
  console.log('AFTER SCROLL 1500px:', JSON.stringify(status2, null, 2));

  await browser.close();
}

run();
