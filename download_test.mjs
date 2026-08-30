import https from 'https';
import fs from 'fs';
import path from 'path';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function run() {
  try {
    const html = await fetchText('https://www.freepnglogos.com/images/spiderman');
    const matches = [...html.matchAll(/https:\/\/www\.freepnglogos\.com\/uploads\/spiderman-png\/[^"']+\.png/gi)].map(m => m[0]);
    const unique = [...new Set(matches)];
    console.log('Found PNGs:', unique);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
