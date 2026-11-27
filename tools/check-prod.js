// Проверка живого прода одной командой вместо ручного недельного чек-листа.
// Запуск: node tools/check-prod.js [--json] [--site https://kabinetdoma.ru]
// Только читает сеть: ничего не пишет в репозиторий и не выкладывает.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const argSite = (() => {
  const i = process.argv.indexOf('--site');
  return i > -1 ? process.argv[i + 1] : null;
})();
const SITE = (argSite || process.env.KD_SITE || 'https://kabinetdoma.ru').replace(/\/$/, '');
const HOST = new URL(SITE).host;
const JSON_OUT = process.argv.includes('--json');
const TIMEOUT = 15000;
const RETRY_DELAY = 1500;
const CONCURRENCY = 6;

const FORBIDDEN_HOSTS = ['mc.yandex.ru', 'fonts.googleapis.com', 'images.unsplash.com', 'ozon.ru'];
const SERVICES_404 = ['/docs/questions.md', '/AGENTS.md', '/tools/deploy-prod.sh', '/README.md'];

const checks = [];
const add = (group, label, status, detail = '') => checks.push({ group, label, status, detail });
const ok = (g, l, d) => add(g, l, 'ok', d);
const warn = (g, l, d) => add(g, l, 'warn', d);
const fail = (g, l, d) => add(g, l, 'fail', d);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Сеть: один повтор — единичный обрыв хостинга не должен давать ложную тревогу
// (три скачивания robots.txt роботом Google в T-130 остались без ответа).
async function get(url, { redirect = 'follow' } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        redirect,
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { 'user-agent': 'kd-check-prod/1.0 (+https://kabinetdoma.ru)' },
      });
      if (res.status >= 500 && attempt === 1) {
        lastError = new Error(`HTTP ${res.status}`);
        await sleep(RETRY_DELAY);
        continue;
      }
      return res;
    } catch (e) {
      lastError = e;
      if (attempt === 1) await sleep(RETRY_DELAY);
    }
  }
  throw lastError;
}

const locsOf = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].trim());
const localXml = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

async function checkSitemap() {
  const group = 'sitemap.xml';
  let localLocs;
  try {
    localLocs = locsOf(localXml('sitemap.xml'));
  } catch (e) {
    fail(group, 'локальный sitemap.xml читается', e.message);
    return [];
  }
  let res;
  try {
    res = await get(`${SITE}/sitemap.xml`);
  } catch (e) {
    fail(group, `${SITE}/sitemap.xml отвечает`, e.message);
    return localLocs;
  }
  if (res.status !== 200) {
    fail(group, 'sitemap.xml отвечает 200', `код ${res.status}`);
    return localLocs;
  }
  const remoteLocs = locsOf(await res.text());
  if (remoteLocs.length !== localLocs.length) {
    fail(group, 'число адресов совпадает с локальным', `на проде ${remoteLocs.length}, локально ${localLocs.length}`);
  } else {
    ok(group, 'число адресов совпадает с локальным', `${remoteLocs.length}`);
  }
  const missing = localLocs.filter((u) => !remoteLocs.includes(u));
  const extra = remoteLocs.filter((u) => !localLocs.includes(u));
  if (missing.length || extra.length) {
    const parts = [];
    if (missing.length) parts.push(`нет на проде: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ' …' : ''}`);
    if (extra.length) parts.push(`лишние на проде: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ' …' : ''}`);
    fail(group, 'адреса совпадают с локальным', parts.join('; '));
  } else {
    ok(group, 'адреса совпадают с локальным');
  }
  return localLocs;
}

async function checkUrls(locs) {
  const group = 'адреса';
  if (!locs.length) return;
  const bad = [];
  await mapLimit(locs, CONCURRENCY, async (url) => {
    try {
      const res = await get(url);
      if (res.status !== 200) bad.push(`${res.status} ${url}`);
    } catch (e) {
      bad.push(`${e.name === 'TimeoutError' ? 'таймаут' : 'ошибка сети'} ${url}`);
    }
  });
  if (bad.length) fail(group, `все ${locs.length} адресов отвечают 200`, `${bad.length} сбоев: ${bad.slice(0, 8).join(', ')}${bad.length > 8 ? ' …' : ''}`);
  else ok(group, `все ${locs.length} адресов отвечают 200`);
}

async function checkServices() {
  const group = 'служебные пути';
  for (const rel of SERVICES_404) {
    try {
      const res = await get(SITE + rel);
      if (res.status === 404) ok(group, `${rel} — 404`);
      else fail(group, `${rel} — 404`, `код ${res.status}: файл доступен из веба`);
    } catch (e) {
      fail(group, `${rel} — 404`, e.message);
    }
  }
  try {
    const res = await get(`${SITE}/.htaccess`);
    if (res.status === 403) ok(group, '/.htaccess — 403');
    else fail(group, '/.htaccess — 403', `код ${res.status}`);
  } catch (e) {
    fail(group, '/.htaccess — 403', e.message);
  }
}

