import puppeteer from 'puppeteer-core';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log('Navigating to preview server...');
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 4000 });
    console.log('Connected to http://localhost:4173');
  } catch {
    await page.goto('http://localhost:4174', { waitUntil: 'networkidle0' });
    console.log('Connected to http://localhost:4174');
  }

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // 1. Screenshot Peter Parker Tech Lab (Formula Alchemy)
  console.log('Scrolling to Tech Lab...');
  await page.$eval('#tech-lab-section', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/10_tech_lab_formula.png' });
  console.log('Screenshot 10_tech_lab_formula.png saved');

  // 2. Switch to Daily Bugle Darkroom and snap picture
  console.log('Testing Daily Bugle Darkroom...');
  const darkroomBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('DAILY BUGLE'));
  });
  if (darkroomBtn) await darkroomBtn.click();
  await new Promise(r => setTimeout(r, 500));

  // Snap photo
  const snapBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('SNAP PICTURE'));
  });
  if (snapBtn) await snapBtn.click();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/11_daily_bugle_darkroom.png' });
  console.log('Screenshot 11_daily_bugle_darkroom.png saved');

  // 3. Switch to Spider-Sense Reflex
  console.log('Testing Spider-Sense Reflex...');
  const reflexBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('SPIDER-SENSE'));
  });
  if (reflexBtn) await reflexBtn.click();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshots/12_spidersense_reflex.png' });
  console.log('Screenshot 12_spidersense_reflex.png saved');

  // 4. Scroll to Multiverse Crisis Battle Arena
  console.log('Testing Crisis Arena...');
  await page.$eval('#crisis-arena-section', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/13_crisis_arena_ready.png' });
  console.log('Screenshot 13_crisis_arena_ready.png saved');

  // Start battle
  const engageBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('ENGAGE COMBAT'));
  });
  if (engageBtn) await engageBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // Fire attacks
  const attackBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('PRIMARY ATTACK'));
  });
  if (attackBtn) {
    await attackBtn.click();
    await new Promise(r => setTimeout(r, 200));
    await attackBtn.click();
    await new Promise(r => setTimeout(r, 200));
    await attackBtn.click();
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'screenshots/14_crisis_arena_combat.png' });
  console.log('Screenshot 14_crisis_arena_combat.png saved');

  // 5. Scroll to Spider-Society Canon Event Terminal
  console.log('Testing Canon Event Terminal...');
  await page.$eval('#canon-terminal-section', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/15_canon_terminal_stable.png' });
  console.log('Screenshot 15_canon_terminal_stable.png saved');

  // Simulate Canon Disruption
  const disruptBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('SIMULATE CANON DISRUPTION'));
  });
  if (disruptBtn) await disruptBtn.click();
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/16_canon_terminal_disrupted.png' });
  console.log('Screenshot 16_canon_terminal_disrupted.png saved');

  // Deploy Go-Home Forcefield
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('DEPLOY GO-HOME FORCEFIELD'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 6. Test Multiverse Action Deck
  console.log('Testing Multiverse Action Deck...');
  // Click Procedural OST Play
  const ostBtn = await page.$('.action-deck-ui button');
  if (ostBtn) await ostBtn.click();
  await new Promise(r => setTimeout(r, 800));

  // Click Web Mode button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('WEB MODE'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Click on screen to shoot web
  await page.mouse.click(600, 300);
  await new Promise(r => setTimeout(r, 200));
  await page.mouse.click(800, 250);
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'screenshots/17_action_deck_web_mode.png' });
  console.log('Screenshot 17_action_deck_web_mode.png saved');

  await browser.close();
  console.log('All innovation tests successfully executed and captured!');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
