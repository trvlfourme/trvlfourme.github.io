// Пересобирает meta description из реального текста страницы: берём абзацы после h1,
// пока не начались подзаголовки разделов. Прежняя версия цепляла текст навигации.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const strip = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/\s+/g, ' ')
    .trim();

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildDescription(html) {
  const h1 = html.search(/<h1[^>]*>/);
  if (h1 < 0) return '';
  const region = html.slice(h1);
  const stop = region.search(/<footer/i);
  const body = stop > 0 ? region.slice(0, stop) : region.slice(0, 6000);
  const paragraphs = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => strip(m[1]))
    .filter((t) => t.length > 40 && !/мин чтения|просмотр|Назад ко всем|^©/.test(t));
  const text = paragraphs.slice(0, 3).join(' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text.length <= 300) return text;
  return text.slice(0, 300).replace(/\s+\S*$/, '') + '…';
}

const files = [
  'index.html',
  'calculator/index.html',
  'builder/index.html',
  'tests/index.html',
  'checklist/index.html',
  'about/index.html',
  'privacy/index.html',
  'terms/index.html',
  ...fs
    .readdirSync(path.join(root, 'article'))
    .map((slug) => path.join('article', slug, 'index.html'))
    .filter((rel) => fs.existsSync(path.join(root, rel))),
];

let changed = 0;
const report = [];
for (const rel of files) {
  const file = path.join(root, rel);
  const html = fs.readFileSync(file, 'utf8');
  const desc = buildDescription(html);
  if (!desc) { report.push([rel, 'НЕ НАЙДЕН ТЕКСТ']); continue; }
  const attr = escapeAttr(desc);
  const before = html;
  const out = html
    .replace(/<meta name="description" content="[^"]*"/g, `<meta name="description" content="${attr}"`)
    .replace(/<meta property="og:description" content="[^"]*"/g, `<meta property="og:description" content="${attr}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/g, `<meta name="twitter:description" content="${attr}"`);
  if (out !== before) { fs.writeFileSync(file, out, 'utf8'); changed++; }
  report.push([rel, desc.slice(0, 90)]);
}

for (const [rel, d] of report) console.log(`${rel}\n    ${d}`);
console.log('\nобновлено страниц:', changed, 'из', files.length);
