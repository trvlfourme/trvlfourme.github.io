#!/usr/bin/env node
// Вопросы между чатами: читает и проверяет docs/questions.md.
//
//   node tools/questions.js                 — открытые вопросы
//   node tools/questions.js --chat контент  — только адресованные этому чату
//   node tools/questions.js --all           — вместе с закрытыми
//   node tools/questions.js --json          — машинный формат
//   node tools/questions.js --check         — проверка формата (exit 1 при ошибке)

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'docs', 'questions.md');
const ROLES = ['разработка', 'контент', 'продвижение'];
const STATUSES = ['открыт', 'закрыт'];
const HEAD = /^###\s+(Q-\d{3,})\s*·\s*(.+?)\s*→\s*(.+?)\s*·\s*(\d{4}-\d{2}-\d{2})\s*$/;
const FIELD = { статус: 'status', вопрос: 'question', ответ: 'answer', контекст: 'context' };

function parse(text) {
  const items = [];
  const errors = [];
  const seen = new Set();
  let cur = null;
  let field = null;
  let fenced = false;

  text.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*`{3,}/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (fenced) return;

    const m = line.match(HEAD);
    if (m) {
      if (seen.has(m[1])) errors.push(`${m[1]}: повтор ID (строка ${i + 1})`);
      seen.add(m[1]);
      cur = { id: m[1], from: m[2], to: m[3], date: m[4], status: '', question: '', answer: '', context: '', line: i + 1 };
      items.push(cur);
      field = null;
      return;
    }

    if (/^#{1,4}\s/.test(line)) {
      cur = null;
      field = null;
      return;
    }
    if (!cur) return;

    const f = line.match(/^\*\*(Статус|Вопрос|Ответ|Контекст):\*\*\s*(.*)$/);
    if (f) {
      field = FIELD[f[1].toLowerCase()];
      cur[field] = f[2].trim();
      return;
    }
    if (field && line.trim()) {
      cur[field] = cur[field] ? `${cur[field]} ${line.trim()}` : line.trim();
    }
  });

  for (const it of items) {
    if (!ROLES.includes(it.from)) errors.push(`${it.id}: неизвестный автор «${it.from}» (строка ${it.line})`);
    if (!ROLES.includes(it.to)) errors.push(`${it.id}: неизвестный адресат «${it.to}» (строка ${it.line})`);
    if (!STATUSES.includes(it.status)) errors.push(`${it.id}: статус должен быть «открыт» или «закрыт», сейчас «${it.status}»`);
    if (!it.question) errors.push(`${it.id}: пустой вопрос`);
    if (it.status === 'закрыт' && (!it.answer || it.answer === '—')) errors.push(`${it.id}: статус «закрыт», но ответа нет`);
    if (it.status === 'открыт' && it.answer && it.answer !== '—') errors.push(`${it.id}: есть ответ, но статус «открыт»`);
  }

  return { items, errors };
}

function wrap(text, width, indent) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if ((line + ' ' + w).length <= width) line += ' ' + w;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.map((l) => indent + l).join('\n');
}

function main(argv) {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('node tools/questions.js [--chat <роль>] [--all] [--json] [--check]');
    console.log('роли: ' + ROLES.join(', '));
    return 0;
  }
  const chatAt = args.indexOf('--chat');
  const chat = chatAt >= 0 ? String(args[chatAt + 1] || '').trim().toLowerCase() : '';
  const all = args.includes('--all');
  const json = args.includes('--json');
  const check = args.includes('--check');

  if (!fs.existsSync(FILE)) {
    console.error(`нет файла ${path.relative(process.cwd(), FILE)}`);
    return 1;
  }

  const { items, errors } = parse(fs.readFileSync(FILE, 'utf8'));
  const open = items.filter((it) => it.status === 'открыт');
  const shown = (all ? items : open).filter((it) => !chat || it.to.toLowerCase() === chat);

  if (json) {
    console.log(JSON.stringify({ file: path.relative(process.cwd(), FILE), total: items.length, open: open.length, items: shown, errors }, null, 2));
    return check && errors.length ? 1 : 0;
  }

  if (check) {
    if (errors.length) {
      console.log(`формат: ${errors.length} проблем(ы)`);
      for (const e of errors) console.log('  - ' + e);
      return 1;
    }
    console.log(`формат в порядке: ${items.length} вопросов, ${open.length} открытых`);
    return 0;
  }

  const scope = chat ? `, адресату «${chat}» — ${shown.length}` : '';
  console.log(`открытых ${open.length} из ${items.length}${scope}`);
  if (!shown.length) {
    console.log('  нет');
    return 0;
  }
  for (const it of shown) {
    console.log('');
    console.log(`${it.id} · ${it.from} → ${it.to} · ${it.date}${it.status === 'закрыт' ? ' · закрыт' : ''}`);
    console.log(wrap(it.question, 88, '  ?  '));
    if (it.context) console.log(wrap(it.context, 88, '     '));
    if (it.status === 'закрыт') console.log(wrap(it.answer, 88, '  !  '));
  }
  return 0;
}

process.exitCode = main(process.argv);
