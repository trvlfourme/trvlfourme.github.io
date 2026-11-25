#!/usr/bin/env node
// Доска координации чатов: читает и проверяет docs/questions.md.
// Формат описан в шапке docs/questions.md: записи T-NNN (задачи), Q-NNN (вопросы), поля
// **Метка:**/**Статус:**/**Приоритет:**; критичное показывается сверху.
//
//   node tools/questions.js                 — доска: активные задачи и открытые вопросы
//   node tools/questions.js --tasks         — только задачи
//   node tools/questions.js --chat контент  — только то, что адресовано этому чату (лок — отдельной строкой)
//   node tools/questions.js --all           — вместе с закрытыми
//   node tools/questions.js --json          — машинный формат
//   node tools/questions.js --check         — проверка формата (exit 1 при ошибке)

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'docs', 'questions.md');
const ROLES = ['разработка', 'контент', 'продвижение', 'иб'];
// адресат «владелец»: это не чат, а действие владельца (доступы, кабинет, разрешение)
const OWNER = 'владелец';
const ASSIGNEES = [...ROLES, OWNER];
const LABELS = ['разработка', 'контент', 'продвижение', 'иб', 'деплой', 'сборка', 'блокер'];
// приоритет активной задачи: от «горит» до «потом», порядок здесь — это и порядок показа
const PRIORITIES = ['критичный', 'важный', 'стандартный', 'дополнительный'];
const TASK_STATUSES = ['открыта', 'в работе', 'закрыта'];
const Q_STATUSES = ['открыт', 'закрыт'];
const Q_HEAD = /^###\s+(Q-\d{3,})\s*·\s*(.+?)\s*→\s*(.+?)\s*·\s*(\d{4}-\d{2}-\d{2})\s*$/;
const T_HEAD = /^###\s+(T-\d{3,})\s*·\s*(.+?)\s*·\s*(\d{4}-\d{2}-\d{2})\s*$/;
const DUE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// сегодняшняя дата в местном времени, ГГГГ-ММ-ДД
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// дата выпуска: задача доступна, когда она уже наступила (или не задана)
function ready(it) {
  return !it.release || it.release === '—' || it.release <= today();
}
// когда «Выпуск» — фиксированное начало, а когда дата выхода готовой работы:
// регулярная проверка и отложенный разбор начинаются не раньше дня в «Выпуск»;
// у статьи дедлайн «До» стоит раньше выпуска — значит готовить можно заранее.
function fixedStart(it) {
  if (!it.release || it.release === '—') return false;
  if (it.regularity) return true;
  if (!it.due || it.due === '—') return true;
  return it.due.slice(0, 10) >= it.release;
}
// для показа: критичное сверху, внутри приоритета — по сроку
function rank(it) {
  const i = PRIORITIES.indexOf(it.priority);
  return i < 0 ? PRIORITIES.length : i;
}

