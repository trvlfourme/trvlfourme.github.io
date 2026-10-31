// Локальный статический сервер с SPA-фолбэком и приёмом сохранённого DOM.
// POST /_save?path=article/<slug>/index.html — записывает тело в _prerender/<path>.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stage = path.join(root, '_prerender');
const port = Number(process.argv[2] || 8080);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

function send(res, file) {
  const buf = fs.readFileSync(file);
  res.writeHead(200, {
    'Content-Type': types[path.extname(file)] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(buf);
}

http
  .createServer((req, res) => {
    const [rawPath, rawQuery = ''] = (req.url || '/').split('?');
    const query = new URLSearchParams(rawQuery);

    if (req.method === 'POST' && rawPath === '/_save') {
      const rel = query.get('path') || '';
      const target = path.resolve(stage, rel);
      if (!rel || !target.startsWith(stage)) {
        res.writeHead(400);
        return res.end('bad path');
      }
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, Buffer.concat(chunks));
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' });
        res.end('saved ' + rel + ' (' + Buffer.concat(chunks).length + ' bytes)');
      });
      return;
    }

    let url;
    try {
      url = decodeURIComponent(rawPath);
    } catch {
      res.writeHead(400);
      return res.end('bad request');
    }
    const file = path.join(root, url.endsWith('/') ? path.join(url, 'index.html') : url);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, file);
    const nested = path.join(file, 'index.html');
    if (fs.existsSync(nested)) return send(res, nested);
    return send(res, path.join(root, 'index.spa.html'));
  })
  .listen(port, '127.0.0.1', () => console.log('listening on http://127.0.0.1:' + port));
