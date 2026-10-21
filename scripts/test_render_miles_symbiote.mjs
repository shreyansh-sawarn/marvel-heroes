import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 800 });
  
  const milesB64 = fs.readFileSync('public/assets/miles_symbiote_hero.png').toString('base64');

  await page.setContent(`
    <html>
      <body style="background: #06040A; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="text-align: center; color: white;">
          <h2 style="font-family: sans-serif; letter-spacing: 2px;">VENOMIZED MILES (miles_symbiote_hero.png)</h2>
          <img src="data:image/png;base64,${milesB64}" style="height: 550px; filter: drop-shadow(0 0 40px #A855F7);" />
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path: 'C:/Users/shrey/.gemini/antigravity/brain/f4c37e09-a020-4371-9b21-94b4d0129a32/screenshots/test_miles_symbiote_render.png' });
  await browser.close();
  console.log('Saved test_miles_symbiote_render.png');
}
test();
