import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(process.cwd(), 'scratch', 'brand_new_day_fullres');

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://images.google.com/'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      fs.unlink(dest, () => {});
      reject(new Error('Timeout'));
    });
  });
}

async function fetchDirect4K() {
  const directUrls = [
    { url: 'https://images.hdqwalls.com/download/spider-man-no-way-home-final-suit-4k-wallpaper-3840x2160.jpg', name: 'nwh_final_suit_4k.jpg' },
    { url: 'https://images.hdqwalls.com/download/spider-man-brand-new-day-movie-4k-3840x2160.jpg', name: 'bnd_movie_4k.jpg' },
    { url: 'https://images.hdqwalls.com/download/spider-man-brand-new-day-the-last-swing-4k-3840x2160.jpg', name: 'bnd_last_swing_4k.jpg' },
    { url: 'https://images.hdqwalls.com/download/spider-man-brand-new-day-rise-4k-3840x2160.jpg', name: 'bnd_rise_4k.jpg' },
    { url: 'https://images.hdqwalls.com/download/spider-man-red-and-blue-legacy-4k-3840x2160.jpg', name: 'bnd_legacy_4k.jpg' }
  ];

  for (const item of directUrls) {
    const dest = path.join(outDir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      await downloadUrl(item.url, dest);
      const meta = await sharp(dest).metadata();
      console.log(`✓ [${item.name}] ${meta.width}x${meta.height}`);
    } catch (e) {
      console.error(`Failed ${item.name}: ${e.message}`);
    }
  }
}

fetchDirect4K().catch(console.error);
