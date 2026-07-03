const http = require('node:http');

const URL = process.env.RENDER_EXTERNAL_URL
  || process.env.RAILWAY_PUBLIC_DOMAIN
  || `http://localhost:${process.env.PORT || 3000}`;

setInterval(() => {
  http.get(URL, res => {
    console.log(`Keepalive ping: ${res.statusCode}`);
  }).on('error', () => {});
}, 5 * 60 * 1000);
