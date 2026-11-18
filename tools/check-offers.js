#!/usr/bin/env node
// check-offers.js — прогон всех партнёрских офферов каталога: сеть, маркировка, цена.
// Ничего не пишет в репозиторий и не выкладывает: только читает данные и печатает отчёт.
//
// Запуск:
//   node tools/check-offers.js                 — полный прогон, отчёт человеку
//   node tools/check-offers.js --json           — тот же отчёт машинным чтением
//   node tools/check-offers.js --only-id <id>   — один товар (например, после правки ссылки)
//   node tools/check-offers.js --data <dir>     — взять данные из другой папки (проверка самого скрипта)
//   node tools/check-offers.js --no-net         — только проверки данных, без сети
//   node tools/check-offers.js --timeout 8000   — таймаут одного запроса в миллисекундах
//   таймаут и 5xx повторяются один раз: если ссылка жива, шума в отчёте не будет
//
// Код выхода: 0 — подозрительных нет, 1 — что-то найдено (годится для cron), 2 — нет данных.
//
// Что считается подозрительным:
//   сеть: 4xx/5xx, таймаут, DNS-ошибка, редирект не на маркетплейс;
//   маркировка: kind "card" без erid или без рекламодателя, erid в данных, но не в ссылке
//     (`erid=`), erid у kind "search" (так быть не должно);
//   цена: price_rub не целое больше нуля, price_mode не hidden/note, при hidden есть пометка,
//     при note пустая пометка;
//   прочее: оффер с пустым url или неизвестным store, живой оффер у архивного товара,
//     один erid на разных ссылках.
//
// Отсутствие сети — отдельная строка в отчёте: такие ссылки не попадают в подозрительные,
// иначе пропавший Wi-Fi выглядел бы как 51 битая ссылка.
//
// Логика цены и маркировки повторена из tools/verify-build.js (там те же правила, но без сети).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const dns = require('dns');
const http = require('http');
const https = require('https');

const ROOT = path.join(__dirname, '..');

const STORES = ['yandex', 'ozon', 'wb'];
const MARKETPLACES = [
  'market.yandex.ru',
  'yandex.ru',
  'ozon.ru',
  'wildberries.ru',
  'wb.ru',
  'market.yandex.com',
];
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// ── аргументы ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function flag(name) {
  const i = argv.indexOf(name);
  return i === -1 ? '' : argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
}
const onlyId = flag('--only-id');
const dataDir = path.resolve(ROOT, flag('--data') || 'data');
const timeoutMs = Number(flag('--timeout')) > 0 ? Number(flag('--timeout')) : 8000;
const jsonOut = argv.includes('--json');
const noNet = argv.includes('--no-net');

// ── данные ─────────────────────────────────────────────────────────────────
function loadWindowFile(rel) {
  const file = path.join(dataDir, rel);
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: rel });
  return sandbox.window;
}

let catalog;
let links;
try {
  catalog = loadWindowFile('catalog.js').KD_CATALOG || {};
  links = loadWindowFile('product-links.js').KD_PRODUCT_LINKS || {};
} catch (e) {
  console.error(`нет данных в ${dataDir}: ${e.message}`);
  process.exit(2);
}

const products = (catalog.products || []).filter((p) => !onlyId || p.id === onlyId);
if (!products.length) {
  console.error(onlyId ? `товара ${onlyId} нет в каталоге` : 'каталог пуст');
  process.exit(2);
}

// ── проверки данных (без сети) ─────────────────────────────────────────────
const findings = [];
const noPrice = [];
function add(id, store, url, problem) {
  findings.push({ id, store: store || '—', url: url || '—', problem });
}

const eridUse = new Map();
const targets = []; // { id, store, url, kind }

