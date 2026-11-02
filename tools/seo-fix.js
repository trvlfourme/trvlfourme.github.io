// Постобработка готовых страниц: аккуратные title/description, разметка
// Article / FAQPage / BreadcrumbList и блок внутренней перелинковки.
// Идемпотентно: повторный запуск перезаписывает свои же блоки.
// Запуск: node tools/seo-fix.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://kabinetdoma.ru';
const TODAY = new Date().toISOString().slice(0, 10);

const META = Object.assign(
  {},
  ...['seo-pages-a.json', 'seo-pages-b.json', 'seo-pages-c.json', 'seo-pages-sections.json'].map(
    (f) => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'))
  )
);

// ключи статей в JSON — голые slug'и; приводим их к маршрутам /article/<slug>/
for (const key of Object.keys(META)) {
  if (key.startsWith('/')) continue;
  META['/article/' + key + '/'] = META[key];
  delete META[key];
}

const TOOLS = [
  ['/calculator/', 'Калькулятор высоты стола'],
  ['/builder/', 'Конструктор сетапа'],
  ['/tests/', 'Тесты о рабочем месте'],
  ['/checklist/', 'Чек-лист тишины'],
];

const text = (s) =>
  String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', 'tools', '_prodcheck', '_prerender'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) pages(full, out);
    else if (e.name === 'index.html') out.push(full);
  }
  return out;
}

function faqPairs(html) {
  const start = Math.max(html.indexOf('FAQ)'), html.indexOf('FAQ</h3>'));
  if (start < 0) return [];
  const aside = html.indexOf('<aside', start);
  const slice = html.slice(start, aside > start ? aside : start + 30000);
  const pairs = [];
  for (const m of slice.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/g)) {
    const q = text(m[1]);
    const a = text(m[2]);
    if (q.length > 8 && a.length > 20) pairs.push([q, a]);
  }
  return pairs.slice(0, 6);
}

