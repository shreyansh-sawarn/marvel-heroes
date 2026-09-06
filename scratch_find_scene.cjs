const https = require('https');

function searchDDG(query) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Results for:', query);
      const links = body.match(/https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/g) || [];
      console.log('YouTube links:', Array.from(new Set(links)));
      const pinLinks = body.match(/https?:\/\/(www\.)?pinterest\.com\/pin\/[0-9]+/g) || [];
      console.log('Pinterest links:', Array.from(new Set(pinLinks)));
      const imgLinks = body.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png)/gi) || [];
      console.log('Images:', Array.from(new Set(imgLinks)).slice(0, 10));
    });
  });
}

searchDDG('Captain America Shield Throw Supercut (2011-2016)');
