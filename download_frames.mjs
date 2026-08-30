import https from 'https';
import fs from 'fs';
import path from 'path';

async function downloadFile(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    return true;
  }
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        resolve(false);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    });
    req.on('error', () => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function downloadSequence(dirName, urlPrefix, totalFrames) {
  const dir = path.join(process.cwd(), 'public', dirName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`Starting download for ${dirName} (${totalFrames} frames)...`);
  const concurrency = 12;
  let index = 0;

  async function worker() {
    while (index < totalFrames) {
      const i = index++;
      const frameNum = String(i + 1).padStart(4, '0');
      const filename = `frame_${frameNum}.jpg`;
      const url = `${urlPrefix}${filename}`;
      const dest = path.join(dir, filename);
      await downloadFile(url, dest);
    }
  }

  const workers = Array.from({ length: concurrency }).map(() => worker());
  await Promise.all(workers);
  console.log(`Completed download for ${dirName}!`);
}

async function main() {
  await downloadSequence('frames', 'https://iron-man-jet.vercel.app/frames/', 169);
  await downloadSequence('frames2', 'https://iron-man-jet.vercel.app/frames2/', 169);
  console.log('All 3D cinematic frame sequences ready!');
}

main();
