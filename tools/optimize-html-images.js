// Постпроход по готовым страницам: внешние фото заменяем на локальные,
// проставляем width/height (против сдвигов вёрстки) и loading="lazy".
// Запуск: node tools/optimize-html-images.js [--check]
// (пережатие самих файлов в images/editorial — отдельный tools/optimize-images.js)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const check = process.argv.includes('--check');
// Внешние фото (Unsplash) заменяем на локальные: аватар редакции — логотип,
// остальные снимки — соответствующие иллюстрации из images/.
const PHOTO_MAP = {
  '1497366216548-37526070297c': '/logo.png',
  '1505797149-43b0069ec26b': '/images/ergonomic-chair.svg',
  '1586023492125-27b2c045efd7': '/images/ergonomic-chair.svg',
  '1544367567-0f2fcb009e0b': '/images/ergonomic-chair.svg',
  '1507473885765-e6ed057f782c': '/images/screenbar-light.svg',
  '1544716278-ca5e3f4abd8c': '/images/screenbar-light.svg',
  '1527443224154-c4a3942d3acf': '/images/monitor-arms.svg',
  '1600585154340-be6161a56a0c': '/images/cable-management.svg',
  '1595515106969-1ce29566ff1c': '/images/standing-desk.svg',
  '1518455027359-f3f8164ba6bd': '/images/budget-setup.svg',
  '1546435770-a3e426bf472b': '/images/audio-microphones.svg',
  '1590602847861-f357a9332bbc': '/images/audio-microphones.svg',
  '1583863788434-e58a36330cf0': '/images/workspace-hero.svg',
  '1541807084-5c52b6b3adef': '/images/footrest-ergonomics.svg',
  '1609592424368-c115712e09b5': '/images/remote-travel.svg',
  '1585338107529-13afc5f02586': '/images/remote-travel.svg',
};
const UNSPLASH_RE = /https:\/\/images\.unsplash\.com\/photo-([0-9a-f-]+)\?[^"' ]*/g;
const SKIP_DIRS = ['node_modules', 'tools', '_prodcheck', '_prerender', '_prerender_old', 'assets', '.git'];

function jpegSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function pngSize(buf) {
  if (buf.slice(1, 4).toString() !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function svgSize(buf) {
  const head = buf.slice(0, 600).toString('utf8');
  const w = (head.match(/\bwidth="(\d+)"/) || [])[1];
  const h = (head.match(/\bheight="(\d+)"/) || [])[1];
  if (w && h) return { w: Number(w), h: Number(h) };
  const vb = (head.match(/viewBox="([\d.\s-]+)"/) || [])[1];
  if (!vb) return null;
  const p = vb.trim().split(/\s+/).map(Number);
  return p.length === 4 && p[2] > 0 ? { w: p[2], h: p[3] } : null;
 }

const sizes = new Map();
function sizeOf(url) {
  if (sizes.has(url)) return sizes.get(url);
  const file = path.join(root, decodeURIComponent(url.replace(/^\//, '').split('?')[0]));
  let size = null;
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    const buf = fs.readFileSync(file);
    if (/\.jpe?g$/i.test(file)) size = jpegSize(buf);
    else if (/\.png$/i.test(file)) size = pngSize(buf);
    else if (/\.svg$/i.test(file)) size = svgSize(buf);
  }
  sizes.set(url, size);
  return size;
}

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) pages(full, out);
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

let changed = 0;
let external = 0;
for (const file of pages(root)) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const before = fs.readFileSync(file, 'utf8');
  let html = before;
  let heroMarked = false;

  html = html.replace(/<img\b[^>]*>/g, (tag) => {
    let out = tag;
    out = out.replace(UNSPLASH_RE, (url, id) => {
      const local = PHOTO_MAP[id] || '/images/workspace-hero.svg';
      external++;
      return local;
    });
    const src = (out.match(/\bsrc="(\/[^"]+)"/) || [])[1];
    if (!src) return out;
    const size = sizeOf(src);
    if (size && !/\bwidth=/.test(out)) {
      out = out.replace(/\bsrc="/, `width="${size.w}" height="${size.h}" src="`);
    }
    // Первая содержательная картинка — кандидат в LCP: грузим сразу и с приоритетом.
    if (!heroMarked && !src.startsWith('/logo.png')) {
      heroMarked = true;
      if (/\bfetchpriority=/.test(out)) return out;
      out = out.replace(/\sloading="lazy"/, '').replace(/<img\b/, '<img fetchpriority="high"');
      return out;
    }
    if (!/\bloading=/.test(out)) {
      out = out.replace(/<img\b/, '<img loading="lazy"');
    }
    return out;
  });

  if (html !== before) {
    changed++;
    if (!check) fs.writeFileSync(file, html, 'utf8');
    if (!check) console.log('обновлено: ' + rel);
  }
}
console.log(`страниц с правками: ${changed}, внешних фото заменено: ${external}`);
