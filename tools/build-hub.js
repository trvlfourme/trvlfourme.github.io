// Сборка страницы «Все гайды» (/articles/) из data/articles/*.json и кураторской
// раскладки data/hub.js. articles/index.html — артефакт: руками не правим.
// Блок «Свежие материалы» собирается сам: 5 последних статей по publishedAt —
// независимо от того, есть ли они в data/hub.js. В тематических блоках они не
// дублируются: выпав из свежих, статья возвращается в свой блок по data/hub.js.
// Статья, которой в data/hub.js нет, не теряется — её тоже показываем в свежих.
// Запуск: node tools/build-hub.js
const fs = require('fs');
const path = require('path');
const { sortKey } = require('./article-dates');

const FRESH_COUNT = 5;

const root = path.resolve(__dirname, '..');
const articlesDir = path.join(root, 'data', 'articles');
const SITE = 'https://kabinetdoma.ru';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// «1 гайд», «2 гайда», «5 гайдов»
function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

function readArticles() {
  const map = new Map();
  for (const file of fs.readdirSync(articlesDir)) {
    if (!file.endsWith('.json') || file === 'order.json') continue;
    const data = JSON.parse(fs.readFileSync(path.join(articlesDir, file), 'utf8'));
    if (!data.slug) throw new Error(`нет slug: data/articles/${file}`);
    if (map.has(data.slug)) throw new Error(`дубль slug: ${data.slug}`);
    map.set(data.slug, data);
  }
  return map;
}

function readOrder() {
  const file = path.join(articlesDir, 'order.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const articles = readArticles();
  const order = readOrder();
  const hub = require(path.join(root, 'data', 'hub.js'));

  // Кураторские карточки: из них берём короткие подписи, а порядок в тематических блоках
  // остаётся ручным. Сами статьи приходят из data/articles.
  const curated = new Map();
  for (const cluster of hub.clusters) {
    for (const card of cluster.cards) {
      if (curated.has(card.slug)) throw new Error(`карточка повторяется в data/hub.js: ${card.slug}`);
      curated.set(card.slug, card);
    }
  }

  const byPos = (a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    const pa = ia < 0 ? Number.MAX_SAFE_INTEGER : ia;
    const pb = ib < 0 ? Number.MAX_SAFE_INTEGER : ib;
    return pa - pb || a.localeCompare(b);
  };
  const byDate = (a, b) => {
    const d = sortKey(articles.get(b).publishedAt).localeCompare(sortKey(articles.get(a).publishedAt));
    return d !== 0 ? d : byPos(a, b);
  };

  const sorted = [...articles.keys()].filter((slug) => sortKey(articles.get(slug).publishedAt)).sort(byDate);
  const fresh = sorted.slice(0, FRESH_COUNT);
  const freshSet = new Set(fresh);
  const leftovers = [...articles.keys()].filter((slug) => !freshSet.has(slug) && !curated.has(slug)).sort(byDate);
  const freshSlugs = fresh.concat(leftovers);

  const cardOf = (slug) => {
    const cur = curated.get(slug);
    const a = articles.get(slug);
    return { slug, title: cur ? cur.title : a.title, note: cur ? cur.note : a.excerpt || '' };
  };

  const blocks = [];
  if (freshSlugs.length) {
    blocks.push({
      title: 'Свежие материалы',
      note: 'Последние гайды — те же, что первыми в ленте на главной.',
      cards: freshSlugs.map(cardOf),
    });
  }
  for (const cluster of hub.clusters) {
    const cards = [];
    for (const card of cluster.cards) {
      const article = articles.get(card.slug);
      if (!article) {
        console.warn(`хаб: статьи ${card.slug} нет в базе — карточка пропущена`);
        continue;
      }
      if (freshSet.has(card.slug)) continue; // свежие уже сверху, дублей не нужно
      cards.push({ slug: card.slug, title: card.title, note: card.note });
    }
    if (cards.length) blocks.push({ title: cluster.title, note: cluster.note, cards });
  }

  const cards = blocks.flatMap((b) => b.cards);
  if (!cards.length) throw new Error('хаб пустой: нечего собирать');

  const clustersHtml = blocks
    .map((block) => {
      const body = block.cards
        .map(
          (card) =>
            `      <a class="card" href="/article/${card.slug}/"><b>${esc(card.title)}</b><span>${esc(card.note)}</span></a>`
        )
        .join('\n');
      return [
        '  <section class="cluster">',
        `    <h2>${esc(block.title)}</h2>`,
        `    <p class="note">${esc(block.note)}</p>`,
        '    <div class="cards">',
        body,
        '    </div>',
        '  </section>',
      ].join('\n');
    })
    .join('\n\n');

  const itemList = cards
    .map(
      (card, i) =>
        `      {"@type":"ListItem","position":${i + 1},"url":"${SITE}/article/${card.slug}/"}`
    )
    .join(',\n');

  const template = fs.readFileSync(path.join(__dirname, 'hub-template.html'), 'utf8');
  const html = template
    .replace(/@@COUNT@@/g, String(cards.length))
    .replace(/@@GUIDES@@/g, plural(cards.length, ['гайд', 'гайда', 'гайдов']))
    .replace(/@@MATERIALS@@/g, plural(cards.length, ['материал', 'материала', 'материалов']))
    .replace('@@CLUSTERS@@', clustersHtml)
    .replace('@@ITEMLIST@@', itemList);

  if (/@@[A-Z]+@@/.test(html)) throw new Error('в шаблоне остались незаполненные маркеры');
  fs.writeFileSync(path.join(root, 'articles', 'index.html'), html);
  console.log(`хаб: ${cards.length} карточек, ${blocks.length} блоков`);
}

main();