const FIELD = {
  статус: 'status',
  метка: 'label',
  приоритет: 'priority',
  кому: 'to',
  задача: 'task',
  итог: 'result',
  до: 'due',
  выпуск: 'release',
  регулярность: 'regularity',
  взял: 'taken',
  вопрос: 'question',
  ответ: 'answer',
  контекст: 'context',
};

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

    const q = line.match(Q_HEAD);
    const t = line.match(T_HEAD);
    if (q || t) {
      const id = (q || t)[1];
      if (seen.has(id)) errors.push(`${id}: повтор ID (строка ${i + 1})`);
      seen.add(id);
      cur = {
        kind: q ? 'Q' : 'T',
        id,
        from: (q ? q[2] : t[2]).trim(),
        to: q ? q[3].trim() : '',
        date: (q ? q[4] : t[3]).trim(),
        status: '',
        label: '',
        priority: '',
        task: '',
        question: '',
        answer: '',
        result: '',
        context: '',
        due: '',
        release: '',
        regularity: '',
        taken: '',
        line: i + 1,
      };
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

    const f = line.match(/^\*\*(Статус|Метка|Приоритет|Кому|Задача|Итог|До|Выпуск|Регулярность|Взял|Вопрос|Ответ|Контекст):\*\*\s*(.*)$/);
    if (f) {
      field = FIELD[f[1].toLowerCase()];
      cur[field] = f[2].trim();
      return;
    }
    if (field && line.trim()) {
      cur[field] = cur[field] ? `${cur[field]} ${line.trim()}` : line.trim();
    }
  });

  const now = new Date();
  for (const it of items) {
    if (!ASSIGNEES.includes(it.from)) errors.push(`${it.id}: неизвестный автор «${it.from}» (строка ${it.line})`);
    if (it.kind === 'Q') {
      if (!ASSIGNEES.includes(it.to)) errors.push(`${it.id}: неизвестный адресат «${it.to}» (строка ${it.line})`);
      if (!Q_STATUSES.includes(it.status)) errors.push(`${it.id}: статус должен быть «открыт» или «закрыт», сейчас «${it.status}»`);
      if (!it.question) errors.push(`${it.id}: пустой вопрос`);
      if (it.status === 'закрыт' && (!it.answer || it.answer === '—')) errors.push(`${it.id}: статус «закрыт», но ответа нет`);
      if (it.status === 'открыт' && it.answer && it.answer !== '—') errors.push(`${it.id}: есть ответ, но статус «открыт»`);
      continue;
    }

    if (!LABELS.includes(it.label)) errors.push(`${it.id}: метка должна быть одной из ${LABELS.join(', ')}, сейчас «${it.label}»`);
    if (!TASK_STATUSES.includes(it.status)) errors.push(`${it.id}: статус должен быть «открыта», «в работе» или «закрыта», сейчас «${it.status}»`);
    if (it.priority && !PRIORITIES.includes(it.priority)) {
      errors.push(`${it.id}: приоритет должен быть одним из ${PRIORITIES.join(', ')}, сейчас «${it.priority}»`);
    }
    if (it.status !== 'закрыта' && !it.priority) {
      errors.push(`${it.id}: нет поля «Приоритет» — у незакрытой задачи оно обязательно: ${PRIORITIES.join(', ')}`);
    }
    if (!it.task) errors.push(`${it.id}: пустая задача`);
    if (it.to && !ASSIGNEES.includes(it.to)) errors.push(`${it.id}: неизвестный адресат «${it.to}»`);
    if (it.status === 'закрыта' && (!it.result || it.result === '—')) errors.push(`${it.id}: закрыта без итога`);
    if (it.status !== 'закрыта' && it.result && it.result !== '—') errors.push(`${it.id}: есть итог, но статус «${it.status}»`);
    if (it.status === 'в работе' && !it.taken) errors.push(`${it.id}: в работе без поля «Взял» (роль и время)`);
    if (it.taken && it.taken !== '—') {
      const role = it.taken.split(',')[0].trim().toLowerCase();
      if (!ROLES.includes(role)) {
        errors.push(`${it.id}: в «Взял» неизвестная роль «${role}» (допустимо: ${ROLES.join(', ')})`);
      }
    }
    if (it.release && it.release !== '—') {
      if (!DATE.test(it.release)) errors.push(`${it.id}: поле «Выпуск» должно быть «ГГГГ-ММ-ДД» или «—»`);
      else if (it.status === 'в работе' && fixedStart(it) && it.release > today()) {
        errors.push(`${it.id}: «Выпуск» ${it.release} — раньше этого дня не начинают (проверка/отложенный разбор)`);
      }
    }
    if (it.status !== 'закрыта' && it.regularity && (!it.release || it.release === '—')) {
      errors.push(`${it.id}: регулярная задача без «Выпуск» — поставьте дату следующей проверки (ГГГГ-ММ-ДД), иначе период не проверить`);
    }
    if (it.due && it.due !== '—') {
      if (!DUE.test(it.due)) errors.push(`${it.id}: поле «До» должно быть «ГГГГ-ММ-ДД ЧЧ:ММ» или «—»`);
      else if (it.status !== 'закрыта' && new Date(it.due.replace(' ', 'T') + ':00') < now) {
        errors.push(`${it.id}: пометка просрочена (${it.due}) — закройте запись или продлите «До»`);
      }
    }
  }

  // одна задача в работе на роль: следующую берут только после закрытия текущей
  const inWork = new Map();
  for (const it of items) {
    if (it.kind !== 'T' || it.status !== 'в работе') continue;
    if (isLock(it)) continue; // лок сборки/деплоя — отдельная запись, не вторая задача роли
    const who = it.to || it.from;
    if (who === OWNER) continue;
    inWork.set(who, [...(inWork.get(who) || []), it.id]);
  }
  for (const [who, ids] of inWork) {
    if (ids.length > 1) {
      errors.push(`у роли «${who}» в работе ${ids.length} задачи (${ids.join(', ')}) — берите по одной: закройте текущую и перечитайте доску`);
    }
  }

  return { items, errors };
}

