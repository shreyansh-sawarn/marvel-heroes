import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  const milesJpgB64 = fs.readFileSync('C:/Users/shrey/.gemini/antigravity/brain/f4c37e09-a020-4371-9b21-94b4d0129a32/miles_symbiote_hero_1792611280080.jpg').toString('base64');
  const milesPngB64 = fs.readFileSync('public/assets/miles_hero.png').toString('base64');

  await page.setContent(`
    <html>
      <body style="background: #111; display: flex; align-items: center; justify-content: space-around; height: 100vh; margin: 0;">
        <div style="text-align: center; color: white; font-family: sans-serif;">
          <h3>Original Miles (miles_hero.png)</h3>
          <img src="data:image/png;base64,${milesPngB64}" style="height: 500px; border: 1px solid #444;" />
        </div>
        <div style="text-align: center; color: white; font-family: sans-serif;">
          <h3>Generated Symbiote Miles</h3>
          <img src="data:image/jpeg;base64,${milesJpgB64}" style="height: 500px; border: 1px solid #444;" />
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path: 'C:/Users/shrey/.gemini/antigravity/brain/f4c37e09-a020-4371-9b21-94b4d0129a32/screenshots/compare_miles.png' });
  await browser.close();
  console.log('compare_miles.png saved');
}
test();
