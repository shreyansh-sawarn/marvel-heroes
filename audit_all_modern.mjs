import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactsDir = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\c66d5b94-c5ad-44f6-bdb8-5750fb9a0a1d';

async function audit() {
  console.log('Launching browser for comprehensive visual audit...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Spider-Man Hero Perch
  await page.waitForSelector('#spiderman-hero');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_01_spidey_perch.png') });
  console.log('✓ audit_01_spidey_perch.png captured');

  // 2. Spider-Man Dive
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_02_spidey_dive.png') });
  console.log('✓ audit_02_spidey_dive.png captured');

  // 3. Spider-Man Swing
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.2));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_03_spidey_swing.png') });
  console.log('✓ audit_03_spidey_swing.png captured');

  // 4. Spider-Man Chapter 2 (5K Girder Patrol - Non-repeated!)
  await page.evaluate(() => {
    const el = document.getElementById('cinematic-chapter');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_04_spidey_girder_patrol.png') });
  console.log('✓ audit_04_spidey_girder_patrol.png captured (unique non-repeated 5K scene)');

  // 5. Spider-Man Systems & Interactive Web-Shooter Test Bench
  await page.evaluate(() => {
    const el = document.getElementById('systems');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_05_spidey_testbench.png') });
  console.log('✓ audit_05_spidey_testbench.png captured');

  // 6. Trigger Hero Selector & Switch to Iron Man
  console.log('Testing Hero Switch to Iron Man...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('SWITCH') || b.textContent?.includes('AVENGERS ROSTER'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_06_hero_selector.png') });

  // Click Iron Man
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('h3')).find(h => h.textContent && h.textContent.includes('Iron Man'));
    if (cards) {
      const card = cards.closest('.group');
      if (card) card.click();
    }
  });

  // Capture Curtain
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_07_hero_curtain.png') });
  console.log('✓ audit_07_hero_curtain.png captured');

  // 7. Iron Man Mark LXXXV Hero Section
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_08_ironman_mk85.png') });
  console.log('✓ audit_08_ironman_mk85.png captured');

  // 8. Iron Man Supersonic Bay Flight
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_09_ironman_bay_flight.png') });
  console.log('✓ audit_09_ironman_bay_flight.png captured');

  // 9. Iron Man Chapter 2: Mach-3 Cloud Flight
  await page.evaluate(() => {
    const el = document.getElementById('ironman-cinematic');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_10_ironman_cloud_flight.png') });
  console.log('✓ audit_10_ironman_cloud_flight.png captured');

  // 10. Iron Man Systems & Nanotech Array
  await page.evaluate(() => {
    const el = document.getElementById('systems');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactsDir, 'audit_11_ironman_systems.png') });
  console.log('✓ audit_11_ironman_systems.png captured');

  await browser.close();
  console.log('=== All Audits Captured Successfully ===');
}

audit().catch(console.error);
