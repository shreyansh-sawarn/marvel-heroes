import https from 'https';
import fs from 'fs';

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(url, '-> Status:', res.statusCode, 'Headers:', res.headers['content-type'], res.headers['content-length']);
      resolve(res.statusCode === 200);
    }).on('error', (e) => {
      console.log(url, '-> Error:', e.message);
      resolve(false);
    });
  });
}

async function test() {
  await checkUrl('https://iron-man-jet.vercel.app/frames/frame_0001.jpg');
  await checkUrl('https://iron-man-jet.vercel.app/frames/frame_0050.jpg');
  await checkUrl('https://iron-man-jet.vercel.app/frames2/frame_0001.jpg');
}

test();
