// Чтение и запись объектов статей в бандле assets/index.js.
// Объект статьи лежит в массиве pt=[...] и записан как JS-литерал с бэктиками.
const fs = require('fs');
const path = require('path');

const BUNDLE = path.resolve(__dirname, '..', 'assets', 'index.js');

function readBundle() {
  return fs.readFileSync(BUNDLE, 'utf8');
}

// Границы литерала статьи по её id: от «{id:`<id>`» до парной закрывающей скобки.
function locate(src, id) {
  const start = src.indexOf('{id:`' + id + '`');
  if (start < 0) throw new Error('статья не найдена: ' + id);
  let depth = 0;
  let inBt = false;
  let inSq = false;
  let inDq = false;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];
    if (inBt) {
      if (ch === '`' && prev !== '\\') inBt = false;
      continue;
    }
    if (inSq) {
      if (ch === "'" && prev !== '\\') inSq = false;
      continue;
    }
    if (inDq) {
      if (ch === '"' && prev !== '\\') inDq = false;
      continue;
    }
    if (ch === '`') { inBt = true; continue; }
    if (ch === "'") { inSq = true; continue; }
    if (ch === '"') { inDq = true; continue; }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return { start, end: i + 1 };
    }
  }
  throw new Error('не найден конец литерала: ' + id);
}

function parse(src, id) {
  const { start, end } = locate(src, id);
  const literal = src.slice(start, end);
  // author ссылается на объект ft — подставляем заглушку и возвращаем обратно при записи
  const obj = new Function('ft', 'return (' + literal + ')')({ __ft: true });
  return { obj, literal, start, end };
}

const bt = (s) =>
  '`' +
  String(s)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/\n/g, '\\n') +
  '`';

function ser(v, key) {
  if (key === 'author' && v && v.__ft) return 'ft';
  if (typeof v === 'string') return bt(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v === null) return 'null';
  if (Array.isArray(v)) return '[' + v.map((x) => ser(x)).join(',') + ']';
  return '{' + Object.keys(v).map((k) => k + ':' + ser(v[k], k)).join(',') + '}';
}

function writeArticle(id, obj) {
  const src = readBundle();
  const { start, end } = locate(src, id);
  const literal = ser(obj);
  const out = src.slice(0, start) + literal + src.slice(end);
  fs.writeFileSync(BUNDLE, out, 'utf8');
  return literal.length;
}

// Вставка новой статьи первым элементом массива pt.
function insertArticle(obj) {
  let src = readBundle();
  if (src.includes('id:`' + obj.id + '`')) return false;
  const at = src.indexOf('pt=[');
  if (at < 0) throw new Error('не найден массив статей pt=[');
  const insertAt = at + 'pt=['.length;
  src = src.slice(0, insertAt) + ser(obj) + ',' + src.slice(insertAt);
  fs.writeFileSync(BUNDLE, src, 'utf8');
  return true;
}

module.exports = { readBundle, locate, parse, writeArticle, insertArticle, ser };
