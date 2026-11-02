// Редиректы со старых адресов (до перехода на статическую сборку) на новые.
// GitHub Pages не умеет 301, поэтому делаем лёгкие страницы с meta refresh.
// Запуск: node tools/make-redirects.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// старый слаг -> новый слаг (все внутри /article/)
const ARTICLE_MAP = {
  'rabochij-ugolok-v-odnushke-s-rebenkom': 'rabochee-mesto-v-odnushke-s-rebenkom',
  'stol-s-elektroprivodom-vs-obychnyj': 'stol-s-elektroprivodom-polza-dlya-spiny',
  '5-luchshih-ergonomichnyh-kresel-do-35000': '5-luchshih-ergonomichnyh-kresel-rejting',
  'skrinbar-na-monitor-pochemu-nastolnaya-lampa-portit-zrenie': 'skrinbar-na-monitor-vybor-zashchita-glaz',
  'kristalnyj-zvuk-na-sozvonah-bez-krikov-detej': 'mikrofon-s-shumopodavleniem-dlya-zvonkov',
  'kabel-menedzhment-pod-stolom-za-1-chas-i-2500-rublej': 'kabel-menedzhment-pod-stolom-svoimi-rukami',
  'kronshtejn-dlya-monitora-i-podstavka-dlya-nog': 'kronshtejn-dlya-monitora-ergonomika-shei',
  'metod-svetofor-tajm-menedzhment-dlya-roditelej': 'metod-svetofor-udalenka-s-detmi',
  'rabochee-mesto-dlya-dvoih-v-odnoj-komnate': 'rabochee-mesto-dlya-dvoih-v-komnate',
  'podstavki-dlya-nog-ergonomika-oteki': 'podstavka-dlya-nog-pod-stol-ergonomika',
  'vybor-kronshtejna-dlya-monitora-gazlift': 'kronshtejn-dlya-monitora-na-stol-vybor',
  'akusticheskie-paneli-peregorodki-dlya-kvartiry': 'akusticheskie-paneli-dlya-domashnego-kabineta',
  'v-kakoj-komnate-luchshe-rabotat-doma': 'v-kakoj-komnate-luchshe-rabotat-na-udalenke',
  'kuda-postavit-rabochij-stol-okno-batareya-rozetki': 'kuda-postavit-rabochij-stol-v-komnate',
  'domashnij-ofis-s-nulya-chto-kupit-srazu-a-chto-zaminit': 'domashnij-ofis-s-nulya-nedorogo',
  'kak-podgotovitsya-k-udalennoj-rabote-v-poezdke': 'udalennaya-rabota-v-poezdke-i-otpuske',
};

// старые разделы SPA, у которых нет отдельной страницы в новой сборке -> на главную
// /articles/ больше не редирект: там живёт хаб базы знаний, его нельзя перезаписывать
const SECTION_MAP = {
  catalog: '',
};

const SITE = 'https://kabinetdoma.ru';

function page(relTarget, canonical) {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>Переход на новую страницу — Кабинет Дома</title>
    <meta http-equiv="refresh" content="0; url=${relTarget}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="noindex, follow" />
    <style>body{font:16px/1.5 system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;color:#1f2937}a{color:#0f766e}</style>
  </head>
  <body>
    <p>Страница переехала: <a href="${relTarget}">${canonical}</a></p>
  </body>
</html>
`;
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
  return path.relative(root, file).split(path.sep).join('/');
}

const made = [];
const skipped = [];

for (const [oldSlug, newSlug] of Object.entries(ARTICLE_MAP)) {
  const target = path.join(root, 'article', newSlug, 'index.html');
  if (!fs.existsSync(target)) {
    skipped.push(`article/${oldSlug} -> нет страницы article/${newSlug}`);
    continue;
  }
  made.push(write(
    path.join(root, 'article', oldSlug, 'index.html'),
    page(`../${newSlug}/`, `${SITE}/article/${newSlug}/`),
  ));
}

for (const [oldSection, newPath] of Object.entries(SECTION_MAP)) {
  made.push(write(
    path.join(root, oldSection, 'index.html'),
    page(newPath ? `../${newPath}/` : '../', `${SITE}/${newPath ? newPath + '/' : ''}`),
  ));
}

console.log(`страниц-редиректов записано: ${made.length}`);
if (skipped.length) {
  console.log('пропущено (проверьте вручную):');
  skipped.forEach((s) => console.log('  ! ' + s));
}
