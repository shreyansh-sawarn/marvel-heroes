import sharp from 'sharp';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'public', 'assets');
const skylinePath = path.join(assetsDir, 'nyc_skyline.jpg');

async function testFlawlessPerch() {
  const W = 1920;
  const H = 1080;

  // 1. Resize Background Skyline to 1920x1080, positioning left so Daily Bugle is prominently on the left
  const bgRaw = await sharp(skylinePath)
    .resize(W, H, { fit: 'cover', position: 'left' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bgData = bgRaw.data;

  // 2. Load Spidey Crouch Raw at exact 1080x1080
  const crouchSize = H; // 1080x1080
  const crouchRaw = await sharp(path.join(assetsDir, 'spidey_crouch_raw.jpg'))
    .resize(crouchSize, crouchSize, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cData = crouchRaw.data;

  // charLeft = 840 (so crouch spans exactly 840 to 1920 = 1080px!)
  const charLeft = W - crouchSize; // 840
  const blendStartX = 620; // Transition begins at 620
  const blendEndX = 840;   // Transition completes at 840 (Spider-Man's hand is at 940)

  const finalRGBA = Buffer.alloc(W * H * 4);

  // 1. Copy base skyline
  for (let i = 0; i < W * H; i++) {
    finalRGBA[i * 4] = bgData[i * 4];
    finalRGBA[i * 4 + 1] = bgData[i * 4 + 1];
    finalRGBA[i * 4 + 2] = bgData[i * 4 + 2];
    finalRGBA[i * 4 + 3] = 255;
  }

  // 2. Continuous stone rooftop ledge across the bottom (x: 0 to charLeft, y: 700 to 1080)
  // Sample strictly from clean stone region (cx: 20 to 180, cy: 700 to 1080)
  const stoneW = 160;
  for (let y = 700; y < H; y++) {
    for (let x = 0; x < charLeft; x++) {
      const outIdx = (y * W + x) * 4;

      // Seamless mirror sampling of stone texture
      const cycle = stoneW * 2;
      const mod = ((x % cycle) + cycle) % cycle;
      const sx = mod < stoneW ? 20 + mod : 20 + (cycle - 1 - mod);
      const cIdx = (y * crouchSize + Math.floor(sx)) * 4;

      const sR = cData[cIdx];
      const sG = cData[cIdx + 1];
      const sB = cData[cIdx + 2];

      // Subtle atmospheric vignette towards the left edge
      const lightFactor = Math.min(1.0, 0.65 + (x / charLeft) * 0.35);

      if (y < 725) {
        // Anti-aliased top bevel of stone ledge
        const t = Math.min(1.0, Math.max(0.0, (y - 700) / 25));
        const smoothT = t * t * (3 - 2 * t);
        const bgR = bgData[outIdx];
        const bgG = bgData[outIdx + 1];
        const bgB = bgData[outIdx + 2];

        finalRGBA[outIdx] = Math.round(bgR * (1 - smoothT) + sR * lightFactor * smoothT);
        finalRGBA[outIdx + 1] = Math.round(bgG * (1 - smoothT) + sG * lightFactor * smoothT);
        finalRGBA[outIdx + 2] = Math.round(bgB * (1 - smoothT) + sB * lightFactor * smoothT);
      } else {
        finalRGBA[outIdx] = Math.round(sR * lightFactor);
        finalRGBA[outIdx + 1] = Math.round(sG * lightFactor);
        finalRGBA[outIdx + 2] = Math.round(sB * lightFactor);
      }
    }
  }

  // 3. Smooth sky & background city blend in [blendStartX, blendEndX] for y < 725
  for (let y = 0; y < 725; y++) {
    for (let x = blendStartX; x < blendEndX; x++) {
      const outIdx = (y * W + x) * 4;
      const t = (x - blendStartX) / (blendEndX - blendStartX);
      const smoothT = t * t * (3 - 2 * t);

      // Sample left edge of crouch image
      const cx = 0;
      const cIdx = (y * crouchSize + cx) * 4;
      const cR = cData[cIdx];
      const cG = cData[cIdx + 1];
      const cB = cData[cIdx + 2];

      const bgR = finalRGBA[outIdx];
      const bgG = finalRGBA[outIdx + 1];
      const bgB = finalRGBA[outIdx + 2];

      finalRGBA[outIdx] = Math.round(bgR * (1 - smoothT) + cR * smoothT);
      finalRGBA[outIdx + 1] = Math.round(bgG * (1 - smoothT) + cG * smoothT);
      finalRGBA[outIdx + 2] = Math.round(bgB * (1 - smoothT) + cB * smoothT);
    }
  }

  // 4. Pure 100% Solid Crouch Image for x >= charLeft (Spider-Man + hand + rooftop + right skyline)
  for (let y = 0; y < H; y++) {
    for (let x = charLeft; x < W; x++) {
      const outIdx = (y * W + x) * 4;
      const cx = x - charLeft;
      const cIdx = (y * crouchSize + cx) * 4;

      finalRGBA[outIdx] = cData[cIdx];
      finalRGBA[outIdx + 1] = cData[cIdx + 1];
      finalRGBA[outIdx + 2] = cData[cIdx + 2];
      finalRGBA[outIdx + 3] = 255;
    }
  }

  await sharp(finalRGBA, { raw: { width: W, height: H, channels: 4 } })
    .jpeg({ quality: 96 })
    .toFile(path.join(assetsDir, 'test_flawless_perch.jpg'));

  console.log('Saved test_flawless_perch.jpg');
}

testFlawlessPerch();
