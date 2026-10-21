import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const heroes = [
    { name: 'Miles Morales (Earth-1610)', orig: 'miles_hero.png', sym: 'miles_symbiote_hero.png', color: '#EF4444' },
    { name: 'Spider-Gwen / Gwenom (Earth-65)', orig: 'gwen_hero.png', sym: 'gwen_symbiote_hero.png', color: '#F43F5E' },
    { name: 'Spider-Man 2099 (Earth-928)', orig: 'spider2099_hero.png', sym: 'spider2099_symbiote_hero.png', color: '#00F0FF' },
    { name: 'Spider-Noir (Earth-90214)', orig: 'noir_hero.png', sym: 'noir_symbiote_hero.png', color: '#F59E0B' },
    { name: 'Spider-Punk (Earth-138)', orig: 'punk_hero.png', sym: 'punk_symbiote_hero.png', color: '#EC4899' },
  ];

  const cardsHtml = heroes.map(h => {
    const origB64 = fs.readFileSync('public/assets/' + h.orig).toString('base64');
    const symB64 = fs.readFileSync('public/assets/' + h.sym).toString('base64');
    return `
      <div style="background: rgba(15, 10, 25, 0.9); border: 2px solid ${h.color}; border-radius: 12px; padding: 16px; margin: 10px; width: 280px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 0 25px rgba(0,0,0,0.8);">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">${h.name}</h4>
        <div style="display: flex; justify-content: space-between; gap: 8px;">
          <div>
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">NORMAL SUIT</div>
            <img src="data:image/png;base64,${origB64}" style="height: 180px; max-width: 125px; object-fit: contain;" />
          </div>
          <div>
            <div style="font-size: 11px; color: #C084FC; margin-bottom: 4px; font-weight: bold;">INFESTED SUIT</div>
            <img src="data:image/png;base64,${symB64}" style="height: 180px; max-width: 125px; object-fit: contain; filter: drop-shadow(0 0 12px #A855F7);" />
          </div>
        </div>
      </div>
    `;
  }).join('');

  await page.setContent(`
    <html>
      <body style="background: #06040A; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
        <h1 style="color: white; font-family: sans-serif; letter-spacing: 3px; margin-bottom: 8px;">KLYNTAR SYMBIOTE SUIT TRANSFORMATIONS</h1>
        <p style="color: #A855F7; font-family: monospace; font-size: 14px; margin-bottom: 24px;">Dedicated, full-body alternate Symbiote suits for all Spider-Verse heroes</p>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; max-width: 1550px;">
          ${cardsHtml}
        </div>
      </body>
    </html>
  `);

  await page.screenshot({ path: 'C:/Users/shrey/.gemini/antigravity/brain/f4c37e09-a020-4371-9b21-94b4d0129a32/screenshots/symbiote_suits_showcase.png' });
  await browser.close();
  console.log('Saved symbiote_suits_showcase.png');
}
test();