function checkOffer(product, offer) {
  const id = product.id;
  const url = offer.url || '';
  if (!url) add(id, offer.store, url, 'пустой url у оффера');
  if (!STORES.includes(offer.store)) add(id, offer.store, url, `неизвестный магазин «${offer.store}»`);
  if (url) {
    targets.push({ id, store: offer.store, url, kind: offer.kind });
    if (!/^https:\/\//i.test(url)) add(id, offer.store, url, 'ссылка не по https');
  }

  if (offer.kind === 'card') {
    if (url && /\/search|search\?/.test(url)) add(id, offer.store, url, 'kind «card», но ссылка поисковая');
    if (!offer.erid) add(id, offer.store, url, 'оффер «card» без erid — реклама не маркирована');
    if (offer.erid && !offer.advertiser) add(id, offer.store, url, 'есть erid, но не указан рекламодатель');
    if (offer.erid && !/erid=/.test(url)) add(id, offer.store, url, 'erid есть в данных, но не в ссылке');
    if (!url) add(id, offer.store, url, 'оффер «card» без ссылки');
  }
  if (offer.kind === 'search') {
    if (offer.erid) add(id, offer.store, url, 'у поисковой ссылки не должно быть erid');
    if (!url) add(id, offer.store, url, 'оффер «search» без ссылки');
  }
  if (offer.kind !== 'card' && offer.kind !== 'search') {
    add(id, offer.store, url, `неизвестный kind «${offer.kind || '—'}»`);
  }
  if (offer.erid) {
    if (!eridUse.has(offer.erid)) eridUse.set(offer.erid, new Map());
    eridUse.get(offer.erid).set(url, `${id}/${offer.store}`);
  }
}

function checkPrice(product) {
  const id = product.id;
  if (!['hidden', 'note'].includes(product.price_mode)) {
    add(id, '—', '—', `price_mode «${product.price_mode || '—'}»: можно только hidden или note`);
  }
  if (product.price_mode === 'hidden' && product.price_note) {
    add(id, '—', '—', 'при price_mode hidden пометка о цене не выводится');
  }
  if (product.price_mode === 'note' && !product.price_note) {
    add(id, '—', '—', 'price_mode note без текста пометки');
  }
  // Цена необязательна (как и в verify-build): важно, что если она задана, то корректна.
  if ('price_rub' in product) {
    const price = product.price_rub;
    if (typeof price !== 'number' || !Number.isInteger(price) || price <= 0) {
      add(id, '—', '—', `price_rub «${price}»: нужно целое больше нуля`);
    }
  } else {
    noPrice.push(id);
  }
}

for (const product of products) {
  checkPrice(product);
  const offers = product.offers || [];
  if (product.archived && offers.length) {
    add(product.id, '—', '—', `архивный товар с ${offers.length} живыми офферами`);
  }
  if (!product.archived && !offers.length) add(product.id, '—', '—', 'у товара нет ни одного оффера');
  for (const offer of offers) checkOffer(product, offer);
}

// ссылки из product-links.js: их тоже открывает покупатель, значит проверяем сетью
for (const product of products) {
  const row = links[product.id];
  if (!row) continue;
  for (const store of STORES) {
    const url = typeof row[store] === 'string' ? row[store].trim() : '';
    if (!url) continue;
    targets.push({ id: product.id, store: `${store} (product-links)`, url, kind: 'link' });
    if (!/erid=/.test(url)) add(product.id, store, url, 'партнёрская ссылка без erid в адресе');
  }
}

for (const [erid, byUrl] of eridUse) {
  if (byUrl.size > 1) {
    add('—', '—', `erid ${erid}`, `один erid на ${byUrl.size} разных ссылках: ${[...byUrl.values()].join(', ')}`);
  }
}

// ── сеть ───────────────────────────────────────────────────────────────────
function probeUrl(url) {
  return new Promise((resolve) => {
    let u;
    try {
      u = new URL(url);
    } catch (e) {
      resolve({ error: 'URL', message: e.message });
      return;
    }
    const mod = u.protocol === 'http:' ? http : https;
    let settled = false;
    const finish = (r) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    const request = (method, onStatus) => {
      const req = mod.request(
        u,
        { method, headers: { 'User-Agent': USER_AGENT, Accept: '*/*' }, timeout: timeoutMs },
        (res) => {
          const result = { status: res.statusCode, location: res.headers.location || '' };
          res.resume();
          res.destroy();
          req.destroy();
          finish(result);
        }
      );
      req.on('timeout', () => {
        req.destroy();
        finish({ error: 'TIMEOUT', message: `нет ответа за ${timeoutMs} мс` });
      });
      req.on('error', (e) => finish({ error: e.code || 'ERROR', message: e.message }));
      req.end();
      return req;
    };

    const req = mod.request(
      u,
      { method: 'HEAD', headers: { 'User-Agent': USER_AGENT, Accept: '*/*' }, timeout: timeoutMs },
      (res) => {
        const status = res.statusCode;
        if ([403, 405, 501].includes(status)) {
          res.resume();
          res.destroy();
          req.destroy();
          // HEAD не любят CDN: повторяем GET, тело не читаем
          request('GET');
          return;
        }
        const result = { status, location: res.headers.location || '' };
        res.resume();
        res.destroy();
        req.destroy();
        finish(result);
      }
    );
    req.on('timeout', () => {
      req.destroy();
      finish({ error: 'TIMEOUT', message: `нет ответа за ${timeoutMs} мс` });
    });
    req.on('error', (e) => finish({ error: e.code || 'ERROR', message: e.message }));
    req.end();
  });
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

function isMarketplace(url) {
  const host = hostOf(url);
  return MARKETPLACES.some((m) => host === m || host.endsWith(`.${m}`));
}

async function probeMany(list, limit) {
  const out = new Map();
  let i = 0;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const workers = Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (i < list.length) {
      const item = list[i++];
      let res = await probeUrl(item.url);
      // таймаут и 5xx часто плавают на CDN: одна повторная попытка гасит ложные тревоги
      const flaky = res.error === 'TIMEOUT' || res.error === 'ECONNRESET' || (res.status >= 500);
      if (flaky) {
        await sleep(1500);
        res = await probeUrl(item.url);
      }
      out.set(item.url, res);
    }
  });
  await Promise.all(workers);
  return out;
}

