// Источник текстов статей — data/articles/*.json, а не бандл.
// Скрипт собирает массив статей и вставляет его в assets/index.js между маркерами.
// Запуск: node tools/apply-articles.js        — применить (пишет бандл и tools/articles.json)
//         node tools/apply-articles.js --check — только сверить, код выхода 1 при расхождении
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const START = '/*kd:articles:start*/';
const END = '/*kd:articles:end*/';
// автор статей — объект ft, объявленный в бандле рядом с массивом
const AUTHOR_TOKEN = '__kd_editorial_author__';

const field = (a, name, file) => {
  const v = a[name];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`${file}: пустое поле ${name}`);
  return v;
};

function loadArticles(root = ROOT) {
  const dir = path.join(root, 'data', 'articles');
  const orderFile = path.join(dir, 'order.json');
  if (!fs.existsSync(orderFile)) throw new Error('нет data/articles/order.json — список статей в порядке вывода');
  const order = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
  if (!Array.isArray(order) || !order.length) throw new Error('data/articles/order.json должен быть непустым массивом slug');

  const slugs = new Set();
  const ids = new Set();
  const articles = order.map((slug) => {
    const file = `data/articles/${slug}.json`;
    if (!fs.existsSync(path.join(dir, slug + '.json'))) throw new Error(`нет файла статьи: ${file}`);
    const a = JSON.parse(fs.readFileSync(path.join(dir, slug + '.json'), 'utf8'));
    field(a, 'id', file);
    field(a, 'slug', file);
    field(a, 'title', file);
    if (a.slug !== slug) throw new Error(`${file}: slug «${a.slug}» не совпадает с именем файла`);
    if (!Array.isArray(a.sections) || !a.sections.length) throw new Error(`${file}: нет sections`);
    if (slugs.has(a.slug)) throw new Error(`${file}: slug повторяется`);
    if (ids.has(a.id)) throw new Error(`${file}: id ${a.id} повторяется`);
    slugs.add(a.slug);
    ids.add(a.id);
    if (JSON.stringify(a).includes('ozon.ru')) throw new Error(`${file}: в тексте есть ozon.ru — правилом проекта запрещено`);
    return a;
  });

  const unused = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'order.json')
    .map((f) => f.replace(/\.json$/, ''))
    .filter((s) => !slugs.has(s));
  if (unused.length) throw new Error(`файлы не перечислены в order.json: ${unused.join(', ')}`);

  return articles;
}

function renderBlock(articles) {
  const parts = articles.map((a) => {
    const copy = Object.assign({}, a);
    if (copy.author === 'editorial') copy.author = AUTHOR_TOKEN;
    return JSON.stringify(copy).replace('"' + AUTHOR_TOKEN + '"', 'ft');
  });
  return '[\n' + parts.join(',\n') + '\n]';
}

function blockFromBundle(text) {
  const i = text.indexOf(START);
  const j = text.indexOf(END);
  if (i < 0 || j < 0 || j < i) {
    throw new Error('в assets/index.js нет маркеров /*kd:articles:start*/ … /*kd:articles:end*/ — бандл правили вручную');
  }
  return text.slice(i + START.length, j);
}

function articlesJson(articles) {
  const list = articles.map((a) => ({ id: a.id, slug: a.slug }));
  return JSON.stringify(list, null, 2) + '\n';
}

function apply({ root = ROOT, dry = false } = {}) {
  const articles = loadArticles(root);
  const bundlePath = path.join(root, 'assets', 'index.js');
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const current = blockFromBundle(bundle);
  const wanted = renderBlock(articles);
  const result = { count: articles.length, bundleChanged: current !== wanted, listChanged: false };

  if (!dry) {
    if (result.bundleChanged) {
      const i = bundle.indexOf(START) + START.length;
      fs.writeFileSync(bundlePath, bundle.slice(0, i) + wanted + bundle.slice(i + current.length));
    }
    const listPath = path.join(root, 'tools', 'articles.json');
    if (fs.existsSync(path.dirname(listPath))) {
      const next = articlesJson(articles);
      result.listChanged = !fs.existsSync(listPath) || fs.readFileSync(listPath, 'utf8') !== next;
      if (result.listChanged) fs.writeFileSync(listPath, next);
    }
  }
  return result;
}

module.exports = { loadArticles, renderBlock, blockFromBundle, articlesJson, apply, START, END };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const res = apply({ dry: check });
  if (check) {
    if (res.bundleChanged) {
      console.error(`бандл расходится с data/articles (${res.count} статей): правьте JSON, а не assets/index.js`);
      process.exit(1);
    }
    console.log(`статьи: ${res.count}, бандл совпадает с data/articles`);
  } else {
    const bits = [res.bundleChanged ? 'бандл обновлён' : 'бандл без изменений'];
    if (res.listChanged) bits.push('tools/articles.json обновлён');
    console.log(`статьи: ${res.count}, ${bits.join(', ')}`);
  }
}
