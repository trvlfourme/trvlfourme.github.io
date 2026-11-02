// Слой редактируемых ссылок на товары (патч бандла).
// 1) Учит бандл брать ссылки из /data/product-links.js и localStorage.kd_product_links.
// 2) Прячет кнопку маркетплейса, если ссылки нет (Ozon — только по введённой ссылке).
// 3) Каталог товаров не генерируется поверх данных: источник правды — data/catalog.js
//    (правится в админке). Здесь только первичный перенос, если файла ещё нет.
// Идемпотентно: повторный запуск ничего не дублирует и не затирает каталог.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const bundlePath = path.join(root, 'assets', 'index.js');
const dataDir = path.join(root, 'data');

const NEW_RESOLVER = [
  'function KdLnk(e){let t={};try{let n=typeof window<`u`&&window&&window.KD_PRODUCT_LINKS;',
  'if(n&&n[e.id]&&typeof n[e.id]==`object`)t={...n[e.id]}}catch{}try{',
  'let r=JSON.parse(localStorage.getItem(`kd_product_links`)||`{}`);',
  'if(r&&r[e.id]&&typeof r[e.id]==`object`)t={...t,...r[e.id]}}catch{}return t}',
  'function St(e,t,n=xt()){let o=KdLnk(e),h=k=>Object.prototype.hasOwnProperty.call(o,k);',
  'if(t===`ozon`){if(!o.ozon)return null;let u=o.ozon;',
  'return n.ozonReferralCode&&n.ozonReferralCode!==`OZON_KD2026`&&n.ozonReferralCode!==`OZON_H4W2026`&&',
  '!n.ozonReferralCode.startsWith(`OZON_`)?`${u}${u.includes(`?`)?`&`:`?`}ref=${encodeURIComponent(n.ozonReferralCode)}`:u}',
  'if(t===`wb`){if(h(`wb`)&&!o.wb)return null;',
  'let u=(o.wb||e.wbUrl||``).replace(`/catalog/0/search.aspx?search=`,`/search?query=`);',
  'if(!u)return null;',
  'return n.wbReferralCode&&n.wbReferralCode!==`WBR_KD`&&!n.wbReferralCode.startsWith(`WBR_`)?',
  '`${u}${u.includes(`?`)?`&`:`?`}ref=${encodeURIComponent(n.wbReferralCode)}`:u}',
  'if(t===`gdeslon`&&e.gdeSlonUrl)return e.gdeSlonUrl;',
  'if(h(`yandex`)&&!o.yandex)return null;',
  'let r=o.yandex||e.yandexMarketUrl||e.admitadUrl||`https://market.yandex.ru/search?text=${encodeURIComponent(e.name)}`;',
  'if(r.includes(`clid=`))return r;',
  'return n.yandexMarketAffiliateId&&n.yandexMarketAffiliateId!==`ym_kabinetdoma`&&/^\\d+$/.test(n.yandexMarketAffiliateId)?',
  '`${r}${r.includes(`?`)?`&`:`?`}clid=${encodeURIComponent(n.yandexMarketAffiliateId)}&utm_source=kabinetdoma`:r}',
].join('');

function patchResolver(js) {
  if (js.includes('function KdLnk(')) return { js, changed: false };
  const start = js.indexOf('function St(e,t,n=xt())');
  const end = js.indexOf('function Ct(', start);
  if (start < 0 || end < 0) throw new Error('не нашёл резолвер St в бандле');
  return { js: js.slice(0, start) + NEW_RESOLVER + js.slice(end), changed: true };
}

const ANCHOR = (v, kind) => '(0,A.jsxDEV)(`a`,{href:St(' + v + ',`' + kind + '`)';
const GUARDED = (v, kind) => 'St(' + v + ',`' + kind + '`)&&' + ANCHOR(v, kind);