async function networkUp(hosts) {
  const unique = [...new Set(hosts)].filter(Boolean);
  for (const host of unique) {
    const ok = await new Promise((resolve) => {
      dns.lookup(host, { all: false }, (err) => resolve(!err));
    });
    if (ok) return true;
  }
  return false;
}

(async () => {
  let netSkipped = '';
  if (!noNet) {
    const ok = await networkUp(targets.map((t) => hostOf(t.url)));
    if (!ok) {
      netSkipped = 'сети нет: DNS не отвечает, проверка ссылок пропущена (это не битые ссылки)';
    } else {
      const uniqueTargets = [...new Map(targets.map((t) => [t.url, t])).values()];
      const results = await probeMany(uniqueTargets, 5);

      for (const [url, res] of results) {
        const owners = targets.filter((t) => t.url === url);
        const id = owners[0].id;
        const store = owners[0].store;
        if (!res) continue;
        if (res.error) {
          const code = res.error === 'TIMEOUT' ? 'таймаут' : res.error;
          if (['ENOTFOUND', 'EAI_AGAIN', 'EAI_FAIL'].includes(res.error)) {
            add(id, store, url, `DNS: адрес не разрешается (${code})`);
          } else {
            add(id, store, url, `сеть: ${code}${res.message ? ` — ${res.message}` : ''}`);
          }
          continue;
        }
        if (res.status >= 400) {
          add(id, store, url, `HTTP ${res.status}`);
          continue;
        }
        if (res.status >= 300) {
          const to = res.location ? new URL(res.location, url).href : '';
          if (!to) add(id, store, url, `HTTP ${res.status} без Location`);
          else if (!isMarketplace(to)) add(id, store, url, `редирект ${res.status} не на маркетплейс: ${hostOf(to) || to}`);
        }
      }
    }
  }

  // ── отчёт ────────────────────────────────────────────────────────────────
  const checked = targets.length;
  const suspicious = findings.length;

  if (jsonOut) {
    console.log(
      JSON.stringify(
        {
          dataDir,
          onlyId: onlyId || null,
          network: noNet ? 'skipped' : netSkipped ? 'down' : 'ok',
          note: netSkipped || undefined,
          products: products.length,
          checked,
          suspicious,
          withoutPrice: noPrice,
          findings,
        },
        null,
        2
      )
    );
  } else {
    console.log(`проверка офферов: товаров ${products.length}, ссылок ${checked}, режим ${noNet ? 'без сети' : 'сеть + данные'}`);
    if (netSkipped) console.log(`  ${netSkipped}`);
    if (noPrice.length) {
      console.log(`  без цены price_rub: ${noPrice.length} (не ошибка, но контенту есть что заполнить)`);
    }
    if (suspicious) {
      console.log('');
      for (const f of findings) {
        const where = f.id === '—' ? '' : `${f.id} → ${f.store}`;
        console.log(`  ✗ ${where || f.store} → ${f.problem}`);
        if (f.url && f.url !== '—') console.log(`      ${f.url}`);
      }
      console.log('');
    }
    console.log(`проверено ${checked}, подозрительных ${suspicious}`);
  }

  process.exit(suspicious ? 1 : 0);
})();
