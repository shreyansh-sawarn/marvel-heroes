import sharp from 'sharp';
import path from 'path';

const skylinePath = path.join(process.cwd(), 'public', 'assets', 'nyc_skyline.jpg');

async function createFlawless16x9(charImageName, outputName, options = {}) {
  const charPath = path.join(process.cwd(), 'public', 'assets', charImageName);
  const outPath = path.join(process.cwd(), 'public', 'assets', outputName);

  const W = 1920;
  const H = 1080;

  // 1. Base 1920x1080 panoramic skyline
  const bgRaw = await sharp(skylinePath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bgData = bgRaw.data;

  // 2. Character image resized to fit full 1080px height
  const charSize = H; // 1080x1080
  const charRaw = await sharp(charPath)
    .resize(charSize, charSize, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const charData = charRaw.data;

  // 3. Composite with smooth horizontal alpha ramp between background and character
  const charLeft = W - charSize + (options.offsetX || 0); // e.g. 1920 - 1080 = 840
  const blendWidth = 240; // 240px wide seamless horizontal blend transition

  const finalRGBA = Buffer.alloc(W * H * 4);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const outIdx = (y * W + x) * 4;
      const bgIdx = (y * W + x) * 4;

      const bgR = bgData[bgIdx];
      const bgG = bgData[bgIdx + 1];
      const bgB = bgData[bgIdx + 2];

      if (x < charLeft) {
        // Pure skyline on left side
        finalRGBA[outIdx] = bgR;
        finalRGBA[outIdx + 1] = bgG;
        finalRGBA[outIdx + 2] = bgB;
        finalRGBA[outIdx + 3] = 255;
      } else {
        const charX = x - charLeft;
        const charIdx = (y * charSize + charX) * 4;

        const cR = charData[charIdx];
        const cG = charData[charIdx + 1];
        const cB = charData[charIdx + 2];

        if (charX < blendWidth) {
          // Smooth Hermite interpolation blend
          const t = charX / blendWidth;
          const smoothT = t * t * (3 - 2 * t);

          finalRGBA[outIdx] = Math.round(bgR * (1 - smoothT) + cR * smoothT);
          finalRGBA[outIdx + 1] = Math.round(bgG * (1 - smoothT) + cG * smoothT);
          finalRGBA[outIdx + 2] = Math.round(bgB * (1 - smoothT) + cB * smoothT);
          finalRGBA[outIdx + 3] = 255;
        } else {
          // 100% character image
          finalRGBA[outIdx] = cR;
          finalRGBA[outIdx + 1] = cG;
          finalRGBA[outIdx + 2] = cB;
          finalRGBA[outIdx + 3] = 255;
        }
      }
    }
  }

  await sharp(finalRGBA, {
    raw: { width: W, height: H, channels: 4 },
  })
    .jpeg({ quality: 95 })
    .toFile(outPath);

  console.log(`Exported flawless 16:9 widescreen scene: ${outputName}`);
}

async function run() {
  await createFlawless16x9('spidey_crouch_raw.jpg', 'scene_perch_16x9.jpg', { offsetX: 40 });
  await createFlawless16x9('spidey_leap_raw.jpg', 'scene_leap_16x9.jpg', { offsetX: 0 });
  await createFlawless16x9('spidey_swing_raw.jpg', 'scene_swing_16x9.jpg', { offsetX: -20 });
  console.log('All widescreen scenes exported flawlessly!');
}

run();
