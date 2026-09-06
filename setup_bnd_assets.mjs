import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const scratchDir = path.join(process.cwd(), 'scratch', 'brand_new_day_fullres');
const assetsDir = path.join(process.cwd(), 'public', 'assets');

async function processBndAssets() {
  console.log('Processing Brand New Day assets...');

  // 1. Spidey Perch (Empire State golden hour) -> spidey_crouch_raw.jpg
  const perchSrc = path.join(scratchDir, 'bnd_hero_2.jpg');
  const perchDest = path.join(assetsDir, 'spidey_crouch_raw.jpg');
  await sharp(perchSrc)
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(perchDest);
  console.log('✓ spidey_crouch_raw.jpg updated with BND 4K Perch (Empire State)');

  // 2. Spidey Freefall Dive (Inverted Manhattan) -> spidey_leap_raw.jpg
  const leapSrc = path.join(scratchDir, 'bnd_hero_0.jpg');
  const leapDest = path.join(assetsDir, 'spidey_leap_raw.jpg');
  await sharp(leapSrc)
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(leapDest);
  console.log('✓ spidey_leap_raw.jpg updated with BND 4K Freefall (Inverted Skyline)');

  // 3. Spidey Mid-Air Swing & Spider-Sense -> spidey_swing_raw.jpg
  const swingSrc = path.join(scratchDir, 'bnd_hero_6.jpg');
  const swingDest = path.join(assetsDir, 'spidey_swing_raw.jpg');
  await sharp(swingSrc)
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(swingDest);
  console.log('✓ spidey_swing_raw.jpg updated with BND 4K Swing & Spider-Sense');

  console.log('All Brand New Day assets prepared successfully!');
}

processBndAssets().catch(console.error);
