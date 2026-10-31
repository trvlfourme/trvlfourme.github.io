// Патч логики промпта генерации статей в минифицированном бандле.
// Каждая замена проверяется по числу вхождений: если бандл другой — скрипт упадёт, а не испортит файл.
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'assets', 'index.js');
const backupDir = path.join(__dirname, '_originals');
fs.mkdirSync(backupDir, { recursive: true });
const bkp = path.join(backupDir, 'index.js');
if (!fs.existsSync(bkp)) fs.copyFileSync(file, bkp);

let src = fs.readFileSync(file, 'utf8');

// В бандле переносы внутри шаблонных строк записаны как \n (два символа) — вставляем так же.
const N = '\\n';

const SYS =
  'Ты — главный редактор экспертного портала «Кабинет Дома» (kabinetdoma.ru). ' +
  'Пишешь прикладные статьи для удалённых сотрудников и родителей в РФ. ' +
  'Отвечай только валидным JSON по заданной схеме, без markdown-обёрток и пояснений. ' +
  'Все id разделов — латиница в kebab-case. Не выдумывай цены, бренды и исследования.';

// Дополнительный контекст, который раньше терялся: SEO-ключ, теги, предыдущая версия статьи.
const EXTRA =
  N + N + 'Главный SEO-запрос (используй дословно в title, в первом абзаце и в подзаголовке одного из разделов): "${a||t}".' +
  N + 'Дополнительные ключи: ${r&&r.length?r.join(", "):`—`}' +
  N + '${c?`Предыдущая версия статьи — перепиши её, устранив замечания и повторы, но не теряя проверенные факты:' + N + '"${String(c).slice(0,4000)}"`:``}';

const patches = [
  {
    name: 'travel-режим больше не включается словом «недорогой/дорого»',
    from: '/поездк|путешеств|отпуск|дорог|командировк',
    to: '/поездк|путешеств|отпуск|в дороге|командировк',
    count: 3,
  },
  {
    name: 'balance-режим больше не включается подстрокой «сон» (персона, сонный)',
    from: '|психолог|сон|тайм-менеджмент|',
    to: '|психолог|недосып|тайм-менеджмент|',
    count: 3,
  },
  {
    name: 'жёсткие правила структуры, длины, разметки и запрет выдуманных цифр',
    from: '- Добавь FAQ из 3 насущных вопросов.',
    to:
      '- Добавь FAQ из 3 насущных вопросов.' + N +
      '- Объём: 900–1200 слов живой экспертной прозы, без воды и повторов.' + N +
      '- Идентификаторы в sections и tableOfContents — только латиница, цифры и дефис (kebab-case), например "height-calculation". Оглавление обязано совпадать с разделами по id, порядку и количеству.' + N +
      '- Не выдумывай цены, бренды, модели и исследования. Если точных данных нет — дай диапазон или принцип выбора вместо конкретной цифры.' + N +
      '- Не вставляй в текст служебные пометки, названия полей и мета-описания разделов.' + N +
      '- Разметка: используй только ## и ### для подзаголовков, "- " для списков, "1. " для нумерованных пунктов, "> " для цитат и метки ⚠️ / 💡 / 🎯 в начале строки для важных акцентов. Не используй **жирный**, *курсив*, таблицы и HTML — они не отрендерятся.',
    count: 1,
  },
  {
    name: 'SEO-ключ, теги и предыдущая версия в промпте + systemInstruction и maxOutputTokens',
    from: 'contents:f,config:{responseMimeType:`application/json`,responseSchema:p,temperature:.7',
    to:
      'contents:f+`' + EXTRA + '`,config:{systemInstruction:`' + SYS +
      '`,responseMimeType:`application/json`,responseSchema:p,temperature:.7,maxOutputTokens:8192',
    count: 1,
  },
];

let failed = false;
for (const p of patches) {
  const found = src.split(p.from).length - 1;
  const ok = found === p.count;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${p.name} — вхождений ${found}, ожидалось ${p.count}`);
  if (!ok) failed = true;
  else src = src.split(p.from).join(p.to);
}

if (failed) {
  console.error('\nНичего не записано: структура бандла не совпала с ожидаемой (возможно, патч уже применён).');
  process.exit(1);
}
fs.writeFileSync(file, src);
console.log(`\nзаписано assets/index.js, размер ${src.length} символов`);
