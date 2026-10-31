// Постобработка страницы, снятой из живого браузера: метаданные, абсолютные пути, шина маршрута.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://kabinetdoma.ru';
const OG_IMAGE = `${SITE}/og-image.png`;

const [slug, id] = process.argv.slice(2);
if (!slug || !id) {
  console.error('использование: node tools/fix-page.js <slug> <articleId>');
  process.exit(1);
}

const file = path.join(root, '_prerender', 'article', slug, 'index.html');
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
const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

let html = fs.readFileSync(file, 'utf8').replace(/(href|src)="\.\//g, '$1="/');
const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
const title = h1 ? stripTags(h1[1]) : 'Кабинет Дома';
const paragraph = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
  .map((m) => stripTags(m[1]))
  .find((t) => t.length >= 70 && !t.startsWith('©'));
const description = paragraph
  ? paragraph.length > 300
    ? paragraph.slice(0, 300).replace(/\s+\S*$/, '') + '…'
    : paragraph
  : '';

const canonical = SITE + '/article/' + slug;
html = html
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

const shim = `<script>
    (function () {
      if (!/^\\/article\\/[a-z0-9-]+\\/?$/.test(location.pathname)) return;
      var pretty = location.pathname + location.hash;
      try { history.replaceState(null, '', '/?article=${id}'); } catch (e) {}
      document.addEventListener('DOMContentLoaded', function () {
        try { history.replaceState(null, '', pretty); } catch (e) {}
      });
    })();
    </script>`;

html = html.replace(/<\/head>/i, `    ${head}\n  </head>`);
html = html.replace(/<\/head>/i, `    ${shim}\n  </head>`);
fs.writeFileSync(file, html, 'utf8');
console.log(`${slug}: ${Math.round(html.length / 1024)}KB  "${title.slice(0, 60)}"`);
