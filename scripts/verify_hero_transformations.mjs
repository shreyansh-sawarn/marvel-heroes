import puppeteer from 'puppeteer-core';

async function verify() {
  console.log('--- Starting Multiverse Symbiote Suit Verification ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4175/', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.fonts.ready);

  const heroIds = ['spiderman', 'miles', 'gwen', 'spider2099', 'spidernoir', 'spiderpunk'];
  const screenshotDir = 'C:/Users/shrey/.gemini/antigravity/brain/f4c37e09-a020-4371-9b21-94b4d0129a32/screenshots';

  for (const heroId of heroIds) {
    console.log(`\nTesting hero: ${heroId}`);

    // Open reality selector modal
    await page.click('button[data-action="open-warp-modal"]');
    await new Promise(r => setTimeout(r, 500));

    // Select hero card
    await page.click(`[data-hero-card="${heroId}"]`);
    await new Promise(r => setTimeout(r, 1200));

    // Capture Normal Suit
    await page.screenshot({ path: `${screenshotDir}/verify_${heroId}_normal.png` });
    console.log(`Captured verify_${heroId}_normal.png`);

    // Click INFEST SUIT
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const infestBtn = btns.find(b => b.textContent && b.textContent.includes('INFEST SUIT'));
      if (infestBtn) infestBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Infested Suit
    await page.screenshot({ path: `${screenshotDir}/verify_${heroId}_symbiote.png` });
    console.log(`Captured verify_${heroId}_symbiote.png`);

    // Turn off symbiote surge
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const surgeBtn = btns.find(b => b.textContent && b.textContent.includes('SYMBIOTE SURGE'));
      if (surgeBtn) surgeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
  }

  await browser.close();
  console.log('\n--- All verification screenshots captured successfully! ---');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