async function checkRobots() {
  const group = 'robots.txt';
  try {
    const res = await get(`${SITE}/robots.txt`);
    if (res.status !== 200) return fail(group, 'robots.txt отвечает 200', `код ${res.status}`);
    const body = await res.text();
    if (!/^Sitemap:\s*https?:\/\/\S+/m.test(body)) fail(group, 'в robots.txt есть Sitemap:', 'строка не найдена');
    else ok(group, 'в robots.txt есть Sitemap:');
    if (/^Disallow:\s*\/\s*$/m.test(body)) fail(group, 'robots.txt не закрывает сайт', 'найден Disallow: /');
    else ok(group, 'robots.txt не закрывает сайт');
    const local = localXml('robots.txt');
    if (body.replace(/\r\n/g, '\n').trim() === local.replace(/\r\n/g, '\n').trim()) ok(group, 'содержимое совпадает с локальным', `${Buffer.byteLength(body)} Б`);
    else warn(group, 'содержимое совпадает с локальным', `на проде ${Buffer.byteLength(body)} Б, локально ${Buffer.byteLength(local)} Б`);
  } catch (e) {
    fail(group, 'robots.txt доступен', e.message);
  }
}

async function checkRedirects() {
  const group = 'редиректы';
  const cases = [
    { from: `http://${HOST}/catalog/`, to: `${SITE}/catalog/`, label: 'http → https' },
    { from: `https://www.${HOST}/catalog/`, to: `${SITE}/catalog/`, label: 'www → без www' },
  ];
  for (const c of cases) {
    try {
      const res = await get(c.from, { redirect: 'manual' });
      const loc = res.headers.get('location') || '';
      const absolute = loc.startsWith('http') ? loc : new URL(loc, c.from).toString();
      if (res.status === 301 && absolute === c.to) ok(group, `${c.label}: 301 на ${c.to}`);
      else fail(group, `${c.label}: 301 на ${c.to}`, `код ${res.status}, Location: ${loc || '—'}`);
    } catch (e) {
      fail(group, `${c.label}: 301 на ${c.to}`, e.message);
    }
  }
}

async function checkBundle() {
  const group = 'бандл';
  const local = path.join(root, 'assets/index.js');
  let localSize = 0;
  try {
    localSize = fs.statSync(local).size;
  } catch (e) {
    warn(group, 'локальный assets/index.js найден', e.message);
  }
  try {
    const res = await get(`${SITE}/assets/index.js`);
    if (res.status !== 200) return fail(group, 'assets/index.js отвечает 200', `код ${res.status}`);
    const remoteSize = Buffer.byteLength(await res.text());
    if (!localSize) return ok(group, 'assets/index.js отвечает 200', `${remoteSize} Б`);
    const diff = Math.abs(remoteSize - localSize) / localSize;
    if (diff > 0.05) fail(group, 'размер не расходится с локальным больше 5 %', `на проде ${remoteSize} Б, локально ${localSize} Б (${(diff * 100).toFixed(1)} %)`);
    else if (remoteSize !== localSize) warn(group, 'размер не расходится с локальным больше 5 %', `на проде ${remoteSize} Б, локально ${localSize} Б`);
    else ok(group, 'размер совпадает с локальным', `${remoteSize} Б`);
  } catch (e) {
    fail(group, 'assets/index.js доступен', e.message);
  }
}

async function checkExternal(locs) {
  const group = 'внешние домены';
  const article = locs.find((u) => /\/article\/[^/]+\/?$/.test(u));
  const pages = [`${SITE}/`, `${SITE}/catalog/`, article].filter(Boolean);
  for (const url of pages) {
    const label = new URL(url).pathname;
    try {
      const res = await get(url);
      if (res.status !== 200) {
        fail(group, `${label}: HTML отвечает 200`, `код ${res.status}`);
        continue;
      }
      const html = await res.text();
      const found = FORBIDDEN_HOSTS.filter((h) => html.includes(h));
      if (found.length) fail(group, `${label}: нет ${FORBIDDEN_HOSTS.join(', ')}`, `найдено: ${found.join(', ')}`);
      else ok(group, `${label}: нет внешних доменов`);
    } catch (e) {
      fail(group, `${label}: HTML доступен`, e.message);
    }
  }
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function main() {
  const locs = await checkSitemap();
  await checkUrls(locs);
  await checkServices();
  await checkRobots();
  await checkRedirects();
  await checkBundle();
  await checkExternal(locs);

  const fails = checks.filter((c) => c.status === 'fail');
  const warns = checks.filter((c) => c.status === 'warn');

  if (JSON_OUT) {
    console.log(JSON.stringify({
      site: SITE,
      at: new Date().toISOString(),
      summary: { checks: checks.length, ok: checks.length - fails.length - warns.length, warn: warns.length, fail: fails.length },
      checks,
    }, null, 2));
  } else {
    console.log(`Проверка прода ${SITE} · ${stamp()}`);
    let group = null;
    for (const c of checks) {
      if (c.group !== group) {
        group = c.group;
        console.log(`\n${group}:`);
      }
      const mark = c.status === 'ok' ? '✓' : c.status === 'warn' ? '!' : '✗';
      console.log(`  ${mark} ${c.label}${c.detail ? ` — ${c.detail}` : ''}`);
    }
    console.log(`\nИтог: проверок ${checks.length}, ошибок ${fails.length}, предупреждений ${warns.length}`);
    if (fails.length) console.log('Есть расхождения: прод требует внимания.');
    else if (warns.length) console.log('Ошибок нет, предупреждения стоит посмотреть глазами.');
    else console.log('Всё чисто: прод в порядке.');
  }
  process.exitCode = fails.length ? 1 : 0;
}

main().catch((e) => {
  console.error('Проверка упала:', e.message);
  process.exitCode = 1;
});
