// Пересборка sitemap.xml по фактически существующим маршрутам сайта.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://kabinetdoma.ru';
const TODAY = process.env.LASTMOD || new Date().toISOString().slice(0, 10);

const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf8'));

const pages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/articles', priority: '0.7', changefreq: 'monthly' },
  { url: '/calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/builder', priority: '0.8', changefreq: 'monthly' },
  { url: '/tests', priority: '0.8', changefreq: 'monthly' },
  { url: '/checklist', priority: '0.8', changefreq: 'monthly' },
  { url: '/about', priority: '0.6', changefreq: 'yearly' },
  { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
  ...articles.map((a) => ({ url: `/article/${a.slug}`, priority: '0.8', changefreq: 'monthly' })),
];

const rows = pages
  .map(
    (p) =>
      `  <url>\n    <loc>${SITE}${p.url}</loc>\n    <lastmod>${TODAY}</lastmod>\n` +
      `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap: ${pages.length} адресов`);
