import sharp from 'sharp';
import path from 'path';

const scratchDir = path.join(process.cwd(), 'scratch', 'tom_holland_fullres');
const assetsDir = path.join(process.cwd(), 'public', 'assets');

async function processMcuAssets() {
  console.log('Processing Tom Holland MCU Spider-Man assets...');

  // Chapter 1: Perch — glide_0.jpg (3840x3840) -> public/assets/spidey_crouch_raw.jpg
  // Let's crop/frame high quality 2560x2560 or 2560x1440
  await sharp(path.join(scratchDir, 'glide_0.jpg'))
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toFile(path.join(assetsDir, 'spidey_crouch_raw.jpg'));
  console.log('✓ Created spidey_crouch_raw.jpg (Tom Holland Stark Suit Perch on Rooftop Ledge)');

  // Chapter 2: Dive — glide_5.jpg (3840x2160) -> public/assets/spidey_leap_raw.jpg
  await sharp(path.join(scratchDir, 'glide_5.jpg'))
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toFile(path.join(assetsDir, 'spidey_leap_raw.jpg'));
  console.log('✓ Created spidey_leap_raw.jpg (Tom Holland Mid-Air Web Shot Dive)');

  // Chapter 3: Swing — wc_nwh_1.jpg (5120x2880) -> public/assets/spidey_swing_raw.jpg
  await sharp(path.join(scratchDir, 'wc_nwh_1.jpg'))
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toFile(path.join(assetsDir, 'spidey_swing_raw.jpg'));
  console.log('✓ Created spidey_swing_raw.jpg (Tom Holland Integrated Suit 5K Swing)');
}

processMcuAssets().catch(console.error);
