// Приводит счётчики статьи в порядок:
//  - убирает выдуманные просмотры из карточек и шапки статьи;
//  - ставит время чтения по фактическому объёму текста.
// Идемпотентен: на повторном запуске просто не находит что менять и сообщает об этом.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf8'));
const WPM = 180;

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

const wordCount = (s) => (s.match(/[A-Za-zА-Яа-яЁё0-9]+/g) || []).length;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Честное время чтения считаем по фактическому тексту разделов статьи.
const stats = articles.map((a) => {
  const file = path.join(root, 'article', a.slug, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const sections = [...html.matchAll(/<section id="[^"]*"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => m[1]);
  const words = wordCount(strip(sections.join(' ')));
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
  return {
    ...a,
    file,
    words,
    minutes: Math.max(1, Math.round(words / WPM)),
    title: strip(h1).replace(/\s+/g, ' ').trim(),
  };
});



// ---------- бандл ----------
const bundleFile = path.join(root, 'assets', 'index.js');
let bundle = fs.readFileSync(bundleFile, 'utf8');
let bundleChanged = false;

// Вырезает связку «разделитель + счётчик просмотров» из JSX-дерева.
function cutViews(code) {
  const needle = 'e.views';
  const positions = [];
  let at = -1;
  while ((at = code.indexOf(needle, at + 1)) !== -1) positions.push(at);
  let out = code;
  let removed = 0;
  for (const pos of positions.reverse()) {
    const viewStart = out.lastIndexOf('(0,A.jsxDEV)(`span`,{className:`flex items-center gap-1`,children:[', pos);
    const endAt = out.indexOf('},void 0)', pos);
    const sepStart = out.lastIndexOf('(0,A.jsxDEV)(`span`,{', viewStart - 1);
    if (viewStart < 0 || endAt < 0 || sepStart < 0) continue;
    if (out.slice(sepStart, viewStart).indexOf('aria-hidden') === -1) continue;
    out = out.slice(0, sepStart) + out.slice(endAt + 9);
    removed++;
  }
  return { out, removed };
}

const cut = cutViews(bundle);
if (cut.removed) {
  bundle = cut.out;
  bundleChanged = true;
}
console.log('просмотры в разметке бандла удалены:', cut.removed);

// Честное время чтения записываем в данные статей.
let updatedData = 0;
for (const s of stats) {
  const idAt = bundle.indexOf('id:`' + s.id + '`');
  if (idAt < 0) { console.log('не найдена статья в данных:', s.id); continue; }
  const tail = bundle.slice(idAt, idAt + 4000);
  const m = tail.match(/readTimeMin:(\d+)/);
  if (!m) { console.log('нет readTimeMin у', s.id); continue; }
  if (Number(m[1]) === s.minutes) continue;
  const from = idAt + m.index;
  bundle = bundle.slice(0, from) + 'readTimeMin:' + s.minutes + bundle.slice(from + m[0].length);
  updatedData++;
}
console.log('время чтения в данных обновлено:', updatedData, 'из', stats.length);

if (bundleChanged || updatedData) {
  fs.writeFileSync(bundleFile, bundle, 'utf8');
  console.log('бандл записан');
} else {
  console.log('бандл без изменений');
}

// ---------- пререндеренный HTML ----------
const pages = [
  'index.html',
  'calculator/index.html',
  'builder/index.html',
  'tests/index.html',
  'checklist/index.html',
  'about/index.html',
  'privacy/index.html',
  'terms/index.html',
  ...stats.map((s) => path.join('article', s.slug, 'index.html')),
];

const viewsCard =
  /<span aria-hidden="true" class="text-stone-300">·<\/span><span class="flex items-center gap-1">(?:(?!<\/span>)[\s\S])*?lucide-eye(?:(?!<\/span>)[\s\S])*?<\/span>/g;
const viewsHead =
  /<span aria-hidden="true">·<\/span><span class="flex items-center gap-1">(?:(?!<\/span>)[\s\S])*?lucide-eye(?:(?!<\/span>)[\s\S])*?<\/span>/g;

let viewsRemoved = 0;
let headerFixed = 0;
let cardsFixed = 0;
const touched = [];

for (const rel of pages) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  // 1. вырезаем счётчик просмотров
  html = html.replace(viewsCard, () => { viewsRemoved++; return ''; });
  html = html.replace(viewsHead, () => { viewsRemoved++; return ''; });

  // 2. время чтения в шапке самой статьи
  const own = stats.find((s) => path.join('article', s.slug, 'index.html') === rel);
  if (own) {
    html = html.replace(/(\d+)(\s*мин чтения)/, (m, num, tail) => {
      if (Number(num) === own.minutes) return m;
      headerFixed++;
      return own.minutes + tail;
    });
  }

  // 3. время чтения в карточках: число стоит перед заголовком статьи
  for (const s of stats) {
    const heading = '<h3';
    const titleHtml = escHtml(s.title);
    let from = 0;
    for (;;) {
      const h = html.indexOf(heading, from);
      if (h < 0) break;
      const close = html.indexOf('</h3>', h);
      const inner = close < 0 ? '' : html.slice(html.indexOf('>', h) + 1, close).trim();
      if (inner !== titleHtml && inner !== s.title) { from = h + 3; continue; }
      const windowStart = Math.max(0, h - 500);
      const before3 = html.slice(windowStart, h);
      const m = [...before3.matchAll(/<\/svg>(\d+)(\s*мин<\/span>)/g)].pop();
      if (m) {
        const start = windowStart + m.index + m[0].indexOf('>', 0) + 1;
        const numStart = start;
        const numEnd = numStart + m[1].length;
        if (html.slice(numStart, numEnd) !== String(s.minutes)) {
          html = html.slice(0, numStart) + s.minutes + html.slice(numEnd);
          cardsFixed++;
        }
      }
      from = h + 3;
    }
  }

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    touched.push(rel);
  }
}

console.log('счётчиков просмотров вырезано:', viewsRemoved);
console.log('время в шапках статей обновлено:', headerFixed);
console.log('время в карточках обновлено:', cardsFixed);
console.log('изменено страниц:', touched.length);
