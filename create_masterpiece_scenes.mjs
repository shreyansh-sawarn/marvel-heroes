import sharp from 'sharp';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'public', 'assets');
const skylinePath = path.join(assetsDir, 'nyc_skyline.jpg');

const W = 1920;
const H = 1080;

/**
 * Inpaints and removes the artificial Daily Bugle sticker from nyc_skyline.jpg
 * to produce a 100% natural, photorealistic architectural skyline.
 */
async function getCleanSkyline(targetW, targetH, offsetX = 0) {
  const rawMeta = await sharp(skylinePath).metadata();
  const rawW = rawMeta.width;  // 1376
  const rawH = rawMeta.height; // 768

  const { data } = await sharp(skylinePath).raw().toBuffer({ resolveWithObject: true });
  const cleanData = Buffer.from(data);

  // Inpaint the rectangular sign area on the building facade (x: 330 to 635, y: 325 to 430)
  const topY = 325;
  const botY = 430;
  const leftX = 330;
  const rightX = 635;

  for (let y = topY; y <= botY; y++) {
    const t = (y - topY) / (botY - topY);
    const topSampleY = 270 + ((y - topY) % 42);
    const botSampleY = 440 + ((y - topY) % 42);

    for (let x = leftX; x <= rightX; x++) {
      const idx = (y * rawW + x) * 3;
      const topIdx = (topSampleY * rawW + x) * 3;
      const botIdx = (botSampleY * rawW + x) * 3;

      const r = cleanData[topIdx] * (1 - t) + cleanData[botIdx] * t;
      const g = cleanData[topIdx + 1] * (1 - t) + cleanData[botIdx + 1] * t;
      const b = cleanData[topIdx + 2] * (1 - t) + cleanData[botIdx + 2] * t;

      const noise = (Math.sin(x * 15.3 + y * 7.7) * 2);

      cleanData[idx] = Math.max(0, Math.min(255, Math.round(r + noise)));
      cleanData[idx + 1] = Math.max(0, Math.min(255, Math.round(g + noise)));
      cleanData[idx + 2] = Math.max(0, Math.min(255, Math.round(b + noise)));
    }
  }

  // Smooth the left and right border blend (15px blend)
  for (let y = topY - 10; y <= botY + 10; y++) {
    for (let i = 0; i < 15; i++) {
      const xL = leftX + i;
      const xR = rightX - i;
      const blendT = i / 15;

      const idxL = (y * rawW + xL) * 3;
      const origIdxL = (y * rawW + (leftX - 1)) * 3;
      cleanData[idxL] = Math.round(data[origIdxL] * (1 - blendT) + cleanData[idxL] * blendT);
      cleanData[idxL+1] = Math.round(data[origIdxL+1] * (1 - blendT) + cleanData[idxL+1] * blendT);
      cleanData[idxL+2] = Math.round(data[origIdxL+2] * (1 - blendT) + cleanData[idxL+2] * blendT);

      const idxR = (y * rawW + xR) * 3;
      const origIdxR = (y * rawW + (rightX + 1)) * 3;
      cleanData[idxR] = Math.round(data[origIdxR] * (1 - blendT) + cleanData[idxR] * blendT);
      cleanData[idxR+1] = Math.round(data[origIdxR+1] * (1 - blendT) + cleanData[idxR+1] * blendT);
      cleanData[idxR+2] = Math.round(data[origIdxR+2] * (1 - blendT) + cleanData[idxR+2] * blendT);
    }
  }

  const cleanSkyline = await sharp(cleanData, { raw: { width: rawW, height: rawH, channels: 3 } })
    .resize(targetW, targetH, { fit: 'cover' })
    .extract({ left: offsetX, top: 0, width: W, height: H })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return cleanSkyline.data;
}

/**
 * Creates the clean, photorealistic 16:9 Perch Scene
 */
