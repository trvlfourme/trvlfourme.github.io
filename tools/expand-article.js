// Дополняет статью разделами и вопросами из content/expand/<id>.json
// Формат: { "sections": [{ "id": "...", "title": "...", "content": "..." }],
//           "faq": [{ "question": "...", "answer": "..." }] }
const fs = require('fs');
const path = require('path');
const { readBundle, parse, writeArticle } = require('./article-store');

const id = process.argv[2];
if (!id) throw new Error('укажите id статьи');
const base = path.resolve(__dirname, '..', 'content');
const files = [path.join(base, 'expand', id + '.json'), path.join(base, 'expand2', id + '.json')].filter((f) => fs.existsSync(f));
if (!files.length) throw new Error('нет файла дополнений для ' + id);
const patch = files.reduce((acc, f) => {
  const p = JSON.parse(fs.readFileSync(f, 'utf8'));
  acc.sections = acc.sections.concat(p.sections || []);
  acc.faq = acc.faq.concat(p.faq || []);
  return acc;
}, { sections: [], faq: [] });

const { obj } = parse(readBundle(), id);
let added = { sections: 0, faq: 0 };

for (const s of patch.sections || []) {
  if (obj.sections.some((x) => x.id === s.id)) continue;
  obj.sections.push(s);
  obj.tableOfContents.push({ id: s.id, label: s.title });
  added.sections++;
}
for (const q of patch.faq || []) {
  if (obj.faqList.some((x) => x.question === q.question)) continue;
  obj.faqList.push(q);
  added.faq++;
}
obj.updatedAt = '02 ноября 2026';

const size = writeArticle(id, obj);
console.log(id, '| разделов +' + added.sections, '| вопросов +' + added.faq, '| литерал', size);
