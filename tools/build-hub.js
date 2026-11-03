// Сборка страницы «Все гайды» (/articles/) из data/articles/*.json и кураторской
// раскладки data/hub.js. articles/index.html — артефакт: руками не правим.
// Статья, которой нет в data/hub.js, не теряется: она попадает в блок «Свежие материалы»
// с заголовком и описанием из JSON. Удалённая статья убирается из хаба сама.
// Запуск: node tools/build-hub.js
const fs = require('fs');
const path = require('path');

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

  const used = new Set();
  const blocks = [];
  for (const cluster of hub.clusters) {
    const cards = [];
    for (const card of cluster.cards) {
      if (used.has(card.slug)) throw new Error(`карточка повторяется в data/hub.js: ${card.slug}`);
      const article = articles.get(card.slug);
      if (!article) {
        console.warn(`хаб: статьи ${card.slug} нет в базе — карточка пропущена`);
        continue;
      }
      used.add(card.slug);
      cards.push({ slug: card.slug, title: card.title, note: card.note });
    }
    if (cards.length) blocks.push({ title: cluster.title, note: cluster.note, cards });
  }

  const fresh = [...articles.keys()].filter((slug) => !used.has(slug));
  if (fresh.length) {
    const pos = (slug) => {
      const i = order.indexOf(slug);
      return i < 0 ? Number.MAX_SAFE_INTEGER : i;
    };
    fresh.sort((a, b) => {
      const d = pos(a) - pos(b);
      if (d !== 0) return d;
      return String(articles.get(b).publishedAt || '').localeCompare(String(articles.get(a).publishedAt || ''));
    });
    blocks.unshift({
      title: 'Свежие материалы',
      note: 'Новые гайды: ещё не разложены по темам, но уже в базе.',
      cards: fresh.map((slug) => ({
        slug,
        title: articles.get(slug).title,
        note: articles.get(slug).excerpt || '',
      })),
    });
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
