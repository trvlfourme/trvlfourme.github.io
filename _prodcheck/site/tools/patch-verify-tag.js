// Подтверждение площадки для Mitgo/Admitad: один метатег в head каждой страницы.
// Идемпотентно: повторный запуск не плодит дубли и чинит перевод строки.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const TAG = '<meta name="mitgo-verification" content="2ab007de-ae48-4bfa-b8aa-21a9992758fb" />';
const SKIP = new Set(['yandex_f90ccbe3e80e4f97.html']);

function htmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    if (entry.name === '_prerender' || entry.name === '_prodcheck') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html') && !SKIP.has(entry.name)) out.push(full);
  }
  return out;
}

let updated = 0;
let already = 0;
for (const file of htmlFiles(root)) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('mitgo-verification')) {
    // починка ранее вставленного тега, если перевод строки не совпал с файлом
    if (html.includes('\r\n') && html.includes('\n    ' + TAG)) {
      fs.writeFileSync(file, html.split('\n    ' + TAG).join('\r\n    ' + TAG), 'utf8');
      updated++;
      continue;
    }
    already++;
    continue;
  }
  const head = html.match(/<head[^>]*>/i);
  if (!head) {
    console.log('нет <head>:', path.relative(root, file));
    continue;
  }
  const at = head.index + head[0].length;
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(file, html.slice(0, at) + eol + '    ' + TAG + html.slice(at), 'utf8');
  updated++;
}

console.log('страниц с тегом обновлено:', updated, '| уже были:', already);
