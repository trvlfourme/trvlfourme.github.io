// Собирает статью из content/<slug>.md и вставляет её в массив pt.
// Запуск: node tools/build-article-md.js content/имя.md
const fs = require('fs');
const path = require('path');
const { insertArticle } = require('./article-store');

const file = process.argv[2];
if (!file) throw new Error('укажите путь к markdown');
const raw = fs.readFileSync(file, 'utf8');
const parts = raw.split(/^---$/m);
if (parts.length < 3) throw new Error('нет frontmatter');
const meta = {};
for (const line of parts[1].split('\n')) {
  const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
  else if (/^\d+$/.test(v)) v = Number(v);
  else v = v.replace(/^"(.*)"$/, '$1');
  meta[m[1]] = v;
}
const body = parts.slice(2).join('---').trim();

const chunks = body.split(/^## /m).slice(1).map((c) => {
  const nl = c.indexOf('\n');
  return { title: c.slice(0, nl).trim(), content: c.slice(nl + 1).trim() };
});

// таблицы рендер не поддерживает — превращаем строки в список
function tablify(text) {
  const out = [];
  for (const line of text.split('\n')) {
    if (!/^\|/.test(line.trim())) { out.push(line); continue; }
    const cells = line.split('|').map((s) => s.trim()).filter(Boolean);
    if (!cells.length || /^-+$/.test(cells[0]) || /^(рост|высота роста)/i.test(cells[0])) continue;
    out.push('- **' + cells[0] + ':** ' + cells.slice(1).join(', ') + '.');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const isFaq = (t) => /^FAQ/i.test(t);
const isConclusion = (t) => /^Вывод эксперта/i.test(t);
const isProducts = (t) => /^Привязка товаров/i.test(t);

const sectionChunks = chunks.filter((c) => !isFaq(c.title) && !isConclusion(c.title) && !isProducts(c.title));
const sections = sectionChunks.map((c, i) => ({
  id: 'sec-' + (i + 1),
  title: c.title,
  content: tablify(c.content),
}));

const faqChunk = chunks.find((c) => isFaq(c.title));
const faqList = [];
if (faqChunk) {
  for (const b of faqChunk.content.split(/\n\s*\n/)) {
    const m = b.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)$/);
    if (m) faqList.push({ question: m[1].trim(), answer: m[2].trim() });
  }
}
const conclusionChunk = chunks.find((c) => isConclusion(c.title));

const article = {
  id: meta.id,
  slug: meta.slug,
  title: meta.title,
  subtitle: meta.subtitle,
  excerpt: meta.excerpt,
  category: meta.category,
  author: { __ft: true },
  tags: meta.tags || [],
  publishedAt: meta.publishedAt,
  updatedAt: meta.publishedAt,
  readTimeMin: meta.readTimeMin || Math.max(5, Math.round(body.split(/\s+/).length / 180)),
  views: 0,
  heroImage: meta.heroImage,
  tableOfContents: sections.map((s) => ({ id: s.id, label: s.title })),
  sections,
  featuredProductIds: meta.products || [],
  blockTitle: meta.blockTitle || '',
  conclusion: conclusionChunk ? conclusionChunk.content.trim() : '',
  faqList,
  seo: {
    metaTitle: meta.title,
    metaDescription: meta.excerpt,
    primaryKeyword: meta.primaryKeyword || '',
    secondaryKeywords: meta.secondaryKeywords || [],
  },
};

const added = insertArticle(article);
console.log((added ? 'вставлено: ' : 'уже есть: ') + meta.id, '| разделов', sections.length, '| faq', faqList.length);
