import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const scratchBnd = path.join(process.cwd(), 'scratch', 'brand_new_day_fullres');
const scratchIm = path.join(process.cwd(), 'scratch', 'iron_man_fullres');
const assetsDir = path.join(process.cwd(), 'public', 'assets');

async function setupAssets() {
  console.log('--- Processing Modern Assets ---');

  // 1. Spider-Man Girder Patrol (5K UHD)
  const spideyPatrolSrc = path.join(scratchBnd, 'bnd_hero_3.jpg');
  const spideyPatrolDest = path.join(assetsDir, 'spidey_patrol_raw.jpg');
  if (fs.existsSync(spideyPatrolSrc)) {
    console.log('Processing spidey_patrol_raw.jpg (5K Girder Patrol)...');
    await sharp(spideyPatrolSrc)
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(spideyPatrolDest);
    console.log('✓ spidey_patrol_raw.jpg ready');
  } else {
    console.error('Missing bnd_hero_3.jpg!');
  }

  // 2. Iron Man Mark LXXXV Studio Armor (3840x2160 with generous headroom)
  const imHeroSrc = path.join(scratchIm, 'im_mk85_6.jpg');
  const imHeroDest = path.join(assetsDir, 'ironman_mk85_raw.jpg');
  if (fs.existsSync(imHeroSrc)) {
    console.log('Processing ironman_mk85_raw.jpg (Mark LXXXV Studio 3840x2160)...');
    const padded = await sharp(imHeroSrc)
      .extend({
        top: 320,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 17, g: 18, b: 22 },
      })
      .jpeg({ quality: 95 })
      .toBuffer();

    await sharp(padded)
      .resize(3840, 2160, { fit: 'contain', background: { r: 17, g: 18, b: 22 } })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(imHeroDest);
    console.log('✓ ironman_mk85_raw.jpg ready');
  } else {
    console.error('Missing im_mk85_6.jpg!');
  }

  // 3. Iron Man Supersonic Flight over Bay (3840x2160 4K UHD)
  const imFlightSrc = path.join(scratchIm, 'im_flying_1.jpg');
  const imFlightDest = path.join(assetsDir, 'ironman_flight_raw.jpg');
  if (fs.existsSync(imFlightSrc)) {
    console.log('Processing ironman_flight_raw.jpg (Supersonic Bay Flight)...');
    await sharp(imFlightSrc)
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(imFlightDest);
    console.log('✓ ironman_flight_raw.jpg ready');
  } else {
    console.error('Missing im_flying_1.jpg!');
  }

  // 4. Iron Man Mach-3 Banking Cloud Flight (3840x2160 4K UHD)
  const imBankSrc = path.join(scratchIm, 'im_flying_2.jpg');
  const imBankDest = path.join(assetsDir, 'ironman_banking_raw.jpg');
  if (fs.existsSync(imBankSrc)) {
    console.log('Processing ironman_banking_raw.jpg (Mach-3 Cloud Flight)...');
    await sharp(imBankSrc)
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(imBankDest);
    console.log('✓ ironman_banking_raw.jpg ready');
  } else {
    console.error('Missing im_flying_2.jpg!');
  }

  console.log('--- All Modern 4K/5K Assets Processed Successfully ---');
}

setupAssets().catch(console.error);
