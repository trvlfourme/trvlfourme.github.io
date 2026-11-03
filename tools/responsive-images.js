// Адаптивные картинки в готовом HTML: srcset/sizes по классу элемента и
// предзагрузка главной картинки страницы. Запуск: node tools/responsive-images.js
// Идемпотентно: повторный прогон не дублирует атрибуты.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Какой набор кандидатов нужен элементу — решает его класс: так разметка остаётся
// в одном месте (в бандле), а здесь только отражение размеров.
const LOGO = '/logo-64.png 64w, /logo-128.png 128w, /logo.png 512w';

function plan(tag) {
  const cls = (tag.match(/class="([^"]*)"/) || [, ''])[1];
  const src = (tag.match(/src="([^"]*)"/) || [, ''])[1];
  if (src === '/logo.png') {
    if (/w-5 h-5/.test(cls)) return { srcset: LOGO, sizes: '20px' };
    if (/w-10 h-10/.test(cls)) return { srcset: LOGO, sizes: '40px' };
    if (/w-1[24] h-1[24]/.test(cls)) return { srcset: LOGO, sizes: '48px' };
    return { srcset: LOGO, sizes: '48px' };
  }
  const ed = src.match(/^\/images\/editorial\/([a-z0-9-]+)\.jpg$/);
  if (!ed) return null;
  const base = ed[1];
  const pair = `/images/editorial/${base}-640.jpg 640w, ${src} 1376w`;
  const thumb = `/images/editorial/${base}-320.jpg 320w`;
  if (/w-12 h-12/.test(cls)) return { srcset: thumb, sizes: '48px' };
  if (/w-14 h-14/.test(cls)) return { srcset: thumb, sizes: '56px' };
  if (/h-36/.test(cls)) return { srcset: thumb, sizes: '144px' };
  if (/group-hover:scale-103/.test(cls)) return { srcset: pair, sizes: '(max-width: 640px) 100vw, 33vw', preload: true };
  return { srcset: pair, sizes: '100vw', preload: true };
}

function addAttrs(tag, p) {
  let out = tag;
  if (!/srcset=/.test(out)) out = out.replace(/^<img\b/, `<img srcset="${p.srcset}"`);
  if (!/sizes=/.test(out)) out = out.replace(/^<img\b/, `<img sizes="${p.sizes}"`);
  return out;
}

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', '_prerender', '_originals', '_prodcheck', '_reports'].includes(e.name)) continue;
    if (e.name.startsWith('Исходники')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(root);

let touched = 0;
let imgs = 0;
for (const file of pages) {
  let html = fs.readFileSync(file, 'utf8');
  if (/http-equiv="refresh"/i.test(html)) continue;
  const before = html;
  let hero = false;
  html = html.replace(/<img\b[^>]*>/g, (tag) => {
    const p = plan(tag);
    if (!p) return tag;
    imgs += 1;
    let out = addAttrs(tag, p);
    // Первую большую картинку просим браузер загружать с высоким приоритетом.
    // <link rel="preload" imagesrcset> не используем: на телефоне Chrome выбирает
    // по нему самый крупный кандидат и тянет лишние сотни килобайт.
    if (p.preload && !hero) {
      hero = true;
      if (!/fetchpriority=/.test(out)) out = out.replace(/^<img\b/, '<img fetchpriority="high"');
    }
    return out;
  });
  html = html.replace(/[ \t]*<link rel="preload" as="image"[^>]*>\r?\n?/gi, '');
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    touched += 1;
  }
}

console.log(`страниц изменено: ${touched}, картинок размечено: ${imgs}`);