async function buildPerchScene() {
  console.log('Building clean photorealistic Perch Scene...');

  const bgData = await getCleanSkyline(2300, H, 300);

  const charW = 1280;
  const charH = 1080;
  const charLeft = W - charW; // 640

  const crouchRaw = await sharp(path.join(assetsDir, 'spidey_crouch_raw.jpg'))
    .resize(charW, charH, { fit: 'cover', position: 'right' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cData = crouchRaw.data;

  const finalRGBA = Buffer.alloc(W * H * 4);

  // Initialize with clean background skyline
  for (let i = 0; i < W * H; i++) {
    finalRGBA[i * 4] = bgData[i * 4];
    finalRGBA[i * 4 + 1] = bgData[i * 4 + 1];
    finalRGBA[i * 4 + 2] = bgData[i * 4 + 2];
    finalRGBA[i * 4 + 3] = 255;
  }

  // A. Organic stone rooftop parapet across the bottom (y: 695 to 1080, x: 0 to charLeft + 220)
  for (let y = 695; y < H; y++) {
    for (let x = 0; x < charLeft + 220; x++) {
      const outIdx = (y * W + x) * 4;

      const s1X = 35 + ((x * 0.85 + Math.sin(y * 0.05) * 15) % 180 + 180) % 180;
      const c1Idx = (y * charW + Math.floor(s1X)) * 4;
      const r1 = cData[c1Idx];
      const g1 = cData[c1Idx + 1];
      const b1 = cData[c1Idx + 2];

      const s2X = 145 + ((x * 0.72 + Math.cos(y * 0.04) * 20) % 160 + 160) % 160;
      const c2Idx = (y * charW + Math.floor(s2X)) * 4;
      const r2 = cData[c2Idx];
      const g2 = cData[c2Idx + 1];
      const b2 = cData[c2Idx + 2];

      const blendW = 0.5 + 0.5 * Math.sin(x * 0.02 + y * 0.015);
      const sR = Math.round(r1 * blendW + r2 * (1 - blendW));
      const sG = Math.round(g1 * blendW + g2 * (1 - blendW));
      const sB = Math.round(b1 * blendW + b2 * (1 - blendW));

      const lightFactor = Math.min(1.0, 0.68 + (x / (charLeft + 220)) * 0.32);

      if (y < 718) {
        const t = Math.min(1.0, Math.max(0.0, (y - 695) / 23));
        const smoothT = t * t * (3 - 2 * t);
        const curR = finalRGBA[outIdx];
        const curG = finalRGBA[outIdx + 1];
        const curB = finalRGBA[outIdx + 2];

        finalRGBA[outIdx] = Math.round(curR * (1 - smoothT) + sR * lightFactor * smoothT);
        finalRGBA[outIdx + 1] = Math.round(curG * (1 - smoothT) + sG * lightFactor * smoothT);
        finalRGBA[outIdx + 2] = Math.round(curB * (1 - smoothT) + sB * lightFactor * smoothT);
      } else {
        finalRGBA[outIdx] = Math.round(sR * lightFactor);
        finalRGBA[outIdx + 1] = Math.round(sG * lightFactor);
        finalRGBA[outIdx + 2] = Math.round(sB * lightFactor);
      }
    }
  }

  // B. Natural sky & city transition zone [540, 740] for y < 718
  const skyBlendStart = 540;
  const skyBlendEnd = 740;

  for (let y = 0; y < 718; y++) {
    for (let x = skyBlendStart; x < skyBlendEnd; x++) {
      const outIdx = (y * W + x) * 4;
      const bgR = bgData[outIdx];
      const bgG = bgData[outIdx + 1];
      const bgB = bgData[outIdx + 2];

      const cx = x - charLeft;
      let cR = bgR, cG = bgG, cB = bgB;
      if (cx >= 0 && cx < charW) {
        const cIdx = (y * charW + cx) * 4;
        cR = cData[cIdx];
        cG = cData[cIdx + 1];
        cB = cData[cIdx + 2];
      } else {
        const cIdx = (y * charW + 0) * 4;
        cR = cData[cIdx];
        cG = cData[cIdx + 1];
        cB = cData[cIdx + 2];
      }

      const t = (x - skyBlendStart) / (skyBlendEnd - skyBlendStart);
      const smoothT = t * t * (3 - 2 * t);

      finalRGBA[outIdx] = Math.round(bgR * (1 - smoothT) + cR * smoothT);
      finalRGBA[outIdx + 1] = Math.round(bgG * (1 - smoothT) + cG * smoothT);
      finalRGBA[outIdx + 2] = Math.round(bgB * (1 - smoothT) + cB * smoothT);
    }
  }

  // C. Seamless blend for stone ledge transition [charLeft + 60, charLeft + 220]
  const ledgeBlendStart = charLeft + 60;
  const ledgeBlendEnd = charLeft + 220;
  for (let y = 718; y < H; y++) {
    for (let x = ledgeBlendStart; x < ledgeBlendEnd; x++) {
      const outIdx = (y * W + x) * 4;
      const cx = x - charLeft;
      const cIdx = (y * charW + cx) * 4;

      const cR = cData[cIdx];
      const cG = cData[cIdx + 1];
      const cB = cData[cIdx + 2];

      const curR = finalRGBA[outIdx];
      const curG = finalRGBA[outIdx + 1];
      const curB = finalRGBA[outIdx + 2];

      const t = (x - ledgeBlendStart) / (ledgeBlendEnd - ledgeBlendStart);
      const smoothT = t * t * (3 - 2 * t);

      finalRGBA[outIdx] = Math.round(curR * (1 - smoothT) + cR * smoothT);
      finalRGBA[outIdx + 1] = Math.round(curG * (1 - smoothT) + cG * smoothT);
      finalRGBA[outIdx + 2] = Math.round(curB * (1 - smoothT) + cB * smoothT);
    }
  }

  // D. 100% Solid Spider-Man & Rooftop Corner
  for (let y = 0; y < 718; y++) {
    for (let x = skyBlendEnd; x < W; x++) {
      const outIdx = (y * W + x) * 4;
      const cx = x - charLeft;
      if (cx >= 0 && cx < charW) {
        const cIdx = (y * charW + cx) * 4;
        finalRGBA[outIdx] = cData[cIdx];
        finalRGBA[outIdx + 1] = cData[cIdx + 1];
        finalRGBA[outIdx + 2] = cData[cIdx + 2];
        finalRGBA[outIdx + 3] = 255;
      }
    }
  }

  for (let y = 718; y < H; y++) {
    for (let x = ledgeBlendEnd; x < W; x++) {
      const outIdx = (y * W + x) * 4;
      const cx = x - charLeft;
      if (cx >= 0 && cx < charW) {
        const cIdx = (y * charW + cx) * 4;
        finalRGBA[outIdx] = cData[cIdx];
        finalRGBA[outIdx + 1] = cData[cIdx + 1];
        finalRGBA[outIdx + 2] = cData[cIdx + 2];
        finalRGBA[outIdx + 3] = 255;
      }
    }
  }

  await sharp(finalRGBA, { raw: { width: W, height: H, channels: 4 } })
    .jpeg({ quality: 96 })
    .toFile(path.join(assetsDir, 'scene_perch_16x9.jpg'));

  console.log('Exported clean scene_perch_16x9.jpg');
}

/**
 * Creates the clean, photorealistic 16:9 Leap Scene
 */
async function buildLeapScene() {
  console.log('Building clean photorealistic Leap Scene...');

  const bgData = await getCleanSkyline(2300, H, 300);

  const charW = 1280;
  const charH = 1080;
  const charLeft = W - charW; // 640

  const leapRaw = await sharp(path.join(assetsDir, 'spidey_leap_raw.jpg'))
    .resize(charW, charH, { fit: 'cover', position: 'right' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cData = leapRaw.data;

  const finalRGBA = Buffer.alloc(W * H * 4);

  const blendStartX = 540;
  const blendEndX = 760;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const outIdx = (y * W + x) * 4;
      const bgR = bgData[outIdx];
      const bgG = bgData[outIdx + 1];
      const bgB = bgData[outIdx + 2];

      if (x < blendStartX) {
        finalRGBA[outIdx] = bgR;
        finalRGBA[outIdx + 1] = bgG;
        finalRGBA[outIdx + 2] = bgB;
        finalRGBA[outIdx + 3] = 255;
      } else if (x < blendEndX) {
        const cx = x - charLeft;
        let cR = bgR, cG = bgG, cB = bgB;
        if (cx >= 0 && cx < charW) {
          const cIdx = (y * charW + cx) * 4;
          cR = cData[cIdx];
          cG = cData[cIdx + 1];
          cB = cData[cIdx + 2];
        } else {
          const cIdx = (y * charW + 0) * 4;
          cR = cData[cIdx];
          cG = cData[cIdx + 1];
          cB = cData[cIdx + 2];
        }

        const t = (x - blendStartX) / (blendEndX - blendStartX);
        const smoothT = t * t * (3 - 2 * t);

        finalRGBA[outIdx] = Math.round(bgR * (1 - smoothT) + cR * smoothT);
        finalRGBA[outIdx + 1] = Math.round(bgG * (1 - smoothT) + cG * smoothT);
        finalRGBA[outIdx + 2] = Math.round(bgB * (1 - smoothT) + cB * smoothT);
        finalRGBA[outIdx + 3] = 255;
      } else {
        const cx = x - charLeft;
        if (cx >= 0 && cx < charW) {
          const cIdx = (y * charW + cx) * 4;
          finalRGBA[outIdx] = cData[cIdx];
          finalRGBA[outIdx + 1] = cData[cIdx + 1];
          finalRGBA[outIdx + 2] = cData[cIdx + 2];
          finalRGBA[outIdx + 3] = 255;
        }
      }
    }
  }

  await sharp(finalRGBA, { raw: { width: W, height: H, channels: 4 } })
    .jpeg({ quality: 96 })
    .toFile(path.join(assetsDir, 'scene_leap_16x9.jpg'));

  console.log('Exported clean scene_leap_16x9.jpg');
}

/**
 * Creates the clean, photorealistic 16:9 Swing Scene
 */
async function buildSwingScene() {
  console.log('Building clean photorealistic Swing Scene...');

  const bgData = await getCleanSkyline(2300, H, 300);

  const charW = 1280;
  const charH = 1080;
  const charLeft = W - charW; // 640

  const swingRaw = await sharp(path.join(assetsDir, 'spidey_swing_raw.jpg'))
    .resize(charW, charH, { fit: 'cover', position: 'right' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cData = swingRaw.data;

  const finalRGBA = Buffer.alloc(W * H * 4);

  const blendStartX = 540;
  const blendEndX = 780;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const outIdx = (y * W + x) * 4;
      const bgR = bgData[outIdx];
      const bgG = bgData[outIdx + 1];
      const bgB = bgData[outIdx + 2];

      if (x < blendStartX) {
        finalRGBA[outIdx] = bgR;
        finalRGBA[outIdx + 1] = bgG;
        finalRGBA[outIdx + 2] = bgB;
        finalRGBA[outIdx + 3] = 255;
      } else if (x < blendEndX) {
        const cx = x - charLeft;
        let cR = bgR, cG = bgG, cB = bgB;
        if (cx >= 0 && cx < charW) {
          const cIdx = (y * charW + cx) * 4;
          cR = cData[cIdx];
          cG = cData[cIdx + 1];
          cB = cData[cIdx + 2];
        } else {
          const cIdx = (y * charW + 0) * 4;
          cR = cData[cIdx];
          cG = cData[cIdx + 1];
          cB = cData[cIdx + 2];
        }

        const t = (x - blendStartX) / (blendEndX - blendStartX);
        const smoothT = t * t * (3 - 2 * t);

        finalRGBA[outIdx] = Math.round(bgR * (1 - smoothT) + cR * smoothT);
        finalRGBA[outIdx + 1] = Math.round(bgG * (1 - smoothT) + cG * smoothT);
        finalRGBA[outIdx + 2] = Math.round(bgB * (1 - smoothT) + cB * smoothT);
        finalRGBA[outIdx + 3] = 255;
      } else {
        const cx = x - charLeft;
        if (cx >= 0 && cx < charW) {
          const cIdx = (y * charW + cx) * 4;
          finalRGBA[outIdx] = cData[cIdx];
          finalRGBA[outIdx + 1] = cData[cIdx + 1];
          finalRGBA[outIdx + 2] = cData[cIdx + 2];
          finalRGBA[outIdx + 3] = 255;
        }
      }
    }
  }

  await sharp(finalRGBA, { raw: { width: W, height: H, channels: 4 } })
    .jpeg({ quality: 96 })
    .toFile(path.join(assetsDir, 'scene_swing_16x9.jpg'));

  console.log('Exported clean scene_swing_16x9.jpg');
}

async function run() {
  await buildPerchScene();
  await buildLeapScene();
  await buildSwingScene();
  console.log('ALL 3 SCENES EXPORTED!');
}

run();
