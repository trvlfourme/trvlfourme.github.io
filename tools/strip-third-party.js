// Убирает со страниц внешние счётчики и чужие шрифты — режим «сайт без ПДн» (T-056, T-058).
// Удаляет: счётчик Яндекс.Метрики с noscript-пикселем, ссылки на fonts.googleapis.com и
// fonts.gstatic.com, тег трекера целей /assets/kd-track.js. Идемпотентно.
// Запуск: node tools/strip-third-party.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const TRACKER_MARK = '<!--kd:tracker-->';

const RULES = [
  {
    name: 'счётчик Метрики',
    re: /<!--\s*Yandex\.Metrika counter[^>]*-->[\s\S]*?<!--\s*\/Yandex\.Metrika counter\s*-->\s*/g,
  },
  {
    name: 'noscript-пиксель Метрики',
    re: /<noscript>\s*<div>\s*<img src="https:\/\/mc\.yandex\.ru\/watch\/[^"]*"[^>]*>\s*<\/div>\s*<\/noscript>\s*/g,
  },
  {
    name: 'preconnect к Google Fonts',
    re: /<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>\s*/g,
  },
  {
    name: 'таблица стилей Google Fonts',
    re: /<link[^>]+href="https:\/\/fonts\.googleapis\.com\/[^"]*"[^>]*>\s*/g,
  },
  {
    name: 'трекер целей kd-track.js',
    re: /\s*(?:<!--kd:tracker-->)?<script src="\/assets\/kd-track\.js" defer(?:="")?><\/script>/g,
  },
];

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_prodcheck' || e.name === '_prerender') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // чужие проекты (app/ и прочие с package.json) не трогаем
      if (fs.existsSync(path.join(full, 'package.json'))) continue;
      pages(full, out);
    } else if (e.name === 'index.html' || (dir === root && e.name.endsWith('.html'))) {
      out.push(full);
    }
  }
  return out;
}

const counts = {};
let touched = 0;
for (const file of pages(root)) {
  const before = fs.readFileSync(file, 'utf8');
  let html = before;
  for (const rule of RULES) {
    html = html.replace(rule.re, () => {
      counts[rule.name] = (counts[rule.name] || 0) + 1;
      return '';
    });
  }
  if (html !== before) {
    fs.writeFileSync(file, html);
    touched++;
  }
}

const parts = Object.entries(counts).map(([k, v]) => `${k}: ${v}`);
console.log(`внешние вставки: страниц изменено ${touched}${parts.length ? ' · ' + parts.join(' · ') : ' · уже чисто'}`);
