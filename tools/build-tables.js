// Сборка статической страницы /tables/ из data/tables.json.
// Страница без JS и картинок: таблица высот по росту отдаётся готовым HTML,
// таблица — семантическая (table/thead/th scope). tables/index.html — артефакт:
// руками не правим, меняем JSON и запускаем заново.
// Запуск: node tools/build-tables.js [--check]
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://kabinetdoma.ru';
const OUT = path.join(root, 'tables', 'index.html');
const check = process.argv.includes('--check');

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'tables.json'), 'utf8'));

// Данные проверяем до рендера: таблица — единственное содержание страницы,
// тихо испорченная строка здесь дороже упавшей сборки.
if (!Array.isArray(data.rows) || data.rows.length < 2) throw new Error('data/tables.json: нет строк таблицы');
const heights = data.rows.map((r) => r.height);
if (heights[0] !== 110 || heights[heights.length - 1] !== 200) {
  throw new Error(`data/tables.json: таблица должна идти от 110 до 200 см, а не ${heights[0]}–${heights[heights.length - 1]}`);
}
for (let i = 1; i < heights.length; i++) {
  if (heights[i] - heights[i - 1] !== 5) throw new Error(`data/tables.json: шаг не 5 см между ${heights[i - 1]} и ${heights[i]}`);
}
for (const r of data.rows) {
  for (const key of ['desk', 'seat', 'monitor']) {
    if (!Number.isInteger(r[key]) || r[key] <= 0) throw new Error(`data/tables.json: рост ${r.height} — поле ${key} должно быть целым числом`);
  }
  if (r.desk > r.monitor) throw new Error(`data/tables.json: рост ${r.height} — экран ниже столешницы`);
}
if (!Array.isArray(data.links) || data.links.length !== 3) throw new Error('data/tables.json: нужно ровно три внутренние ссылки');
for (const [href] of data.links) {
  if (!href.startsWith('/')) throw new Error(`data/tables.json: ссылка ${href} должна быть внутренней`);
}

const rowsHtml = data.rows
  .map((r) => {
    const cls = r.height === 175 ? ' class="is-standard"' : '';
    return (
      `        <tr${cls}><th scope="row">${r.height}</th>` +
      `<td class="num">${r.desk}</td><td class="num">${r.seat}</td>` +
      `<td class="num">${r.monitor}</td></tr>`
    );
  })
  .join('\n');

const linksHtml = data.links.map(([href, text]) => `      <li><a href="${esc(href)}">${esc(text)}</a></li>`).join('\n');

const template = fs.readFileSync(path.join(__dirname, 'tables-template.html'), 'utf8');
const html = template
  .replace(/@@TITLE@@/g, esc(data.title))
  .replace(/@@H1@@/g, esc(data.h1))
  .replace(/@@DESC@@/g, esc(data.description))
  .replace(/@@LEAD@@/g, esc(data.lead))
  .replace(/@@NOTE@@/g, esc(data.note))
  .replace(/@@SOURCE@@/g, esc(data.source))
  .replace('@@ROWS@@', rowsHtml)
  .replace('@@LINKS@@', linksHtml);

if (/@@[A-Z]+@@/.test(html)) throw new Error('в шаблоне остались незаполненные маркеры');
if (!html.includes('<link rel="canonical" href="' + SITE + '/tables/">')) throw new Error('canonical страницы не на /tables/');

// security-headers.js дописывает в готовую страницу CSP и Referrer-Policy — в сборке он идёт
// после этого шага, поэтому в --check эти две строки из сравнения убираем.
const stripAdded = (s) =>
  s
    .replace(/[ \t]*<meta http-equiv="Content-Security-Policy"[^>]*>\r?\n/, '')
    .replace(/[ \t]*<meta name="referrer"[^>]*>\r?\n/, '');

if (check) {
  const current = fs.existsSync(OUT) ? stripAdded(fs.readFileSync(OUT, 'utf8')) : '';
  if (current !== stripAdded(html)) {
    console.error('tables/index.html расходится с data/tables.json — запустите node tools/build-tables.js');
    process.exit(1);
  }
  console.log(`проверено: /tables/ соответствует data/tables.json, строк ${data.rows.length}`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html, 'utf8');
  console.log(`таблицы: ${data.rows.length} строк, ${html.length} байт → tables/index.html`);
}
