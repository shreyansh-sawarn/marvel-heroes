import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

const outDir = path.join(process.cwd(), 'scratch', 'tom_holland_candidates');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync('tom_holland_ddg_candidates.json', 'utf8'));

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadBatch() {
  const categories = ['perch', 'leap', 'swing'];
  for (const cat of categories) {
    const urls = data[cat].slice(0, 15);
    let count = 0;
    for (let i = 0; i < urls.length; i++) {
      const dest = path.join(outDir, `${cat}_${i}.jpg`);
      try {
        await download(urls[i], dest);
        const meta = await sharp(dest).metadata();
        console.log(`[${cat}_${i}] ${meta.width}x${meta.height}, format=${meta.format}`);
        count++;
      } catch (e) {
        // ignore failed downloads
      }
    }
  }
}

downloadBatch().catch(console.error);
