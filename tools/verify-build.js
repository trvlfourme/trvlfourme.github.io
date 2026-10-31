// Проверка готового сайта перед выкладкой: пути, метаданные, домен, обязательные файлы.
// Запуск: node tools/verify-build.js [папка]   (по умолчанию — корень проекта)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const SITE = 'https://kabinetdoma.ru';
const problems = [];
const notes = [];

const fail = (msg) => problems.push(msg);
const note = (msg) => notes.push(msg);
const exists = (rel) => fs.existsSync(path.join(root, rel));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'tools' || e.name === '_prodcheck' || e.name === '_prerender') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// 1. Обязательные для GitHub Pages файлы
if (!exists('CNAME')) fail('нет CNAME — домен отвалится');
else if (fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim() !== 'kabinetdoma.ru') fail('CNAME не указывает на kabinetdoma.ru');
if (!exists('.nojekyll')) fail('нет .nojekyll — GitHub соберёт сайт через Jekyll и потеряет папки с подчёркиванием');
if (!exists('404.html')) fail('нет 404.html');
if (!exists('robots.txt')) fail('нет robots.txt');
else if (/Disallow:\s*\/\s*$/m.test(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8'))) fail('robots.txt закрывает сайт от индексации (Disallow: /)');
if (!exists('sitemap.xml')) fail('нет sitemap.xml');
if (!exists('data/product-links.js')) fail('нет data/product-links.js');
if (!exists('assets/kd-admin-links.js')) fail('нет assets/kd-admin-links.js');

// 2. Карта страниц
const files = walk(root);
// служебные страницы: подтверждение Яндекса и страница ошибки живут по своим правилам
const SERVICE_PAGES = new Set(['404.html', 'yandex_f90ccbe3e80e4f97.html']);
const pages = files.filter((f) => f.endsWith('.html') && !f.includes(`${path.sep}tools${path.sep}`));
const contentPages = pages.filter((f) => !SERVICE_PAGES.has(path.basename(f)));
const bundle = files.find((f) => f.endsWith(path.join('assets', 'index.js')));
if (!bundle) fail('нет assets/index.js');
else {
  execFileSync(process.execPath, ['--check', bundle], { stdio: 'pipe' });
  const size = fs.statSync(bundle).size;
  if (size < 200000) fail(`бандл подозрительно мал: ${size} байт (живой бандл ~1,4 МБ)`);
  const js = fs.readFileSync(bundle, 'utf8');
  if (!js.includes('KD_PRODUCT_LINKS')) fail('бандл не знает про слой ссылок KD_PRODUCT_LINKS');
  if ((js.match(/function KdLnk\(/g) || []).length !== 1) fail('в бандле сломан резолвер ссылок KdLnk');
}
for (const jsFile of ['assets/kd-admin-links.js', 'data/product-links.js', 'data/product-catalog.js']) {
  if (exists(jsFile)) {
    try {
      execFileSync(process.execPath, ['--check', path.join(root, jsFile)], { stdio: 'pipe' });
    } catch (e) {
      fail(`синтаксическая ошибка в ${jsFile}`);
    }
  }
}

// 3. Метаданные каждой страницы
let tagged = 0;
let canonicalOk = 0;
for (const page of contentPages) {
  const rel = path.relative(root, page).split(path.sep).join('/');
  const html = fs.readFileSync(page, 'utf8');
  const tagCount = (html.match(/name="mitgo-verification"/g) || []).length;
  if (tagCount === 1) {
    const headEnd = html.search(/<\/head>/i);
    if (html.indexOf('mitgo-verification') < headEnd) tagged++;
    else fail(`${rel}: тег mitgo-verification вне <head>`);
  } else fail(`${rel}: тег mitgo-verification встречается ${tagCount} раз`);
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1];
  if (canonical && canonical.startsWith(SITE)) canonicalOk++;
  else fail(`${rel}: canonical не на ${SITE} (${canonical || 'нет'})`);
  if (/name="robots"[^>]*noindex/i.test(html)) fail(`${rel}: стоит noindex`);
  if (/trvlfourme/i.test(html)) fail(`${rel}: осталась ссылка на превью-домен trvlfourme`);
  if (/ozon\.ru/i.test(html)) fail(`${rel}: осталась кнопка Ozon без партнёрской ссылки`);
}

// 4. Локальные пути в разметке существуют
const missing = new Map();
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"?#]+)"/g)) {
    const url = m[1];
    if (url.startsWith('//')) continue;
    let target = url.slice(1);
    if (target === '' || target.endsWith('/')) target += 'index.html';
    const candidates = [target, `${target}/index.html`, `${target}.html`];
    if (!candidates.some((c) => fs.existsSync(path.join(root, c)))) {
      missing.set(url, (missing.get(url) || 0) + 1);
    }
  }
}
if (missing.size) fail(`битые локальные пути: ${[...missing.keys()].slice(0, 8).join(', ')}`);

// 5. Sitemap
if (exists('sitemap.xml')) {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const u of urls) {
    if (!u.startsWith(SITE)) {
      fail(`sitemap: чужой домен ${u}`);
      continue;
    }
    const rel = u.slice(SITE.length).replace(/^\//, '');
    const target = rel === '' ? 'index.html' : rel.endsWith('/') ? `${rel}index.html` : rel;
    if (!fs.existsSync(path.join(root, target))) fail(`sitemap: страницы нет на диске — ${u}`);
  }
  note(`sitemap: ${urls.length} адресов`);
}

// 6. Итог
note(`страниц: ${contentPages.length} (с тегом ${tagged}, canonical ${canonicalOk})`);
note(`файлов: ${files.length}, объём: ${(files.reduce((s, f) => s + fs.statSync(f).size, 0) / 1048576).toFixed(1)} МБ`);

console.log('--- сводка ---');
notes.forEach((n) => console.log('  ' + n));
if (problems.length) {
  console.log('\n--- проблемы (' + problems.length + ') ---');
  problems.forEach((p) => console.log('  ✗ ' + p));
  process.exit(1);
}
console.log('\nвсё чисто: можно выкладывать');
