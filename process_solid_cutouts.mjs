import sharp from 'sharp';
import path from 'path';

async function processSolidCutout(inputName, outputName, cxRatio, cyRatio, innerR, outerR) {
  const inputPath = path.join(process.cwd(), 'public', 'assets', inputName);
  const outputPath = path.join(process.cwd(), 'public', 'assets', outputName);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const cx = width * cxRatio;
  const cy = height * cyRatio;
  const maxR = Math.min(width, height) / 2;

  const rInner = maxR * innerR;
  const rOuter = maxR * outerR;

  const outData = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let alpha = 0;
      if (dist <= rInner) {
        alpha = 255;
      } else if (dist < rOuter) {
        // Smooth S-curve transition
        const t = (dist - rInner) / (rOuter - rInner);
        const smoothT = t * t * (3 - 2 * t);
        alpha = Math.floor(255 * (1 - smoothT));
      }

      // If outside or semi-transparent, also fade dark black edges
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (dist > rInner * 0.8 && lum < 20) {
        alpha = Math.floor(alpha * (lum / 20));
      }

      outData[idx] = r;
      outData[idx + 1] = g;
      outData[idx + 2] = b;
      outData[idx + 3] = alpha;
    }
  }

  await sharp(outData, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`Generated solid cutout: ${outputName}`);
}

async function run() {
  await processSolidCutout('spidey_crouch.jpg', 'spidey_crouch_cutout.png', 0.5, 0.44, 0.72, 0.94);
  await processSolidCutout('spidey_leap.jpg', 'spidey_leap_cutout.png', 0.52, 0.48, 0.72, 0.94);
  await processSolidCutout('spidey_swing.jpg', 'spidey_swing_cutout.png', 0.54, 0.46, 0.72, 0.94);
  console.log('All solid cutouts ready!');
}

run();
