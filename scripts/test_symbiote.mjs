import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  // Click INFEST SUIT button in navbar
  const infestBtn = await page.waitForSelector('button[title="Trigger Symbiote Surge"]');
  await infestBtn.click();
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'screenshots/09_peter_symbiote_surge.png' });
  console.log('Symbiote Surge screenshot saved!');

  await browser.close();
}

run();
