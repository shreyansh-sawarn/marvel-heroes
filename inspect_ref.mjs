import https from 'https';

function fetch(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
  });
}

async function run() {
  const code = await fetch('https://iron-man-jet.vercel.app/_next/static/chunks/0v2th9vu6jx02.js');
  console.log('Code length:', code.length);
  // Find frame sequence paths
  const frameMatches = code.match(/["'][^"']*(?:frame|sequence|mk85|hero|webm|mp4|webp|jpg|png)[^"']*["']/gi);
  console.log('Frame matches:', frameMatches ? frameMatches.slice(0, 30) : 'none');
}

run();
