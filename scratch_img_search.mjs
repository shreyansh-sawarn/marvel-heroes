import https from 'https';
import fs from 'fs';

async function searchImages(query) {
  // DDG image search
  const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iar=images&iax=images&ia=images`;
  
  // Direct image search request
  const searchUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=`;

  https.get(tokenUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const vqdMatch = body.match(/vqd=['"]?([^&"']+)['"]?/);
      if (!vqdMatch) {
        console.log('No vqd found');
        return;
      }
      const vqd = vqdMatch[1];
      console.log('VQD:', vqd);
      const api = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
      https.get(api, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res2) => {
        let jsonStr = '';
        res2.on('data', c => jsonStr += c);
        res2.on('end', () => {
          try {
            const data = JSON.parse(jsonStr);
            console.log('Found', (data.results || []).length, 'images');
            const top5 = (data.results || []).slice(0, 8).map(r => ({ title: r.title, image: r.image }));
            console.log(JSON.stringify(top5, null, 2));
            fs.writeFileSync('scratch_results.json', JSON.stringify(top5, null, 2));
          } catch(e) {
            console.error('Parse error:', e.message);
          }
        });
      });
    });
  });
}

searchImages('Captain America shield throw explosion forest');