function isLock(it) {
  return it.kind === 'T' && it.status === 'в работе' && (it.label === 'деплой' || it.label === 'сборка');
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

function head(it) {
  const bits = [it.id, it.kind === 'Q' ? `${it.from} → ${it.to}` : it.from];
  bits.push(it.date, it.label ? `метка «${it.label}»` : '', it.priority ? `приоритет ${it.priority}` : '', it.status);
  if (it.to && it.kind === 'T') bits.push(`кому: ${it.to}`);
  if (it.status === 'в работе' && it.taken) bits.push(`взял: ${it.taken}`);
  if (it.due && it.due !== '—') bits.push(`до ${it.due}`);
  if (it.release && it.release !== '—') bits.push(`${it.regularity ? 'проверка' : 'выпуск'} ${it.release}`);
  return bits.filter(Boolean).join(' · ');
}

function show(items) {
  for (const it of items) {
    console.log('');
    console.log((isLock(it) ? '⚠ ЛОК  ' : '') + head(it));
    console.log(wrap(it.kind === 'Q' ? it.question : it.task, 86, '   '));
    if (it.context) console.log(wrap(it.context, 86, '   '));
    if (it.status === 'закрыта') console.log(wrap(`итог: ${it.result}`, 86, '   '));
    if (it.status === 'закрыт') console.log(wrap(`ответ: ${it.answer}`, 86, '   '));
  }
}

function main(argv) {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('node tools/questions.js [--tasks] [--chat <роль>] [--all] [--json] [--check]');
    console.log('роли: ' + ROLES.join(', ') + ' · адресат: ' + OWNER + ' · метки: ' + LABELS.join(', '));
    console.log('--chat принимает только роль или владельца; активный лок — отдельная строка, а не задача роли');
    console.log('приоритеты (только у незакрытых задач): ' + PRIORITIES.join(', '));
    console.log('«Выпуск» — фиксированная дата выпуска или следующей регулярной проверки, не сдвигается;');
    console.log('«До» — дедлайн: обычную задачу берут раньше срока, если нет блокеров.');
    return 0;
  }
  const chatAt = args.indexOf('--chat');
  const chat = chatAt >= 0 ? String(args[chatAt + 1] || '').trim().toLowerCase() : '';
  const all = args.includes('--all');
  const onlyTasks = args.includes('--tasks');
  const json = args.includes('--json');
  const check = args.includes('--check');

  if (!fs.existsSync(FILE)) {
    console.error(`нет файла ${path.relative(process.cwd(), FILE)}`);
    return 1;
  }

  if (chatAt >= 0 && !chat) {
    console.error(`--chat: укажите роль — ${ASSIGNEES.join(', ')}`);
    return 1;
  }
  if (chatAt >= 0 && !ASSIGNEES.includes(chat)) {
    console.error(`--chat: неизвестная роль «${chat}» — допустимо: ${ASSIGNEES.join(', ')}`);
    return 1;
  }

  const { items, errors } = parse(fs.readFileSync(FILE, 'utf8'));
  const tasks = items.filter((it) => it.kind === 'T');
  const questions = items.filter((it) => it.kind === 'Q');
  const activeTasks = tasks.filter((it) => it.status !== 'закрыта');
  const openQuestions = questions.filter((it) => it.status === 'открыт');
  const locks = activeTasks.filter(isLock);

  if (json) {
    console.log(
      JSON.stringify(
        {
          file: path.relative(process.cwd(), FILE),
          counts: { tasks: tasks.length, active: activeTasks.length, questions: questions.length, open: openQuestions.length },
          locks: locks.map((it) => ({ id: it.id, label: it.label, due: it.due, taken: it.taken, task: it.task })),
          items,
          errors,
        },
        null,
        2
      )
    );
    return check && errors.length ? 1 : 0;
  }

  if (check) {
    if (errors.length) {
      console.log(`формат: ${errors.length} проблем(ы)`);
      for (const e of errors) console.log('  - ' + e);
      return 1;
    }
    const byPriority = PRIORITIES.map((p) => `${p} ${activeTasks.filter((it) => it.priority === p).length}`).join(', ');
    console.log(`формат в порядке: задач ${tasks.length} (активных ${activeTasks.length}), вопросов ${questions.length} (открытых ${openQuestions.length})`);
    console.log(`активные по приоритету: ${byPriority}`);
    return 0;
  }

  // лок — общепроектная пометка: показывается отдельной строкой и не считается задачей роли
  const mine = (it) => !chat || it.to === chat || (it.kind === 'T' && !it.to && it.from === chat);
  // сначала то, что можно брать сейчас; внутри — по приоритету и сроку.
  // Ждёт своей даты только регулярная проверка: у неё фиксирован период. Плановую статью
  // можно готовить заранее — её держит дедлайн «До», а не дата выхода.
  const waiting = (it) => (it.status === 'открыта' && fixedStart(it) && !ready(it) ? 1 : 0);
  const takeable = (it) => it.status === 'открыта' && !waiting(it);
  const shownTasks = (all ? tasks : activeTasks)
    .filter((it) => !isLock(it))
    .filter(mine)
    .sort(
      (a, b) =>
        waiting(a) - waiting(b) ||
        rank(a) - rank(b) ||
        String(a.due || '9999').localeCompare(String(b.due || '9999'))
    );
  const shownQuestions = onlyTasks ? [] : (all ? questions : openQuestions).filter(mine);

  const scope = chat ? ` · адресату «${chat}»` : '';
  console.log(
    `задачи: ${shownTasks.length}${all ? '' : ' активных'} · вопросы: ${onlyTasks ? 'скрыты (--tasks)' : shownQuestions.length + (all ? '' : ' открытых')}${scope}`
  );
  if (locks.length) console.log(`⚠ активный лок (общепроектный, не задача роли): ${locks.map((l) => `${l.id} (${l.label}, до ${l.due || 'не указано'}, взял: ${l.taken || '—'})`).join(', ')}`);

  if (!shownTasks.length && !shownQuestions.length) {
    console.log('  нет');
    return 0;
  }
  if (chat && !all) {
    const free = shownTasks.filter(takeable);
    const later = shownTasks.filter((it) => it.status === 'открыта' && waiting(it));
    if (free.length) console.log(`можно брать сейчас (сверху — приоритетнее): ${free.map((it) => it.id).join(', ')}`);
    if (later.length) console.log(`ждут своей даты: ${later.map((it) => `${it.id} с ${it.release}`).join(', ')}`);
    if (!free.length && later.length) console.log('на сегодня брать нечего: всё ждёт своей даты');
  }
  show(shownTasks);
  if (shownQuestions.length) {
    console.log('');
    console.log('--- вопросы ---');
    show(shownQuestions);
  }
  return 0;
}

process.exitCode = main(process.argv);
