// Заголовки безопасности для GitHub Pages (T-065). Хостинг не умеет отдавать HTTP-заголовки,
// поэтому CSP и Referrer-Policy живут meta-тегами в каждой готовой странице.
// Инлайн-скриптов на сайте нет (все вставки — application/ld+json, они не исполняются),
// поэтому script-src 'self' без хешей; 'unsafe-inline' нужен только для style-атрибутов React.
// Запуск: node tools/security-headers.js [--check]
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const check = process.argv.includes('--check');

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
].join('; ');

const REFERRER = 'strict-origin-when-cross-origin';
// frame-ancestors и X-Frame-Options через meta не работают — это ограничение хостинга,
// описано в docs/architecture.md.
const SKIP_DIRS = new Set([
  '_prerender', '_prodcheck', 'node_modules', 'app', 'tools', 'docs', 'content',
  'data', 'images', '.git', '.backup', '.freebuff',
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      // Файлы подтверждения поисковиков — не страницы сайта: их содержимое проверяется
      // по токену, трогать их не нужно.
      if (/^(google|yandex)[_-]?[0-9a-f]+\.html$/i.test(entry.name)) {
        skipped.push(path.relative(root, full));
        continue;
      }
      out.push(full);
    }
  }
  return out;
}

const CSP_TAG = (nl) => `    <meta http-equiv="Content-Security-Policy" content="${CSP}">${nl}`;
const REFERRER_TAG = (nl) => `    <meta name="referrer" content="${REFERRER}">${nl}`;

let changed = 0;
const missing = [];
const skipped = [];
const files = walk(root);

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  const before = html;

  // Идемпотентность: старые теги снимаем, затем ставим заново после charset.
  html = html.replace(/[ \t]*<meta http-equiv="Content-Security-Policy"[^>]*>\r?\n?/gi, '');
  html = html.replace(/[ \t]*<meta name="referrer"[^>]*>\r?\n?/gi, '');

  const anchors = [/[ \t]*<meta charset="[^"]*">\r?\n/i, /[ \t]*<head[^>]*>\r?\n/i];
  const anchor = anchors.map((re) => html.match(re)).find(Boolean);
  if (!anchor) {
    // Файлы подтверждения поисковиков — чужие, чуть ли не однострочные: их не трогаем
    // и ошибкой не считаем, иначе проверка краснеет навсегда.
    if (/<head/i.test(html)) missing.push(path.relative(root, file));
    else skipped.push(path.relative(root, file));
    continue;
  }
  html = html.replace(anchor[0], anchor[0] + CSP_TAG(nl) + REFERRER_TAG(nl));

  if (html !== before) {
    changed++;
    if (!check) fs.writeFileSync(file, html, 'utf8');
  }
}

const rel = (f) => path.relative(root, f).replace(/\\/g, '/');
if (missing.length) {
  console.log('нет <head> или <meta charset>, куда вставить заголовки:');
  for (const f of missing) console.log('  ' + f);
}
console.log(
  check
    ? `проверено страниц: ${files.length}, без заголовков: ${changed}, без <head>: ${missing.length}`
    : `заголовки безопасности: обновлено страниц ${changed} из ${files.length}`
);
if (skipped.length) console.log('не трогаем файлы подтверждений: ' + skipped.join(', '));
if (check && (changed || missing.length)) process.exit(1);
