import fs from 'fs';
import sharp from 'sharp';

async function processImage(inputPath, outputPath, options = {}) {
  const {
    bgLumaThreshold = 28,
    featherRange = 16,
    cropPadding = 10
  } = options;

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const isBg = new Uint8Array(width * height);
  const queue = [];

  // Seed boundary flood fill from all perimeter pixels
  for (let x = 0; x < width; x++) {
    queue.push(x, 0); // top row
    queue.push(x, height - 1); // bottom row
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(0, y); // left col
    queue.push(width - 1, y); // right col
  }

  // Flood fill from edges
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = y * width + x;
    if (isBg[idx]) continue;

    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    // If pixel is sufficiently dark and connected to outside, mark as background
    if (luma < bgLumaThreshold + featherRange) {
      isBg[idx] = 1;

      // Check 4-connected neighbors
      if (x > 0 && !isBg[idx - 1]) {
        queue.push(x - 1, y);
      }
      if (x < width - 1 && !isBg[idx + 1]) {
        queue.push(x + 1, y);
      }
      if (y > 0 && !isBg[idx - width]) {
        queue.push(x, y - 1);
      }
      if (y < height - 1 && !isBg[idx + width]) {
        queue.push(x, y + 1);
      }
    }
  }

  // Now compute alpha based on distance / luma for marked background and boundary
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      if (isBg[idx]) {
        if (luma <= bgLumaThreshold) {
          data[p + 3] = 0; // completely transparent
        } else {
          // Feathered edge
          const alphaRatio = (luma - bgLumaThreshold) / featherRange;
          data[p + 3] = Math.min(255, Math.max(0, Math.round(alphaRatio * 255)));
        }
      }

      // Track bounding box of visible character
      if (data[p + 3] > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Add padding
  minX = Math.max(0, minX - cropPadding);
  minY = Math.max(0, minY - cropPadding);
  maxX = Math.min(width - 1, maxX + cropPadding);
  maxY = Math.min(height - 1, maxY + cropPadding);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  console.log(`Extracted cutout: ${width}x${height} -> cropped ${cropW}x${cropH} at (${minX},${minY})`);

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent cutout to: ${outputPath}`);
}

async function run() {
  const milesJpg = 'C:/Users/shrey/.gemini/antigravity/brain/f4c37e09-a020-4371-9b21-94b4d0129a32/miles_symbiote_hero_1792611280080.jpg';
  const milesOut = 'public/assets/miles_symbiote_hero.png';
  if (fs.existsSync(milesJpg)) {
    await processImage(milesJpg, milesOut, { bgLumaThreshold: 22, featherRange: 20 });
  }
}
run();
