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
// 404 и файлы подтверждения поисковиков (yandex_*.html, google*.html) живут по своим правилам
const SERVICE_PAGES = new Set(['404.html']);
const isServicePage = (f) => SERVICE_PAGES.has(path.basename(f)) || /^(yandex_|google)[0-9a-f]+\.html$/i.test(path.basename(f));
const pages = files.filter((f) => f.endsWith('.html') && !f.includes(`${path.sep}tools${path.sep}`));
const contentPages = pages.filter((f) => !isServicePage(f));
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
for (const jsFile of ['assets/kd-admin-links.js', 'assets/kd-admin-catalog.js', 'assets/kd-catalog-render.js', 'data/product-links.js', 'data/catalog.js']) {
  if (exists(jsFile)) {
    try {
      execFileSync(process.execPath, ['--check', path.join(root, jsFile)], { stdio: 'pipe' });
    } catch (e) {
      fail(`синтаксическая ошибка в ${jsFile}`);
    }
  }
}

// 2.5 Каталог товаров: единый источник правды data/catalog.js
const CATALOG_FILES = ['data/catalog.js', 'assets/kd-admin-catalog.js', 'assets/kd-catalog-render.js'];
for (const rel of CATALOG_FILES) if (!exists(rel)) fail(`нет ${rel}`);

if (exists('data/catalog.js')) {
  let catalog = null;
  try {
    const sandbox = { window: {} };
    require('vm').runInNewContext(fs.readFileSync(path.join(root, 'data/catalog.js'), 'utf8'), sandbox, { timeout: 3000 });
    catalog = sandbox.window.KD_CATALOG;
  } catch (e) {
    fail(`data/catalog.js не выполняется: ${e.message}`);
  }
  if (!catalog) fail('data/catalog.js не определяет window.KD_CATALOG');
  else {
    const products = Array.isArray(catalog.products) ? catalog.products : [];
    const setups = Array.isArray(catalog.setups) ? catalog.setups : [];
    const articles = Array.isArray(catalog.articles) ? catalog.articles : [];
    if (!products.length) fail('каталог пуст: нет товаров');
    if (!Array.isArray(catalog.products)) fail('catalog.products должен быть массивом');
    if (!Array.isArray(catalog.setups)) fail('catalog.setups должен быть массивом');
    if (!Array.isArray(catalog.articles)) fail('catalog.articles должен быть массивом');

    for (const lvl of [1, 2, 3]) {
      const found = (catalog.levels || []).find((l) => l && l.level === lvl);
      if (!found) fail(`нет уровня сетапов ${lvl}`);
      else if (!found.title) fail(`уровень ${lvl} без названия (Старт / Оптимум / Премиум задаются данными)`);
    }

    const byId = new Map();
    let offers = 0;
    for (const p of products) {
      const label = `каталог/${p && p.id ? p.id : '?'}`;
      if (!p || !p.id) { fail(`${label}: пустой id`); continue; }
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) fail(`${label}: id — строчная латиница, цифры и дефисы`);
      if (byId.has(p.id)) fail(`${label}: id повторяется`);
      byId.set(p.id, p);
      if (!p.name) fail(`${label}: нет названия`);
      if (p.image) {
        if (/^data:image\//.test(p.image)) {
          if (!/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(p.image)) {
            fail(`${label}: битая картинка в base64 — загрузите фото заново`);
          } else if (p.image.length > 230000) {
            fail(`${label}: фото слишком тяжёлое для catalog.js (${Math.round(p.image.length / 1024)} КБ base64)`);
          }
        } else if (!/^https:\/\//.test(p.image) && p.image[0] !== '/') {
          fail(`${label}: картинка должна быть https://, путём от корня или загруженным фото`);
        } else if (p.image[0] === '/' && !exists(p.image.slice(1))) {
          fail(`${label}: картинки нет на диске — ${p.image}`);
        }
      }
      if (!['hidden', 'note'].includes(p.price_mode)) fail(`${label}: price_mode только "hidden" или "note"`);
      if ('price' in p || 'priceText' in p || 'price_from' in p || 'priceFrom' in p) {
        fail(`${label}: цена хранится в price_rub — это единственное поле цены`);
      }
      if ('price_rub' in p && !(Number.isInteger(p.price_rub) && p.price_rub > 0)) {
        fail(`${label}: price_rub должен быть целым числом рублей больше нуля`);
      }
      if (p.price_mode === 'hidden' && p.price_note) fail(`${label}: при price_mode "hidden" пометка о цене не выводится`);
      if (p.price_mode === 'note' && !p.price_note) fail(`${label}: price_mode "note" без текста пометки`);
      if (!Array.isArray(p.offers)) { fail(`${label}: offers должен быть массивом`); continue; }
      offers += p.offers.length;
      for (const o of p.offers) {
        if (!['card', 'search'].includes(o.kind)) fail(`${label}: kind оффера "${o.kind}" — только card или search`);
        if (o.kind === 'card' && /\/search|search\?/.test(o.url || '')) {
          fail(`${label}: kind "card", но ссылка поисковая (${o.url})`);
        }
        if (o.url && !/^https:\/\//.test(o.url)) fail(`${label}: ссылка оффера должна начинаться с https://`);
        if (o.erid && !o.advertiser) fail(`${label}: у оффера есть erid, но не указан рекламодатель`);
      }
    }

    const checkRefs = (ids, label) => {
      if (!Array.isArray(ids)) { fail(`${label}: product_ids должен быть массивом`); return; }
      for (const id of ids) {
        const p = byId.get(id);
        if (!p) fail(`${label}: привязка на несуществующий товар ${id}`);
        else if (p.archived) fail(`${label}: товар ${id} в архиве, но остался в привязках`);
      }
    };

    const setupIds = new Set();
    for (const s of setups) {
      const label = `сетап/${s && s.id ? s.id : '?'}`;
      if (!s || !s.id) fail(`${label}: пустой id`);
      else if (setupIds.has(s.id)) fail(`${label}: id повторяется`);
      else setupIds.add(s.id);
      if (!s.title) fail(`${label}: нет названия`);
      if (![1, 2, 3].includes(s.level)) fail(`${label}: level должен быть 1, 2 или 3`);
      checkRefs(s.product_ids, label);
      for (const id of s.product_ids || []) {
        const p = byId.get(id);
        if (p && !p.archived && !p.price_rub) fail(`${label}: у товара ${id} нет price_rub — итог сетапа не сойдётся`);
      }
    }

    const slugs = new Set();
    for (const a of articles) {
      const label = `статья/${a && a.slug ? a.slug : '?'}`;
      if (!a || !a.slug) fail(`${label}: пустой slug`);
      else if (slugs.has(a.slug)) fail(`${label}: slug повторяется`);
      else slugs.add(a.slug);
      if (a && a.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) fail(`${label}: slug не в формате latin-with-dashes`);
      checkRefs(a.product_ids, label);
    }

    note(`каталог: ${products.length} товаров (архив ${products.filter((p) => p.archived).length}), ${offers} офферов, ${setups.length} сетапов, ${articles.length} привязок статей`);
  }
}

