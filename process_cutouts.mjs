import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImage(filename, outName, options = {}) {
  const inputPath = path.join(process.cwd(), 'public', 'assets', filename);
  const outputPath = path.join(process.cwd(), 'public', 'assets', outName);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const cx = width * (options.centerX ?? 0.5);
  const cy = height * (options.centerY ?? 0.5);
  const maxRadius = Math.min(width, height) * (options.radius ?? 0.48);

  const alphaBuffer = Buffer.alloc(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / maxRadius;

      // Color detection for Spider-Man:
      // Red suit: r is dominant
      const isRed = r > 65 && r > g * 1.25 && r > b * 1.25;
      // Blue suit: b is prominent, r < b * 1.3
      const isBlue = b > 55 && b > g * 1.05 && (r < b * 1.4 || b > 80);
      // White eye lenses / reflective specular sheen
      const isWhite = r > 150 && g > 150 && b > 150;
      // General body highlight in central core
      const isCoreBody = normDist < 0.75 && (r > 75 || b > 70 || (r > 50 && b > 40));
      // Dark webbing or shadows on body
      const isBodyWebbing = normDist < 0.65 && (r > 25 || b > 25);

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha = 0;

      if (normDist < 1.0) {
        if (isRed || isWhite) {
          alpha = 255;
        } else if (isBlue && normDist < 0.85) {
          alpha = 255;
        } else if (isCoreBody) {
          alpha = 255;
        } else if (isBodyWebbing && luminance > 20) {
          alpha = 230;
        } else if (normDist < 0.6) {
          alpha = Math.floor(Math.max(0, Math.min(255, (luminance - 25) * 4)));
        } else {
          // Edge feathering
          const edgeFade = Math.max(0, 1 - (normDist - 0.6) / 0.35);
          if (isRed || isBlue || isWhite) {
            alpha = Math.floor(255 * edgeFade);
          } else if (luminance > 40) {
            alpha = Math.floor(Math.min(255, (luminance - 40) * 2) * edgeFade);
          }
        }
      }

      alphaBuffer[y * width + x] = alpha;
    }
  }

  // Smooth blur on alpha mask for silky edges
  const blurredAlpha = await sharp(alphaBuffer, {
    raw: { width, height, channels: 1 },
  })
    .blur(2.5)
    .raw()
    .toBuffer();

  // Apply blurred alpha back to original RGBA
  const outData = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const outIdx = i * 4;
    outData[outIdx] = data[srcIdx];
    outData[outIdx + 1] = data[srcIdx + 1];
    outData[outIdx + 2] = data[srcIdx + 2];
    outData[outIdx + 3] = blurredAlpha[i];
  }

  await sharp(outData, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`Saved clean cutout: ${outName} (${width}x${height})`);
}

async function run() {
  await processImage('spidey_crouch.jpg', 'spidey_crouch_cutout.png', { centerX: 0.5, centerY: 0.45, radius: 0.46 });
  await processImage('spidey_leap.jpg', 'spidey_leap_cutout.png', { centerX: 0.52, centerY: 0.48, radius: 0.48 });
  await processImage('spidey_swing.jpg', 'spidey_swing_cutout.png', { centerX: 0.55, centerY: 0.46, radius: 0.48 });
  console.log('All character cutouts ready!');
}

run();
