// Подключает assets/kd-track.js ко всем каноническим страницам (кроме редиректов).
// Идемпотентно: повторный прогон ничего не дублирует. Запуск: node tools/inject-tracker.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const MARK = '<!--kd:tracker-->';
const TAG = '<script src="/assets/kd-track.js" defer></script>';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_prodcheck' || e.name === '_prerender') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === 'index.html') out.push(full);
  }
  return out;
}

let touched = 0;
let skipped = 0;
for (const file of walk(root)) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('http-equiv="refresh"')) {
    skipped++;
    continue;
  }
  if (html.includes(MARK)) continue;
  const at = html.lastIndexOf('</body>');
  if (at < 0) continue;
  html = html.slice(0, at) + MARK + TAG + html.slice(at);
  fs.writeFileSync(file, html);
  touched++;
}

console.log(`трекер: добавлен на ${touched} страниц, пропущено редиректов: ${skipped}`);
