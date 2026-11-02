// Пререндер SPA в статический HTML по фактической схеме приложения:
// табы — по pathname, статьи — по параметру ?article=<id> (в приложении поиск идёт по id).
// На выходе: <route>/index.html с уникальными метаданными и полным текстом в разметке.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.PORT || 8080);
const BASE = `http://127.0.0.1:${PORT}`;
const SITE = 'https://kabinetdoma.ru';
const OG_IMAGE = `${SITE}/og-image.png`;
const stage = path.join(root, '_prerender');
const profile = path.join(os.tmpdir(), 'kd-prerender-profile');

const TABS = ['/', '/calculator', '/builder', '/tests', '/checklist', '/about', '/privacy', '/terms'];
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf8'));

const routes = [
  ...TABS.map((r) => ({ route: r, url: r })),
  ...articles.map((a) => ({ route: `/article/${a.slug}`, url: `/?article=${a.id}`, article: a })),
];

function dumpOnce(url) {
  return execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--virtual-time-budget=12000',
      `--user-data-dir=${profile}`,
      '--dump-dom',
      BASE + url,
    ],
    { maxBuffer: 128 * 1024 * 1024, encoding: 'utf8', timeout: 90000 }
  );
}

function dump(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const html = dumpOnce(url);
      if (html && html.length > 2000) return html;
      lastError = new Error('пустой ответ: ' + (html ? html.length : 0) + ' символов');
    } catch (e) {
      lastError = e;
    }
    if (attempt < 3) console.warn(`  повтор ${attempt} для ${url}`);
  }
  throw lastError;
}

const stripTags = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();

const firstMatch = (html, re) => {
  const m = html.match(re);
  return m ? m[1] : '';
};

function pickTitle(html, route) {
  const h1 = stripTags(firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  if (h1) return h1;
  return route === '/' ? 'Кабинет Дома — эргономика домашнего офиса' : 'Кабинет Дома';
}

function pickDescription(html) {
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((t) => t.length >= 70 && !t.startsWith('©') && !t.includes('Все права'));
  const text = paragraphs[0] || '';
  return text.length > 300 ? text.slice(0, 300).replace(/\s+\S*$/, '') + '…' : text;
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Приложение не умеет /article/<slug>: до старта бандла подменяем адрес на ?article=<id>,
// после монтирования возвращаем чистый URL. Краулер при этом видит готовый HTML.
const shim = (article) => `<script>
    (function () {
      var m = /^\\/article\\/[a-z0-9-]+\\/?$/.exec(location.pathname);
      if (!m) return;
      var pretty = location.pathname + location.hash;
      try { history.replaceState(null, '', '/?article=${article.id}'); } catch (e) {}
      function restore() {
        try { history.replaceState(null, '', pretty); } catch (e) {}
      }
      if (document.readyState === 'complete') setTimeout(restore, 80);
      else window.addEventListener('load', function () { setTimeout(restore, 80); });
    })();
    </script>`;

function rewriteHead(html, route, title, description) {
  // канонический адрес со слешем в конце — как у уже выложенных страниц
  const canonical = SITE + (route !== '/' && !/\.[a-z0-9]+$/i.test(route) ? route + '/' : route);
  let out = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<link rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<meta name="description"[^>]*>\s*/gi, '')
    .replace(/<meta property="og:(title|description|url|image|image:width|image:height)"[^>]*>\s*/gi, '')
    .replace(/<meta name="twitter:(title|description|image)"[^>]*>\s*/gi, '');

  const head = [
    `<title>${escapeAttr(title)}</title>`,
    description && `<meta name="description" content="${escapeAttr(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    description && `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    description && `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ]
    .filter(Boolean)
    .join('\n    ');

  return out.replace(/<\/head>/i, `    ${head}\n  </head>`);
}

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const ONLY = (process.env.ONLY || '').trim();
const onlyList = ONLY ? ONLY.split(",").map((s) => s.trim()).filter(Boolean) : [];
const selected = onlyList.length ? routes.filter((r) => onlyList.some((o) => r.route.includes(o))) : routes;
if (ONLY) console.log();
const report = [];
for (const { route, url, article } of selected) {
  let html;
  try {
    html = dump(url);
  } catch (e) {
    report.push({ route, ok: false, error: String(e.message || e).slice(0, 160) });
    continue;
  }
  const title = pickTitle(html, route);
  const description = pickDescription(html);
  let out = html.replace(/(href|src)="\.\//g, '$1="/');
  out = rewriteHead(out, route, title, description);
  if (article) out = out.replace(/<\/head>/i, `    ${shim(article)}\n  </head>`);

  const text = stripTags(out).length;
  const target =
    route === '/'
      ? path.join(stage, 'index.html')
      : path.join(stage, route.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, out, 'utf8');
  report.push({ route, ok: true, title, text, kb: Math.round(out.length / 1024) });
  console.log(`${route}  ${Math.round(out.length / 1024)}KB  text=${text}  "${title.slice(0, 70)}"`);
}

console.log('\n--- отчёт ---');
for (const r of report.filter((r) => !r.ok)) console.log(`FAIL ${r.route}: ${r.error}`);
for (const r of report.filter((r) => r.ok && r.text < 1200)) console.log(`THIN ${r.route}: ${r.text}`);
const dup = {};
for (const r of report.filter((r) => r.ok)) dup[r.title] = (dup[r.title] || 0) + 1;
for (const [t, n] of Object.entries(dup)) if (n > 1) console.log(`DUPTITLE x${n}: ${t}`);
console.log(`готово: ${report.filter((r) => r.ok).length}/${report.length}`);
