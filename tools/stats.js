// Считает реальный объём статей и сравнивает с текущими значениями в вёрстке и бандле.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf8'));
const bundle = fs.readFileSync(path.join(root, 'assets', 'index.js'), 'utf8');

const strip = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»');

const words = (s) => (s.match(/[A-Za-zА-Яа-яЁё0-9]+/g) || []).length;

const rows = [];
for (const a of articles) {
  const file = path.join(root, 'article', a.slug, 'index.html');
  if (!fs.existsSync(file)) { rows.push({ slug: a.slug, err: 'нет файла' }); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const sections = [...html.matchAll(/<section id="[^"]*"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => m[1]);
  const body = strip(sections.join(' '));
  const w = words(body);
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
  const title = strip(h1).trim();
  const headerNum = Number((html.match(/(\d+)\s*мин чтения/) || [])[1] || 0);
  const dataIdx = bundle.indexOf('id:`' + a.id + '`');
  const dataNum = dataIdx < 0 ? null : Number((bundle.slice(dataIdx, dataIdx + 3000).match(/readTimeMin:(\d+)/) || [])[1] || 0);
  rows.push({
    slug: a.slug,
    words: w,
    estimate: Math.max(1, Math.round(w / 180)),
    headerNum,
    dataNum,
    sections: sections.length,
    titleLen: title.length,
    inIndex: fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('<h3' ) ? null : null,
  });
}

console.table(rows);
const mismatch = rows.filter((r) => r.estimate && (r.estimate !== r.headerNum || r.estimate !== r.dataNum));
console.log('расходится с текущими значениями:', mismatch.length, 'из', rows.length);
