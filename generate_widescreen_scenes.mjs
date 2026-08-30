import sharp from 'sharp';
import path from 'path';

const skylinePath = path.join(process.cwd(), 'public', 'assets', 'nyc_skyline.jpg');

async function createWidescreenScene(charPath, outputPath, options) {
  const width = 1920;
  const height = 1080;

  // 1. Resize and crop panoramic skyline to exact 1920x1080
  const bgBuffer = await sharp(skylinePath)
    .resize(width, height, { fit: 'cover' })
    .toBuffer();

  // 2. Load character image and resize so it fits comfortably in the 1080px height
  const charMeta = await sharp(charPath).metadata();
  const targetCharH = Math.floor(height * (options.charHeightPct || 0.82)); // 82% of screen height
  const targetCharW = Math.floor(targetCharH * (charMeta.width / charMeta.height));

  const charResized = await sharp(charPath)
    .resize(targetCharW, targetCharH, { fit: 'contain' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cW = charResized.info.width;
  const cH = charResized.info.height;
  const cData = charResized.data;

  // 3. Create a smooth feathered radial/elliptical alpha mask on the character
  const mask = Buffer.alloc(cW * cH);
  const cx = cW * 0.5;
  const cy = cH * (options.cy || 0.48);
  const maxRx = cW * (options.rx || 0.48);
  const maxRy = cH * (options.ry || 0.48);

  for (let y = 0; y < cH; y++) {
    for (let x = 0; x < cW; x++) {
      const idx = (y * cW + x) * 4;
      const r = cData[idx];
      const g = cData[idx + 1];
      const b = cData[idx + 2];

      const dx = (x - cx) / maxRx;
      const dy = (y - cy) / maxRy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let alpha = 0;
      if (dist < 0.75) {
        alpha = 255;
      } else if (dist < 1.0) {
        const t = (dist - 0.75) / 0.25;
        alpha = Math.floor(255 * (1 - (t * t * (3 - 2 * t))));
      }

      // Also fade out very dark night sky around outer edges
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (dist > 0.6 && lum < 22) {
        alpha = Math.floor(alpha * (lum / 22));
      }

      mask[y * cW + x] = alpha;
    }
  }

  // Soft blur mask
  const blurredMask = await sharp(mask, { raw: { width: cW, height: cH, channels: 1 } })
    .blur(3.5)
    .raw()
    .toBuffer();

  const charRGBA = Buffer.alloc(cW * cH * 4);
  for (let i = 0; i < cW * cH; i++) {
    const src = i * 4;
    charRGBA[src] = cData[src];
    charRGBA[src + 1] = cData[src + 1];
    charRGBA[src + 2] = cData[src + 2];
    charRGBA[src + 3] = blurredMask[i];
  }

  const charPngBuffer = await sharp(charRGBA, { raw: { width: cW, height: cH, channels: 4 } })
    .png()
    .toBuffer();

  // 4. Composite character onto 1920x1080 skyline
  const left = Math.floor(width * (options.leftPct || 0.45));
  const top = Math.floor(height * (options.topPct || 0.1));

  // Add subtle cinematic gradient overlay
  const finalImage = await sharp(bgBuffer)
    .composite([
      {
        input: charPngBuffer,
        left: left,
        top: top,
      },
    ])
    .jpeg({ quality: 92 })
    .toFile(outputPath);

  console.log(`Saved 16:9 widescreen scene: ${outputPath}`);
}

async function run() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');

  // Scene 1: Rooftop Perch (Spider-Man on gargoyle on right side, full body visible from mask to feet)
  await createWidescreenScene(
    path.join(assetsDir, 'spidey_crouch.jpg'),
    path.join(assetsDir, 'scene_perch_16x9.jpg'),
    { leftPct: 0.38, topPct: 0.12, charHeightPct: 0.82, cy: 0.44, rx: 0.46, ry: 0.46 }
  );

  // Scene 2: Canyon Freefall Leap (Diving through the center-right)
  await createWidescreenScene(
    path.join(assetsDir, 'spidey_leap.jpg'),
    path.join(assetsDir, 'scene_leap_16x9.jpg'),
    { leftPct: 0.34, topPct: 0.08, charHeightPct: 0.85, cy: 0.46, rx: 0.46, ry: 0.46 }
  );

  // Scene 3: Mid-Air Arc Web Swing (Swinging across the frame)
  await createWidescreenScene(
    path.join(assetsDir, 'spidey_swing.jpg'),
    path.join(assetsDir, 'scene_swing_16x9.jpg'),
    { leftPct: 0.32, topPct: 0.05, charHeightPct: 0.88, cy: 0.45, rx: 0.48, ry: 0.48 }
  );

  console.log('All 16:9 widescreen scenes generated successfully!');
}

run();
