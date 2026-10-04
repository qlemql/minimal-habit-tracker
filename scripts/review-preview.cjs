const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const roots = {
  app: path.resolve(__dirname, '../dist'),
  guide: path.resolve(__dirname, '../docs/review-preview'),
  shots: path.resolve(__dirname, '../artifacts/review'),
  store: path.resolve(__dirname, '../artifacts/store-drafts'),
  policies: path.resolve(__dirname, '../artifacts/legal-site'),
};
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
http
  .createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const group =
        pathname.startsWith('/policies/') || pathname === '/policies' ? 'policies' :
        pathname.startsWith('/guide/') || pathname === '/guide'
          ? 'guide'
          : pathname.startsWith('/shots/')
            ? 'shots'
            : pathname.startsWith('/store/') || pathname === '/store'
              ? 'store'
            : 'app';
      const relative = group === 'app' ? pathname : pathname.replace(/^\/(guide|shots|store|policies)\/?/, '/');
      const root = roots[group];
      let file = path.resolve(root, `.${relative}`);
      if (file !== root && !file.startsWith(root + path.sep)) {
        response.writeHead(403);
        response.end();
        return;
      }
      if (!path.extname(file)) file = path.join(group === 'app' ? root : file, 'index.html');
      const data = await fs.readFile(file);
      response.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end('Preview asset not found. See docs/mobile-review.md.');
    }
  })
  .listen(4174, '127.0.0.1', () => console.log('Ssak walkthrough: http://localhost:4174/guide/'));
