import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\094a7c76-0ddd-4027-9dd0-da8f46e689bc';

async function run() {
  console.log('Launching Edge...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  // Wait 1.5s for fonts, images and canvas to initialize
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Initial State (0%)
  await page.screenshot({ path: path.join(outDir, 'shot_0_initial.png') });
  console.log('Captured shot_0_initial.png');

  // 2. Scroll into Dive Stage (~1000px)
  await page.mouse.wheel({ deltaY: 1000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'shot_1_dive.png') });
  console.log('Captured shot_1_dive.png');

  // 3. Scroll into Swing Stage (~1500px more)
  await page.mouse.wheel({ deltaY: 1500 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'shot_2_swing.png') });
  console.log('Captured shot_2_swing.png');

  // 4. Scroll into Quote Card 2 / Apex (~1200px more)
  await page.mouse.wheel({ deltaY: 1200 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'shot_3_apex.png') });
  console.log('Captured shot_3_apex.png');

  // 5. Scroll into Systems Specs (~3000px more)
  await page.mouse.wheel({ deltaY: 3000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'shot_6_systems.png') });
  console.log('Captured shot_6_systems.png');

  await browser.close();
  console.log('All fresh screenshots captured!');
}

run().catch((e) => console.error('Screenshot error:', e));