// 3. Метаданные каждой страницы
let tagged = 0;
let canonicalOk = 0;
let redirects = 0;
for (const page of contentPages) {
  const rel = path.relative(root, page).split(path.sep).join('/');
  const html = fs.readFileSync(page, 'utf8');
  // страницы-редиректы со старых адресов: проверяем, что цель существует и не петляет
  const refresh = html.match(/http-equiv="refresh"[^>]*url=([^";\s]+)/i);
  if (refresh) {
    redirects++;
    const target = path.resolve(path.dirname(page), refresh[1] + (refresh[1].endsWith('/') ? 'index.html' : ''));
    if (!fs.existsSync(target)) fail(`${rel}: редирект ведёт в никуда (${refresh[1]})`);
    else if (/http-equiv="refresh"/i.test(fs.readFileSync(target, 'utf8'))) fail(`${rel}: редирект на другой редирект (${refresh[1]})`);
    const canon = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1];
    if (!canon) fail(`${rel}: у редиректа нет canonical`);
    continue;
  }
  const tagCount = (html.match(/name="mitgo-verification"/g) || []).length;
  if (tagCount === 1) {
    const headEnd = html.search(/<\/head>/i);
    if (html.indexOf('mitgo-verification') < headEnd) tagged++;
    else fail(`${rel}: тег mitgo-verification вне <head>`);
  } else fail(`${rel}: тег mitgo-verification встречается ${tagCount} раз`);
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1];
  if (canonical && canonical.startsWith(SITE) && !canonical.endsWith('/')) {
    fail(`${rel}: canonical без завершающего слеша — GitHub Pages отдаёт страницу со слешем`);
  } else if (canonical && canonical.startsWith(SITE)) canonicalOk++;
  else fail(`${rel}: canonical не на ${SITE} (${canonical || 'нет'})`);
  if (/name="robots"[^>]*noindex/i.test(html)) fail(`${rel}: стоит noindex`);
  if (/trvlfourme/i.test(html)) fail(`${rel}: осталась ссылка на превью-домен trvlfourme`);
  if (/ozon\.ru/i.test(html)) fail(`${rel}: осталась кнопка Ozon без партнёрской ссылки`);
  if (html.includes('/data/product-links.js') && !html.includes('/data/catalog.js')) fail(`${rel}: не подключён data/catalog.js`);
  if (html.includes('/data/product-links.js') && !html.includes('/assets/kd-catalog-render.js')) fail(`${rel}: не подключён assets/kd-catalog-render.js`);
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
note(`страниц: ${contentPages.length - redirects} (с тегом ${tagged}, canonical ${canonicalOk}) + редиректов: ${redirects}`);
note(`файлов: ${files.length}, объём: ${(files.reduce((s, f) => s + fs.statSync(f).size, 0) / 1048576).toFixed(1)} МБ`);

console.log('--- сводка ---');
notes.forEach((n) => console.log('  ' + n));
if (problems.length) {
  console.log('\n--- проблемы (' + problems.length + ') ---');
  problems.forEach((p) => console.log('  ✗ ' + p));
  process.exit(1);
}
console.log('\nвсё чисто: можно выкладывать');