// Кнопку маркетплейса рисуем только при живой ссылке.
// Идемпотентно: уже защищённые кнопки не оборачиваются повторно.
function patchButtons(js) {
  let out = js;
  const SENT = '';
  for (const v of ['t', 'e']) {
    for (const kind of ['yandex', 'ozon', 'wb']) {
      const guard = 'St(' + v + ',`' + kind + '`)&&';
      while (out.includes(guard + guard)) out = out.split(guard + guard).join(guard);
      out = out.split(guard + ANCHOR(v, kind)).join(SENT);
      out = out.split(ANCHOR(v, kind)).join(GUARDED(v, kind));
      out = out.split(SENT).join(guard + ANCHOR(v, kind));
    }
  }
  // старые условия вида t.wbUrl&& перед уже защищённой кнопкой убираем целиком
  for (const v of ['t', 'e']) {
    for (const kind of ['ozon', 'wb']) {
      out = out.split(v + '.' + kind + 'Url&&' + GUARDED(v, kind)).join(GUARDED(v, kind));
    }
  }
  const count = (out.match(/St\([te],`(?:yandex|ozon|wb)`\)&&\(0,A\.jsxDEV\)\(`a`/g) || []).length;
  return { js: out, count };
}

// Партнёрские переходы помечаем rel="sponsored": это требование к оплаченным ссылкам.
function patchSponsor(js) {
  const re = /(href:St\((?:t|e),`(?:yandex|ozon|wb)`\),target:`_blank`,rel:)`noopener noreferrer`/g;
  const hits = (js.match(re) || []).length;
  return { js: js.replace(re, '$1`noopener noreferrer sponsored`'), hits };
}

const MARKET_HOSTS = /href="https?:\/\/(?:market\.yandex\.ru|www\.ozon\.ru|ozon\.ru|www\.wildberries\.ru)/;

function addSponsored(html) {
  return html.replace(/<a\b[^>]*>/g, (tag) => {
    if (!MARKET_HOSTS.test(tag) || /\bsponsored\b/.test(tag)) return tag;
    if (/rel="/.test(tag)) return tag.replace(/rel="([^"]*)"/, 'rel="$1 sponsored"');
    return tag.replace(/^<a\b/, '<a rel="sponsored"');
  });
}

// Пометка рекламы: у отдельных товаров партнёрская ссылка со своим erid и рекламодателем.
const ERID_OVERRIDES = {
  'metta-samurai-s3': {
    erid: '5jtCeReNx12oak2sys499we',
    advertiser: 'ООО «Яндекс Маркет», ИНН 9704254424',
  },
};

// Подпись «Реклама. <рекламодатель>, erid: <erid>» берётся из карточки товара в бандле.
function patchErid(js) {
  let out = js;
  let changed = 0;
  for (const [id, v] of Object.entries(ERID_OVERRIDES)) {
    const at = out.indexOf('{id:`' + id + '`');
    if (at < 0) continue;
    const adv = out.indexOf('ordAdvertiser:`', at);
    if (adv < 0 || adv - at > 4000) continue;
    const end = out.indexOf('}`', adv);
    if (end < 0) continue;
    const block = out.slice(at, end);
    const m = block.match(/erid:`([^`]*)`,ordAdvertiser:`([^`]*)`/);
    if (!m) continue;
    if (m[1] === v.erid && m[2] === v.advertiser) continue;
    out = out.slice(0, at) + block.replace(m[0], 'erid:`' + v.erid + '`,ordAdvertiser:`' + v.advertiser + '`') + out.slice(end);
    changed++;
  }
  return { js: out, changed };
}

// Каталог товаров для панели редактирования ссылок.
function buildCatalog(js) {
  const re = /id:`([a-z0-9-]+)`,name:`([^`]+)`,brand:`([^`]*)`/g;
  const hits = [...js.matchAll(re)];
  const rows = [];
  hits.forEach((m, i) => {
    if (rows.some((r) => r.id === m[1])) return;
    const block = js.slice(m.index, hits[i + 1] ? hits[i + 1].index : m.index + 3000);
    const url = (key) => {
      const found = block.match(new RegExp(key + ':\`([^\`]+)\`'));
      return found ? found[1] : '';
    };
    rows.push({
      id: m[1],
      name: m[2],
      brand: m[3],
      yandex: url('yandexMarketUrl') || url('admitadUrl'),
      ozon: url('ozonUrl'),
      wb: url('wbUrl'),
    });
  });
  return rows;
}

// Каталог из бандла не перезаписывает data/catalog.js: файл ведётся в админке
// (товары, офферы, сетапы, привязки статей) и проверяется tools/verify-build.js.
function writeCatalog(rows) {
  fs.mkdirSync(dataDir, { recursive: true });
  const target = path.join(dataDir, 'catalog.js');
  if (fs.existsSync(target)) return false;
  const catalog = {
    version: 1,
    updated: new Date().toISOString().slice(0, 10),
    levels: [
      { level: 1, title: 'Старт', note: 'Минимальный рабочий набор без переплаты' },
      { level: 2, title: 'Оптимум', note: 'Баланс цены и эргономики на каждый день' },
      { level: 3, title: 'Премиум', note: 'Максимальный ресурс и комфорт' },
    ],
    products: rows.map((r) => ({
      id: r.id,
      name: r.name,
      brand: r.brand || '',
      category: '',
      summary: '',
      image: '',
      price_mode: 'hidden',
      price_note: '',
      archived: false,
      offers: ['yandex', 'ozon', 'wb']
        .filter((store) => r[store])
        .map((store) => ({ store, kind: 'search', url: r[store], label: '', erid: '', advertiser: '' })),
    })),
    setups: [],
    articles: [],
  };
  const body = [
    '// Каталог товаров kabinetdoma.ru — единый источник правды.',
    '// window.KD_CATALOG = { version, updated, levels, products, setups, articles }.',
    '// Цена на сайте не печатается: price_mode "hidden" | "note".',
    '// Удаление товара — archived: true, чтобы не ломать привязки.',
    'window.KD_CATALOG = ' + JSON.stringify(catalog, null, 2) + ';',
    '',
  ].join(String.fromCharCode(10));
  fs.writeFileSync(target, body, 'utf8');
  return true;
}

function ensureLinksFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  const target = path.join(dataDir, 'product-links.js');
  if (fs.existsSync(target)) return false;
  fs.writeFileSync(
    target,
    [
      '// Ссылки на товары: правится в админке (Ctrl+Shift+A -> кнопка «Ссылки»).',
      '// id товара -> { yandex, ozon, wb }. Пустая строка = кнопку не показывать,',
      '// отсутствие поля = встроенная ссылка сайта.',
      'window.KD_PRODUCT_LINKS = {};',
      '',
    ].join('\n'),
    'utf8'
  );
  return true;
}

const CATALOG_TAG = '<script src="/data/catalog.js"></script>';
const LINKS_TAG = '<script src="/data/product-links.js"></script>';
const RENDER_TAG = '<script defer src="/assets/kd-catalog-render.js"></script>';
const ADMIN_CATALOG_TAG = '<script defer src="/assets/kd-admin-catalog.js"></script>';
const ADMIN_TAG = '<script defer src="/assets/kd-admin-links.js"></script>';

function htmlFiles() {
  const out = [path.join(root, 'index.html')];
  for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name.startsWith('.') || dir.name.startsWith('_')) continue;
    if (['assets', 'images', 'tools', 'data', 'node_modules'].includes(dir.name)) continue;
    const idx = path.join(root, dir.name, 'index.html');
    if (fs.existsSync(idx)) out.push(idx);
    const nested = path.join(root, dir.name);
    for (const sub of fs.readdirSync(nested, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const f = path.join(nested, sub.name, 'index.html');
      if (fs.existsSync(f)) out.push(f);
    }
  }
  // страницы-редиректы со старых адресов остаются без тегов скриптов
  return out.filter((f) => !/http-equiv="refresh"/i.test(fs.readFileSync(f, 'utf8')));
}

function injectTags(html) {
  let out = html;
  if (!out.includes(LINKS_TAG)) {
    if (out.includes('<script type="module"')) out = out.replace('<script type="module"', LINKS_TAG + '<script type="module"');
    else out = out.replace('</head>', LINKS_TAG + String.fromCharCode(10) + '</head>');
  }
  if (!out.includes(CATALOG_TAG)) out = out.replace(LINKS_TAG, CATALOG_TAG + LINKS_TAG);
  const block = (out.includes(RENDER_TAG) ? '' : RENDER_TAG) + (out.includes(ADMIN_CATALOG_TAG) ? '' : ADMIN_CATALOG_TAG);
  if (block) {
    if (out.includes(ADMIN_TAG)) out = out.replace(ADMIN_TAG, block + ADMIN_TAG);
    else out = out.replace('</body>', block + String.fromCharCode(10) + '</body>');
  }
  return out;
}

// Ozon без партнёрской ссылки не показываем: убираем готовые кнопки из пререндера.
function stripOzonAnchors(html) {
  let out = html;
  let removed = 0;
  let i = out.indexOf('href="https://www.ozon.ru');
  while (i > -1) {
    const start = out.lastIndexOf('<a ', i);
    const end = out.indexOf('</a>', i);
    if (start < 0 || end < 0) break;
    out = out.slice(0, start) + out.slice(end + 4);
    removed++;
    i = out.indexOf('href="https://www.ozon.ru', start);
  }
  return { html: out, removed };
}

function main() {
  let js = fs.readFileSync(bundlePath, 'utf8');
  const r = patchResolver(js);
  js = r.js;
  const b = patchButtons(js);
  js = b.js;
  const e = patchErid(js);
  js = e.js;
  const sp = patchSponsor(js);
  js = sp.js;
  fs.writeFileSync(bundlePath, js, 'utf8');
  console.log('резолвер:', r.changed ? 'пропатчен' : 'уже был', '| кнопки с проверкой ссылки:', b.count);
  console.log('пометок рекламы обновлено:', e.changed, '| sponsored у кнопок:', sp.hits);

  const rows = buildCatalog(js);
  console.log('каталог товаров:', rows.length);
  console.log('каталог создан с нуля:', writeCatalog(rows), '(существующий data/catalog.js не перезаписывается)');
  console.log('product-links.js создан:', ensureLinksFile());

  let pages = 0;
  let ozon = 0;
  for (const file of htmlFiles()) {
    const before = fs.readFileSync(file, 'utf8');
    const s = stripOzonAnchors(before);
    const after = injectTags(addSponsored(s.html));
    ozon += s.removed;
    if (after !== before) {
      fs.writeFileSync(file, after, 'utf8');
      pages++;
    }
  }
  console.log('страниц обновлено:', pages, '| кнопок Ozon убрано:', ozon);
}

if (require.main === module) main();
