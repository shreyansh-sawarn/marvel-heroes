import sharp from 'sharp';
import path from 'path';

async function generateCleanCutout(inputName, outputName, config) {
  const inputPath = path.join(process.cwd(), 'public', 'assets', inputName);
  const outputPath = path.join(process.cwd(), 'public', 'assets', outputName);

  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  // Create an SVG alpha mask with radial/elliptical feathering and character bounds
  const cx = width * (config.cx ?? 0.5);
  const cy = height * (config.cy ?? 0.5);
  const rx = width * (config.rx ?? 0.38);
  const ry = height * (config.ry ?? 0.42);

  // Read raw pixels
  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const maskBuffer = Buffer.alloc(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Normalized elliptical distance from center
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spider-Man suit detection:
      // Red: r dominant
      const isRed = r > 70 && r > g * 1.2 && r > b * 1.15;
      // Blue: b dominant
      const isBlue = b > 65 && b > g * 1.05 && r < b * 1.35;
      // White eye lenses
      const isWhite = r > 140 && g > 140 && b > 140;
      // Core character mass
      const isCore = dist < 0.65 && (isRed || isBlue || isWhite || (r > 40 && b > 40));

      let a = 0;
      if (dist < 1.0) {
        if (isCore || isRed || isBlue || isWhite) {
          // Inner core is 100% opaque
          if (dist < 0.7) {
            a = 255;
          } else {
            // Feathered falloff on character edges
            a = Math.floor(255 * Math.max(0, 1 - (dist - 0.7) / 0.3));
          }
        } else if (dist < 0.55) {
          // Mid body shadows
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > 25) {
            a = Math.floor(255 * (1 - dist / 0.55));
          }
        }
      }

      maskBuffer[y * width + x] = a;
    }
  }

  // Smooth blur mask to ensure zero harsh edges
  const blurredMask = await sharp(maskBuffer, {
    raw: { width, height, channels: 1 },
  })
    .blur(4.0)
    .raw()
    .toBuffer();

  const outData = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 4;
    outData[srcIdx] = data[srcIdx];
    outData[srcIdx + 1] = data[srcIdx + 1];
    outData[srcIdx + 2] = data[srcIdx + 2];
    outData[srcIdx + 3] = blurredMask[i];
  }

  await sharp(outData, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`Exported clean cutout: ${outputName}`);
}

async function run() {
  await generateCleanCutout('spidey_crouch.jpg', 'spidey_crouch_cutout.png', { cx: 0.5, cy: 0.44, rx: 0.38, ry: 0.42 });
  await generateCleanCutout('spidey_leap.jpg', 'spidey_leap_cutout.png', { cx: 0.52, cy: 0.48, rx: 0.42, ry: 0.42 });
  await generateCleanCutout('spidey_swing.jpg', 'spidey_swing_cutout.png', { cx: 0.54, cy: 0.46, rx: 0.42, ry: 0.42 });
  console.log('All clean cutouts regenerated!');
}

run();