function breadcrumbs(route, name) {
  const items = [{ name: 'Главная', url: SITE + '/' }];
  if (route.startsWith('/article/')) items.push({ name: 'Все гайды', url: SITE + '/articles/' });
  items.push({ name, url: SITE + route });
  return {
    '@type': 'BreadcrumbList',
    '@id': SITE + route + '#breadcrumbs',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

function buildSchema({ route, meta, h1, dateModified, faq }) {
  const url = SITE + route;
  const isTool = ['/calculator/', '/builder/', '/tests/', '/checklist/'].includes(route);
  const graph = [];
  if (route.startsWith('/article/')) {
    graph.push({
      '@type': 'Article',
      '@id': url + '#article',
      headline: meta.title,
      description: meta.desc,
      inLanguage: 'ru-RU',
      isAccessibleForFree: true,
      mainEntityOfPage: { '@id': url + '#webpage' },
      datePublished: '2026-10-13',
      dateModified,
      author: { '@type': 'Organization', name: 'Редакция KabinetDoma.ru', url: SITE + '/about/' },
      publisher: { '@id': SITE + '/#organization' },
      image: { '@type': 'ImageObject', url: SITE + '/og-image.png', width: 1200, height: 630 },
      articleSection: 'Эргономика домашнего офиса',
    });
    graph.push({
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url,
      name: meta.title,
      description: meta.desc,
      inLanguage: 'ru-RU',
      isPartOf: { '@id': SITE + '/#website' },
      breadcrumb: { '@id': url + '#breadcrumbs' },
    });
    if (faq.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': url + '#faq',
        isPartOf: { '@id': url + '#webpage' },
        mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      });
    }
  } else {
    graph.push({
      '@type': isTool ? 'WebApplication' : 'WebPage',
      '@id': url + '#webpage',
      url,
      name: meta.title,
      description: meta.desc,
      inLanguage: 'ru-RU',
      isPartOf: { '@id': SITE + '/#website' },
      breadcrumb: { '@id': url + '#breadcrumbs' },
      ...(isTool ? { applicationCategory: 'HealthApplication', operatingSystem: 'Any', isAccessibleForFree: true } : {}),
    });
  }
  graph.push(breadcrumbs(route, h1 || meta.title));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function rewriteHead(html, meta, schema, isArticle) {
  const set = (re, value) => {
    html = html.replace(re, value);
  };
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${attr(meta.title)}</title>`);
  const swap = (re, v) => html.replace(re, (m) => m.replace(/content="[^"]*"/, `content="${attr(v)}"`));
  html = swap(/<meta name="description" content="[^"]*"[^>]*>/i, meta.desc);
  html = swap(/<meta property="og:title" content="[^"]*"[^>]*>/i, meta.title);
  html = swap(/<meta property="og:description" content="[^"]*"[^>]*>/i, meta.desc);
  html = swap(/<meta name="twitter:title" content="[^"]*"[^>]*>/i, meta.title);
  html = swap(/<meta name="twitter:description" content="[^"]*"[^>]*>/i, meta.desc);
  html = html.replace(
    /<meta property="og:type" content="[^"]*"[^>]*>/i,
    `<meta property="og:type" content="${isArticle ? 'article' : 'website'}">`
  );
  html = html.replace(/[ \t]*<!-- kd-seo -->[\s\S]*?<!-- \/kd-seo -->/g, '');
  const block = `<!-- kd-seo -->\n    <script type="application/ld+json">${schema}</script>\n    <!-- /kd-seo -->`;
  return html.replace(/<\/head>/i, `${block}\n  </head>`);
}

function tailBlock(meta) {
  const links = (meta.related || [])
    .map(([href, label]) => `<li><a href="${href}">${label}</a></li>`)
    .join('');
  const tools = TOOLS.map(([href, label]) => `<a href="${href}">${label}</a>`).join('');
  return `<!-- kd-links -->
<section class="kd-links" aria-label="Читайте также и инструменты">
  <style>
    .kd-links{background:#1c1917;color:#d6d3d1;border-top:1px solid #292524;padding:32px 16px;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
    .kd-links .kd-in{max-width:1120px;margin:0 auto}
    .kd-links h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#fbbf24;margin:0 0 14px;font-weight:700}
    .kd-links ul{list-style:none;margin:0 0 22px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px 20px}
    .kd-links li a{color:#e7e5e4;text-decoration:none;border-bottom:1px solid #44403c;padding-bottom:1px}
    .kd-links li a:hover{color:#fbbf24;border-color:#fbbf24}
    .kd-links .kd-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
    .kd-links .kd-tools a{display:inline-block;padding:7px 12px;border:1px solid #44403c;border-radius:8px;color:#e7e5e4;text-decoration:none;font-size:13px}
    .kd-links .kd-tools a:hover{border-color:#fbbf24;color:#fbbf24}
    .kd-links .kd-all{color:#a8a29e;font-size:13px}
    .kd-links .kd-all a{color:#a8a29e}
    @media (max-width:640px){.kd-links{padding:24px 16px}}
  </style>
  <div class="kd-in">
    <h2>Читайте также</h2>
    <ul>${links}</ul>
    <div class="kd-tools">${tools}</div>
    <p class="kd-all">Все материалы по кластерам — <a href="/articles/">база знаний из 17 гайдов</a>.</p>
  </div>
</section>
<!-- /kd-links -->`;
}

const report = [];
for (const file of pages(root)) {
  const rel = '/' + path.relative(root, file).split(path.sep).join('/').replace(/index\.html$/, '');
  const route = rel === '/' ? '/' : rel;
  let html = fs.readFileSync(file, 'utf8');
  if (/http-equiv="refresh"/i.test(html)) continue;
  const meta = META[route];
  if (route === '/articles/') continue; // хаб базы знаний размечен и связан вручную
  if (!meta) {
    report.push(`НЕТ МЕТАДАННЫХ: ${route}`);
    continue;
  }
  const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1m ? text(h1m[1]) : '';
  const isArticle = route.startsWith('/article/');
  const faq = isArticle ? faqPairs(html) : [];
  const dateModified = new Date(fs.statSync(file).mtime).toISOString().slice(0, 10);
  const schema = buildSchema({ route, meta, h1, dateModified, faq });
  html = rewriteHead(html, meta, schema, isArticle);
  html = html.replace(/[ \t]*<!-- kd-links -->[\s\S]*?<!-- \/kd-links -->/g, '');
  html = html.replace(/<\/body>/i, `${tailBlock(meta)}\n</body>`);
  fs.writeFileSync(file, html, 'utf8');
  report.push(`${route.padEnd(52)} ${meta.title.length} симв. заголовок, ${meta.desc.length} описание, FAQ ${faq.length}`);
}

console.log(report.join('\n'));
console.log(`\nстраниц обработано: ${report.filter((r) => !r.startsWith('НЕТ')).length}`);
