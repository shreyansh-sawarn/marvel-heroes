import https from 'https';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const urls = [
  { url: 'https://img.uhdpaper.com/wallpaper/iron-man-unibeam-76@0@h-pc-4k.jpg', file: 'im_unibeam_direct.jpg' },
  { url: 'https://wallpapercave.com/wp/wp5960978.jpg', file: 'im_mk85_cave.jpg' }
];

const outDir = path.join(process.cwd(), 'scratch', 'iron_man_fullres');

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.google.com/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => f.close(resolve));
    });
    req.on('error', reject);
  });
}

async function main() {
  for (const item of urls) {
    const dest = path.join(outDir, item.file);
    try {
      console.log(`Downloading ${item.url}...`);
      await download(item.url, dest);
      const meta = await sharp(dest).metadata();
      console.log(`✓ ${item.file}: ${meta.width}x${meta.height}`);
    } catch (e) {
      console.error(`Error downloading ${item.file}:`, e.message);
    }
  }
}

main();
