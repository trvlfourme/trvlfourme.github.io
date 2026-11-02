// Пересборка sitemap.xml по фактически существующим маршрутам сайта.
// Адреса совпадают с canonical посимвольно: без слеша только корень, остальное — со слешем.
// lastmod хранится в tools/sitemap-lastmod.json и обновляется только при изменении содержимого
// страницы, поэтому пересборка не переписывает даты у всех адресов разом.
// Запуск: node tools/sitemap.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://kabinetdoma.ru';
const TODAY = new Date().toISOString().slice(0, 10);
const STATE = path.join(__dirname, 'sitemap-lastmod.json');

const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf8'));

const pages = [
  { route: '/', priority: '1.0', changefreq: 'weekly', file: 'index.html' },
  { route: '/articles/', priority: '0.7', changefreq: 'monthly', file: 'articles/index.html' },
  { route: '/calculator/', priority: '0.9', changefreq: 'monthly', file: 'calculator/index.html' },
  { route: '/builder/', priority: '0.8', changefreq: 'monthly', file: 'builder/index.html' },
  { route: '/tests/', priority: '0.8', changefreq: 'monthly', file: 'tests/index.html' },
  { route: '/checklist/', priority: '0.8', changefreq: 'monthly', file: 'checklist/index.html' },
  { route: '/about/', priority: '0.6', changefreq: 'yearly', file: 'about/index.html' },
  { route: '/privacy/', priority: '0.4', changefreq: 'yearly', file: 'privacy/index.html' },
  { route: '/terms/', priority: '0.4', changefreq: 'yearly', file: 'terms/index.html' },
  ...articles.map((a) => ({
    route: `/article/${a.slug}/`,
    priority: '0.8',
    changefreq: 'monthly',
    file: `article/${a.slug}/index.html`,
  })),
];

let state = {};
try {
  state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
} catch (e) {
  state = {};
}

const next = {};
const missing = [];
const rows = pages
  .filter((p) => {
    const full = path.join(root, p.file);
    if (!fs.existsSync(full)) {
      missing.push(p.route);
      return false;
    }
    return true;
  })
  .map((p) => {
    const full = path.join(root, p.file);
    const hash = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex');
    const prev = state[p.route];
    const lastmod = prev && prev.hash === hash ? prev.lastmod : TODAY;
    next[p.route] = { hash, lastmod };
    return (
      `  <url>\n    <loc>${SITE}${p.route}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    );
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml, 'utf8');
fs.writeFileSync(STATE, JSON.stringify(next, null, 2) + '\n', 'utf8');

if (missing.length) {
  console.warn(`нет страницы на диске (в sitemap не попали): ${missing.join(', ')}`);
}
console.log(`sitemap: ${Object.keys(next).length} адресов`);
