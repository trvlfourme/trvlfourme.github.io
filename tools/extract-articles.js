// Одноразовая выгрузка текстов статей из бандла в data/articles/*.json.
// Запуск: node tools/extract-articles.js   (если data/articles уже есть — откажется работать)
const fs = require('fs');
const path = require('path');
const { renderBlock, blockFromBundle, START, END, apply } = require('./apply-articles');

const root = path.resolve(__dirname, '..');
const bundlePath = path.join(root, 'assets', 'index.js');
const dir = path.join(root, 'data', 'articles');

const bundle = fs.readFileSync(bundlePath, 'utf8');
if (bundle.includes(START)) {
  console.error('маркеры уже есть — тексты уже вынесены, повторно не нужно');
  process.exit(1);
}
if (fs.existsSync(dir) && fs.readdirSync(dir).length) {
  console.error('data/articles не пуста — выгрузка отменена');
  process.exit(1);
}

const anchor = '=[{id:`guide-ergonomics-setup`';
const at = bundle.indexOf(anchor);
if (at < 0) throw new Error('не нашёл начало массива статей в бандле');
const start = at + 1;

function matchBracket(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (c === '`') {
      for (j++; j < s.length; j++) {
        if (s[j] === '\\') { j++; continue; }
        if (s[j] === '`') break;
      }
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      for (j++; j < s.length; j++) {
        if (s[j] === '\\') { j++; continue; }
        if (s[j] === q) break;
      }
      continue;
    }
    if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') {
      depth--;
      if (depth === 0) return j;
    }
  }
  throw new Error('скобки в массиве статей не сошлись');
}

const end = matchBracket(bundle, start);
const literal = bundle.slice(start, end + 1);
const original = new Function('ft', 'return ' + literal)({ name: 'stub' });
if (!Array.isArray(original) || !original.length) throw new Error('массив статей пустой');

fs.mkdirSync(dir, { recursive: true });
const order = [];
for (const a of original) {
  const file = path.join(dir, a.slug + '.json');
  if (fs.existsSync(file)) throw new Error('файл уже существует: ' + file);
  const copy = Object.assign({}, a);
  if (copy.author) copy.author = 'editorial';
  fs.writeFileSync(file, JSON.stringify(copy, null, 2) + '\n');
  order.push(a.slug);
}
fs.writeFileSync(path.join(dir, 'order.json'), JSON.stringify(order, null, 2) + '\n');

// бандл получает маркеры и тот же массив в сериализованном виде
const normalized = original.map((a) => {
  const copy = Object.assign({}, a);
  if (copy.author) copy.author = 'editorial';
  return copy;
});
const block = renderBlock(normalized);
fs.writeFileSync(bundlePath, bundle.slice(0, start) + START + block + END + bundle.slice(end + 1));

// проверка: собранный из JSON блок даёт те же данные, что и исходный литерал
const after = fs.readFileSync(bundlePath, 'utf8');
const reparsed = new Function('ft', 'return ' + blockFromBundle(after))({ name: 'stub' });
const norm = (a) => JSON.stringify(Object.assign({}, a, a.author ? { author: 'editorial' } : {}));
const same = JSON.stringify(reparsed.map(norm)) === JSON.stringify(normalized.map(norm));
console.log('статей выгружено:', original.length);
console.log('данные идентичны исходным:', same);
console.log('размер JSON:', (fs.readdirSync(dir).reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0) / 1024).toFixed(0), 'КБ');
const res = apply({ dry: true });
console.log('сверка бандла с JSON:', res.bundleChanged ? 'РАСХОДИТСЯ' : 'совпадает');
if (!same || res.bundleChanged) process.exit(1);
