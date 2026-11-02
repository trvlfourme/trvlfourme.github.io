// Собирает объект статьи из content/kak-vybrat-kreslo-dlya-spiny.md
// и вставляет его первым элементом в массив pt в assets/index.js.
// Запуск: node tools/build-article.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const MD = path.join(root, 'content', 'kak-vybrat-kreslo-dlya-spiny.md');
const BUNDLE = path.join(root, 'assets', 'index.js');
const ID = 'guide-chair-for-back';
const SLUG = 'kak-vybrat-kreslo-dlya-spiny';

const raw = fs.readFileSync(MD, 'utf8');
const parts = raw.split(/^---$/m);
const body = (parts.length >= 3 ? parts.slice(2).join('---') : raw).trim();

// «## Заголовок» -> { title, content }
const chunks = body
  .split(/^## /m)
  .slice(1)
  .map((c) => {
    const nl = c.indexOf('\n');
    return { title: c.slice(0, nl).trim(), content: c.slice(nl + 1).trim() };
  });

// маркдаун-таблица не поддерживается рендером: строки -> список
function tablify(text) {
  const lines = text.split('\n');
  const out = [];
  for (const line of lines) {
    if (!/^\|/.test(line.trim())) {
      out.push(line);
      continue;
    }
    const cells = line.split('|').map((s) => s.trim()).filter(Boolean);
    if (!cells.length || /^-+$/.test(cells[0])) continue;
    if (/^рост/i.test(cells[0])) continue;
    out.push(`- **${cells[0]}:** сиденье ${cells[1]}, стол ${cells[2]}.`);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const find = (re) => chunks.find((c) => re.test(c.title));
const sectionChunks = chunks.filter(
  (c) => !/^(Вывод эксперта|FAQ|Привязка товаров)/i.test(c.title)
);
const ids = ['sec-geometry', 'sec-params', 'sec-height', 'sec-classes', 'sec-fitting'];
if (sectionChunks.length !== 5) throw new Error('ожидалось 5 разделов, найдено ' + sectionChunks.length);

const sections = sectionChunks.map((c, i) => ({
  id: ids[i],
  title: c.title,
  content: tablify(c.content),
}));

const faqChunk = find(/^FAQ/i);
const faqList = [];
if (faqChunk) {
  const blocks = faqChunk.content.split(/\n\s*\n/);
  for (const b of blocks) {
    const m = b.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)$/);
    if (m) faqList.push({ question: m[1].trim(), answer: m[2].trim() });
  }
}

const conclusionChunk = find(/^Вывод эксперта/i);
const conclusion = conclusionChunk ? conclusionChunk.content.trim() : '';

const article = {
  id: ID,
  slug: SLUG,
  title: 'Как выбрать кресло для спины: 5 параметров и проверка по росту',
  subtitle: 'Почему мягкое сиденье не спасает поясницу и как примерять кресло, а не покупать по фото',
  excerpt:
    'Геометрия посадки по ГОСТ, расчёт «рост → высота сиденья и стола», пять параметров примерки и честные пределы кресла.',
  category: 'furniture',
  author: '__FT__',
  tags: ['Кресла', 'Эргономика', 'Осанка', 'Здоровье спины'],
  publishedAt: '02 ноября 2026',
  updatedAt: '02 ноября 2026',
  readTimeMin: 9,
  views: 0,
  heroImage: '/images/editorial/ergonomic-chair-desk.jpg',
  tableOfContents: sections.map((s) => ({ id: s.id, label: s.title })),
  sections,
  featuredProductIds: [
    'chair-budget-burokrat',
    'chair-chairman-795',
    'metta-samurai-s3',
    'sihoo-doro-c300',
    'chair-ergohuman-plus',
    'lumbar-cushion-memory',
    'ergonomic-footrest-adjustable',
  ],
  conclusion,
  faqList,
  seo: {
    metaTitle: 'Как выбрать кресло для спины: 5 параметров и проверка по росту',
    metaDescription:
      'Геометрия посадки, высота сиденья и стола по росту, пять параметров примерки кресла и честные пределы бюджетных моделей.',
    primaryKeyword: 'как выбрать кресло для спины',
    secondaryKeywords: [
      'кресло для спины дома',
      'эргономичное кресло для работы',
      'кресло с поясничной поддержкой',
      'высота сиденья кресла по росту',
    ],
  },
};

// сериализация в стиль бандла: ключи без кавычек, строки в бэктиках
const bt = (s) =>
  '`' +
  String(s)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/\n/g, '\\n') +
  '`';
const ser = (v) => {
  if (typeof v === 'string') return bt(v);
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return '[' + v.map(ser).join(',') + ']';
  return '{' + Object.keys(v).map((k) => k + ':' + ser(v[k])).join(',') + '}';
};

let bundle = fs.readFileSync(BUNDLE, 'utf8');
if (bundle.includes('id:`' + ID + '`')) {
  console.log('статья уже в бандле, вставка не нужна');
  process.exit(0);
}
const anchor = 'pt=[{id:`guide-work-life-balance-zen`';
const at = bundle.indexOf(anchor);
if (at < 0) throw new Error('не найден массив статей pt=[');
const insertAt = at + 'pt=['.length;
const literal = ser(article).replace("'__FT__'", 'ft');
bundle = bundle.slice(0, insertAt) + literal + ',' + bundle.slice(insertAt);
fs.writeFileSync(BUNDLE, bundle, 'utf8');
console.log('вставлено:', ID, '| разделов', sections.length, '| FAQ', faqList.length, '| знаков', literal.length);

// Метаданные для постпроцессора: без записи в seo-pages-*.json tools/seo-fix.js
// не тронет страницу и оставит ей описание, обрезанное пререндером с «…».
// Запись дописывается только если её ещё нет, поэтому повторный запуск безопасен.
const SEO_FILE = path.join(__dirname, 'seo-pages-c.json');
const seoPages = JSON.parse(fs.readFileSync(SEO_FILE, 'utf8'));
if (!seoPages[SLUG]) {
  const DEFAULT_RELATED = [
    ['/article/5-luchshih-ergonomichnyh-kresel-rejting/', 'Рейтинг 5 эргономичных кресел'],
    ['/article/ergonomika-rabochego-mesta-nastroyka/', 'Настройка места за 30 минут'],
    ['/article/podstavka-dlya-nog-pod-stol-ergonomika/', 'Подставка для ног и поясница'],
    ['/article/kronshtejn-dlya-monitora-ergonomika-shei/', 'Кронштейн и нагрузка на шею'],
  ];
  seoPages[SLUG] = {
    title: article.seo.metaTitle,
    desc: article.seo.metaDescription,
    // Тематические соседи важнее «случайных»: при сборке новой статьи
    // список стоит поправить вручную, если тема другая.
    related: article.related || DEFAULT_RELATED,
  };
  fs.writeFileSync(SEO_FILE, JSON.stringify(seoPages, null, 2) + String.fromCharCode(10), 'utf8');
  console.log('метаданные для seo-fix добавлены:', SLUG);
}
