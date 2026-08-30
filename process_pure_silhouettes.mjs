import sharp from 'sharp';
import path from 'path';

async function extractCharacterSilhouette(inputName, outputName, bounds) {
  const inputPath = path.join(process.cwd(), 'public', 'assets', inputName);
  const outputPath = path.join(process.cwd(), 'public', 'assets', outputName);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const mask = Buffer.alloc(width * height);

  const minX = Math.floor(width * bounds.minX);
  const maxX = Math.floor(width * bounds.maxX);
  const minY = Math.floor(height * bounds.minY);
  const maxY = Math.floor(height * bounds.maxY);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (x < minX || x > maxX || y < minY || y > maxY) {
        mask[y * width + x] = 0;
        continue;
      }

      // Check if pixel belongs to Spider-Man suit
      // 1. Red Suit / Mask / Boots / Gloves
      const isRed = r > 60 && r > g * 1.15 && r > b * 1.1;
      // 2. Deep Blue Suit Panels
      const isBlue = b > 48 && b > g * 1.02 && (r < b * 1.45 || b > 75);
      // 3. White Reflective Eye Lenses
      const isWhite = r > 130 && g > 130 && b > 130 && Math.abs(r - g) < 35 && Math.abs(g - b) < 35;
      // 4. Subtle highlights on red/blue suit edges
      const isSuitHighlight = (r > 80 && b > 45 && g < r * 0.9) || (b > 80 && r > 40 && g < b * 0.9);

      let isCharacter = isRed || isBlue || isWhite || isSuitHighlight;

      // Filter out background yellow/warm window lights (high green and low blue)
      if (g > 70 && b < 60 && r > 80 && !isRed) {
        isCharacter = false;
      }

      mask[y * width + x] = isCharacter ? 255 : 0;
    }
  }

  // Morphological dilation & closing to fill in suit shadows and webbing gaps
  const dilated = Buffer.alloc(width * height);
  const radius = 3;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxVal = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const val = mask[ny * width + nx];
            if (val > maxVal) maxVal = val;
          }
        }
      }
      dilated[y * width + x] = maxVal;
    }
  }

  // Soft blur on the dilated alpha mask for silky anti-aliased edges
  const smoothAlpha = await sharp(dilated, {
    raw: { width, height, channels: 1 },
  })
    .blur(2.0)
    .raw()
    .toBuffer();

  const outData = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 4;
    outData[srcIdx] = data[srcIdx];
    outData[srcIdx + 1] = data[srcIdx + 1];
    outData[srcIdx + 2] = data[srcIdx + 2];
    outData[srcIdx + 3] = smoothAlpha[i];
  }

  await sharp(outData, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`Generated pure character silhouette: ${outputName}`);
}

async function run() {
  await extractCharacterSilhouette('spidey_crouch.jpg', 'spidey_crouch_cutout.png', {
    minX: 0.15, maxX: 0.85, minY: 0.12, maxY: 0.88,
  });
  await extractCharacterSilhouette('spidey_leap.jpg', 'spidey_leap_cutout.png', {
    minX: 0.18, maxX: 0.86, minY: 0.15, maxY: 0.88,
  });
  await extractCharacterSilhouette('spidey_swing.jpg', 'spidey_swing_cutout.png', {
    minX: 0.18, maxX: 0.88, minY: 0.12, maxY: 0.90,
  });
  console.log('All character silhouettes extracted cleanly!');
}

run();
