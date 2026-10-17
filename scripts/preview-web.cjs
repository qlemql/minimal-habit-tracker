const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      let file = path.resolve(root, `.${pathname}`);
      if (file !== root && !file.startsWith(root + path.sep)) {
        response.writeHead(403);
        response.end();
        return;
      }
      if (!path.extname(file)) file = path.join(root, 'index.html');
      const data = await fs.readFile(file);
      response.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end('Build the app first: npm run build');
    }
  })
  .listen(port, '127.0.0.1', () => console.log(`Ssak preview: http://localhost:${port}`));
