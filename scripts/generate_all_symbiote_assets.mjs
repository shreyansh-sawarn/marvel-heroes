import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  console.log('--- Launching Headless Engine for Symbiote Suit Synthesis ---');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  const page = await browser.newPage();

  // 1. Clean up Miles Symbiote Cutout (remove any corner haze)
  console.log('1. Refining Venomized Miles cutout...');
  const milesJpgPath = 'C:/Users/shrey/.gemini/antigravity/brain/f4c37e09-a020-4371-9b21-94b4d0129a32/miles_symbiote_hero_1792611280080.jpg';
  if (fs.existsSync(milesJpgPath)) {
    const { data, info } = await sharp(milesJpgPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const cx = width / 2;
    const cy = height * 0.52;
    const maxR = Math.hypot(width * 0.44, height * 0.44);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        const dist = Math.hypot(x - cx, y - cy);
        const distRatio = Math.max(0, Math.min(1, (dist - maxR * 0.65) / (maxR * 0.35)));

        // Effective background threshold increases towards corners
        const threshold = 18 + distRatio * 35;
        if (luma < threshold) {
          data[idx + 3] = 0;
        } else if (luma < threshold + 18) {
          data[idx + 3] = Math.round(((luma - threshold) / 18) * 255);
        }
      }
    }

    await sharp(data, { raw: { width, height, channels: 4 } })
      .png()
      .toFile('public/assets/miles_symbiote_hero.png');
    console.log('Saved clean public/assets/miles_symbiote_hero.png');
  }

  // 2. Synthesize GWENOM from gwen_hero.png
  console.log('2. Synthesizing GWENOM (gwen_symbiote_hero.png)...');
  await page.evaluate(() => {}); // reset

  const gwenPngB64 = fs.readFileSync('public/assets/gwen_hero.png').toString('base64');
  const gwenResultB64 = await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Draw original image
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // Transform pixels: turn costume into glossy liquid obsidian black, preserve hood & add magenta glow
        for (let i = 0; i < d.length; i += 4) {
          const a = d[i + 3];
          if (a < 15) continue;

          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          // Check if pixel belongs to the white hood/mask (high luma)
          const isWhiteHood = luma > 185;
          const isTealLining = g > 110 && b > 110 && r < 100;
          const isPinkRibbon = r > 140 && b > 100 && g < 90;

          if (isWhiteHood) {
            // Keep white hood striking, but add subtle purple ambient rim
            d[i] = Math.min(255, r + 15);
            d[i + 1] = Math.max(0, g - 15);
            d[i + 2] = Math.min(255, b + 30);
          } else if (isTealLining) {
            // Convert interior teal web lining into glowing alien magenta/purple
            d[i] = 236; // Hot Pink/Magenta
            d[i + 1] = 40;
            d[i + 2] = 210;
          } else if (isPinkRibbon) {
            // Intense bio-luminescent magenta
            d[i] = 255;
            d[i + 1] = 20;
            d[i + 2] = 160;
          } else {
            // Body Suit -> Deep liquid obsidian symbiote black with purple sheen
            const specRatio = Math.max(0, Math.min(1, luma / 140));
            d[i] = Math.round(10 + specRatio * 45); // slight purple/crimson sheen
            d[i + 1] = Math.round(6 + specRatio * 15);
            d[i + 2] = Math.round(22 + specRatio * 85);
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Overlay Gwenom predatory features: enlarged jagged white eyes & alien tendrils
        ctx.save();
        // Tendrils whipping off limbs
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 14;
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = 35;

        // Draw organic tendrils around torso & wrists
        const tendrilPaths = [
          [[w * 0.45, h * 0.5], [w * 0.35, h * 0.45], [w * 0.22, h * 0.48], [w * 0.12, h * 0.42]],
          [[w * 0.55, h * 0.55], [w * 0.65, h * 0.6], [w * 0.78, h * 0.58], [w * 0.9, h * 0.65]],
          [[w * 0.48, h * 0.7], [w * 0.4, h * 0.8], [w * 0.32, h * 0.88], [w * 0.2, h * 0.95]],
          [[w * 0.52, h * 0.72], [w * 0.6, h * 0.82], [w * 0.72, h * 0.9], [w * 0.85, h * 0.98]]
        ];

        tendrilPaths.forEach(pts => {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          ctx.bezierCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1]);
          ctx.stroke();

          // Black inner core
          ctx.strokeStyle = '#05020A';
          ctx.lineWidth = 7;
          ctx.stroke();
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 14;
        });

        // Add Menacing Gwenom Jaw and Needle Teeth on mask
        // Mask region is roughly around center-top
        ctx.shadowColor = '#A855F7';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#FFFFFF';

        // Sharp jagged eye lenses
        // Left eye
        ctx.beginPath();
        ctx.moveTo(w * 0.46, h * 0.26);
        ctx.quadraticCurveTo(w * 0.43, h * 0.22, w * 0.39, h * 0.24);
        ctx.quadraticCurveTo(w * 0.43, h * 0.30, w * 0.46, h * 0.26);
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.moveTo(w * 0.53, h * 0.26);
        ctx.quadraticCurveTo(w * 0.56, h * 0.22, w * 0.60, h * 0.24);
        ctx.quadraticCurveTo(w * 0.56, h * 0.30, w * 0.53, h * 0.26);
        ctx.fill();

        // Grinning razor needle teeth
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#05020A';
        ctx.lineWidth = 2;
        const mouthX = w * 0.49;
        const mouthY = h * 0.31;
        for (let t = -5; t <= 5; t++) {
          const tx = mouthX + t * 9;
          const ty = mouthY + Math.abs(t) * 2;
          ctx.beginPath();
          ctx.moveTo(tx - 4, ty);
          ctx.lineTo(tx, ty + 12);
          ctx.lineTo(tx + 4, ty);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = 'data:image/png;base64,' + base64;
    });
  }, gwenPngB64);

  fs.writeFileSync('public/assets/gwen_symbiote_hero.png', Buffer.from(gwenResultB64, 'base64'));
  console.log('Saved public/assets/gwen_symbiote_hero.png');

  // 3. Synthesize VENOM 2099 from spider2099_hero.png
  console.log('3. Synthesizing VENOM 2099 (spider2099_symbiote_hero.png)...');
  const s2099PngB64 = fs.readFileSync('public/assets/spider2099_hero.png').toString('base64');
  const s2099ResultB64 = await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // Transform pixels: deep cyber obsidian, amplify skull emblem to ultra-neon crimson
        for (let i = 0; i < d.length; i += 4) {
          const a = d[i + 3];
          if (a < 15) continue;

          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          const isRedEmblem = r > 110 && r > (g + b) * 0.75;
          const isEyeLens = luma > 200;

          if (isRedEmblem) {
            // Ultra-saturated radioactive cyber-red
            d[i] = 255;
            d[i + 1] = Math.min(40, g);
            d[i + 2] = Math.min(80, b);
          } else if (isEyeLens) {
            // Predatory glowing alien white eyes
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          } else {
            // Suit fabric -> Obsidian Cyber Klyntar Armor
            const spec = Math.max(0, Math.min(1, luma / 120));
            d[i] = Math.round(12 + spec * 30);
            d[i + 1] = Math.round(4 + spec * 15);
            d[i + 2] = Math.round(24 + spec * 75);
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Draw hard-light symbiote spikes & neon cyber-wings
        ctx.save();
        ctx.strokeStyle = '#FF0055';
        ctx.lineWidth = 10;
        ctx.shadowColor = '#FF0055';
        ctx.shadowBlur = 30;

        // Cybernetic spikes protruding from shoulders and forearms
        const spikePoints = [
          [[w * 0.32, h * 0.38], [w * 0.18, h * 0.32], [w * 0.08, h * 0.28]],
          [[w * 0.68, h * 0.38], [w * 0.82, h * 0.32], [w * 0.92, h * 0.28]],
          [[w * 0.28, h * 0.62], [w * 0.15, h * 0.68], [w * 0.05, h * 0.72]],
          [[w * 0.72, h * 0.62], [w * 0.85, h * 0.68], [w * 0.95, h * 0.72]]
        ];

        spikePoints.forEach(pts => {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
          ctx.stroke();

          // Black obsidian spine
          ctx.strokeStyle = '#050B1E';
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.strokeStyle = '#FF0055';
          ctx.lineWidth = 10;
        });

        // Glowing cyber-skull eye visor flares
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.ellipse(w * 0.44, h * 0.28, 14, 8, -0.2, 0, Math.PI * 2);
        ctx.ellipse(w * 0.56, h * 0.28, 14, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = 'data:image/png;base64,' + base64;
    });
  }, s2099PngB64);

  fs.writeFileSync('public/assets/spider2099_symbiote_hero.png', Buffer.from(s2099ResultB64, 'base64'));
  console.log('Saved public/assets/spider2099_symbiote_hero.png');

  // 4. Synthesize SHADOW-SYMBIOTE NOIR from noir_hero.png
  console.log('4. Synthesizing SHADOW-SYMBIOTE NOIR (noir_symbiote_hero.png)...');
  const noirPngB64 = fs.readFileSync('public/assets/noir_hero.png').toString('base64');
  const noirResultB64 = await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // Chiaroscuro shadow-matter conversion
        for (let i = 0; i < d.length; i += 4) {
          const a = d[i + 3];
          if (a < 15) continue;

          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          // Check if pixel is the gleaming amber goggle lens
          const isAmberGoggle = r > 150 && g > 110 && b < 80;

          if (isAmberGoggle) {
            // Intense glowing detective amber
            d[i] = 255;
            d[i + 1] = 190;
            d[i + 2] = 20;
          } else {
            // Deep ink obsidian chiaroscuro
            const spec = Math.max(0, Math.min(1, luma / 130));
            d[i] = Math.round(10 + spec * 25);
            d[i + 1] = Math.round(8 + spec * 20);
            d[i + 2] = Math.round(20 + spec * 55);
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Writhing smoke & shadow tendrils dripping from coat and fedora
        ctx.save();
        ctx.strokeStyle = '#7E22CE';
        ctx.lineWidth = 12;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 30;

        const smokeTendrils = [
          [[w * 0.35, h * 0.2], [w * 0.25, h * 0.14], [w * 0.12, h * 0.1]],
          [[w * 0.65, h * 0.2], [w * 0.75, h * 0.14], [w * 0.88, h * 0.1]],
          [[w * 0.28, h * 0.75], [w * 0.18, h * 0.85], [w * 0.08, h * 0.95]],
          [[w * 0.72, h * 0.75], [w * 0.82, h * 0.85], [w * 0.92, h * 0.95]]
        ];

        smokeTendrils.forEach(pts => {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
          ctx.stroke();

          ctx.strokeStyle = '#0B0914';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.strokeStyle = '#7E22CE';
          ctx.lineWidth = 12;
        });

        // Glowing Amber / White Spider Mask Lenses
        ctx.fillStyle = '#F59E0B';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.29, 16, 0, Math.PI * 2);
        ctx.arc(w * 0.56, h * 0.29, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.29, 8, 0, Math.PI * 2);
        ctx.arc(w * 0.56, h * 0.29, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = 'data:image/png;base64,' + base64;
    });
  }, noirPngB64);

  fs.writeFileSync('public/assets/noir_symbiote_hero.png', Buffer.from(noirResultB64, 'base64'));
  console.log('Saved public/assets/noir_symbiote_hero.png');

  // 5. Synthesize CARNAGE-PUNK from punk_hero.png
  console.log('5. Synthesizing CARNAGE-PUNK (punk_symbiote_hero.png)...');
  const punkPngB64 = fs.readFileSync('public/assets/punk_hero.png').toString('base64');
  const punkResultB64 = await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // Riot-Punk / Carnage transformation: Black obsidian + anarchy pink + zine yellow
        for (let i = 0; i < d.length; i += 4) {
          const a = d[i + 3];
          if (a < 15) continue;

          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          const isPinkVest = r > 150 && b > 80 && g < 120;
          const isYellowSpike = r > 160 && g > 140 && b < 80;

          if (isPinkVest) {
            // Hot Anarchy Carnage Crimson/Pink
            d[i] = 244;
            d[i + 1] = 20;
            d[i + 2] = 80;
          } else if (isYellowSpike) {
            // Electric Zine Yellow
            d[i] = 250;
            d[i + 1] = 204;
            d[i + 2] = 21;
          } else {
            // Obsidian Black punk armor
            const spec = Math.max(0, Math.min(1, luma / 140));
            d[i] = Math.round(15 + spec * 45);
            d[i + 1] = Math.round(5 + spec * 10);
            d[i + 2] = Math.round(20 + spec * 60);
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Mohawk spikes bursting with jagged symbiote spines & guitar tendrils
        ctx.save();
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 12;
        ctx.shadowColor = '#EAB308';
        ctx.shadowBlur = 30;

        // Spikes on mohawk head
        const mohawkSpikes = [
          [[w * 0.44, h * 0.16], [w * 0.42, h * 0.08], [w * 0.4, h * 0.02]],
          [[w * 0.48, h * 0.14], [w * 0.48, h * 0.06], [w * 0.48, h * 0.01]],
          [[w * 0.52, h * 0.15], [w * 0.54, h * 0.07], [w * 0.56, h * 0.02]],
          [[w * 0.56, h * 0.17], [w * 0.60, h * 0.09], [w * 0.64, h * 0.03]]
        ];

        mohawkSpikes.forEach(pts => {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
          ctx.stroke();

          ctx.strokeStyle = '#18181B';
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.strokeStyle = '#EC4899';
          ctx.lineWidth = 12;
        });

        // Guitar tendrils & needle-tooth grin
        ctx.shadowColor = '#EC4899';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 2;

        const grinX = w * 0.5;
        const grinY = h * 0.28;
        for (let t = -6; t <= 6; t++) {
          const gx = grinX + t * 8;
          const gy = grinY + Math.abs(t) * 1.8;
          ctx.beginPath();
          ctx.moveTo(gx - 4, gy);
          ctx.lineTo(gx, gy + 14);
          ctx.lineTo(gx + 4, gy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = 'data:image/png;base64,' + base64;
    });
  }, punkPngB64);

  fs.writeFileSync('public/assets/punk_symbiote_hero.png', Buffer.from(punkResultB64, 'base64'));
  console.log('Saved public/assets/punk_symbiote_hero.png');

  await browser.close();
  console.log('--- All 5 Symbiote Hero Assets Synthesized Successfully! ---');
}

main().catch(err => {
  console.error('Error synthesizing symbiote assets:', err);
  process.exit(1);
});
