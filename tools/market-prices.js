#!/usr/bin/env node
// market-prices.js — цены и наличие по партнёрским ссылкам каталога через официальный API
// партнёрской программы Маркета (Referral/Content API). Карточки маркетплейса не открываются.
//
// Метод: GET https://api.content.market.yandex.ru/v3/affiliate/partner/link/info?url=<ссылка>
//   заголовок Authorization: OAuth <токен>; в ответе price (рубли) и stockAmount (штук).
//
// Запуск:
//   node tools/market-prices.js                  — прогон всех ссылок, отчёт человеку
//   node tools/market-prices.js --json           — машинное чтение (как у check-offers.js)
//   node tools/market-prices.js --out report.json — сохранить отчёт в файл (не в репозиторий)
//   node tools/market-prices.js --only-id <id>   — один товар
//   node tools/market-prices.js --data <dir>     — данные из другой папки
//   node tools/market-prices.js --token-file <f> — файл токена (по умолчанию .secrets/market-token)
//   node tools/market-prices.js --timeout 15000  — таймаут одного запроса
//
// Код выхода: 0 — все запросы ответили, 1 — были ошибки или пустая цена, 2 — нет данных или токена.
//
// Скрипт ничего не пишет в репозиторий: только читает data/ и печатает отчёт.
// Цена товара в отчёте — по «главному» офферу: kind "card" раньше остальных, затем по порядку.
// Токен не печатается и не попадает в отчёт.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const API = 'https://api.content.market.yandex.ru/v3/affiliate/partner/link/info';

const argv = process.argv.slice(2);
function flag(name) {
  const i = argv.indexOf(name);
  return i === -1 ? '' : argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
}

const onlyId = flag('--only-id');
const dataDir = path.resolve(ROOT, flag('--data') || 'data');
const tokenFile = path.resolve(ROOT, flag('--token-file') || '.secrets/market-token');
const outFile = flag('--out') && flag('--out') !== 'true' ? path.resolve(ROOT, flag('--out')) : '';
const timeoutMs = Number(flag('--timeout')) > 0 ? Number(flag('--timeout')) : 15000;
const jsonOut = argv.includes('--json');

function loadWindowFile(rel) {
  const file = path.join(dataDir, rel);
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: rel });
  return sandbox.window;
}

let catalog;
try {
  catalog = loadWindowFile('catalog.js').KD_CATALOG || {};
} catch (e) {
  console.error(`нет данных в ${dataDir}: ${e.message}`);
  process.exit(2);
}

let token = process.env.MARKET_TOKEN || '';
if (!token) {
  try {
    token = fs.readFileSync(tokenFile, 'utf8').replace(/^\uFEFF/, '').trim();
  } catch (e) {
    console.error(`нет токена: положите его в ${path.relative(ROOT, tokenFile)} (или задайте MARKET_TOKEN)`);
    process.exit(2);
  }
}
if (!token) {
  console.error(`пустой токен в ${path.relative(ROOT, tokenFile)}`);
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchInfo(url) {
  const api = `${API}?url=${encodeURIComponent(url)}`;
  let last = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await sleep(800 * attempt);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(api, {
        headers: { Authorization: `OAuth ${token}`, Accept: 'application/json' },
        signal: ctrl.signal,
      });
      const text = await res.text();
      clearTimeout(timer);
      if (res.status === 429 || res.status >= 500) {
        last = `HTTP ${res.status}`;
        continue;
      }
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        return { error: `HTTP ${res.status}: не JSON` };
      }
      if (res.status !== 200 || body.status !== 'OK') {
        return { error: `HTTP ${res.status}: ${body.status || 'без статуса'}` };
      }
      return {
        price: Number(body.price) > 0 ? Number(body.price) : null,
        stock: Number.isFinite(Number(body.stockAmount)) ? Number(body.stockAmount) : null,
        osku: body.osku || null,
        title: typeof body.title === 'string' ? body.title.slice(0, 120) : '',
      };
    } catch (e) {
      clearTimeout(timer);
      last = e.name === 'AbortError' ? 'таймаут' : e.message;
    }
  }
  return { error: last || 'ошибка запроса' };
}

(async () => {
  const products = (catalog.products || []).filter((p) => !p.archived && (!onlyId || p.id === onlyId));
  if (!products.length) {
    console.error(onlyId ? `нет товара ${onlyId}` : 'нет товаров в каталоге');
    process.exit(2);
  }

  const report = {
    checkedAt: new Date().toISOString().slice(0, 10),
    catalogUpdated: catalog.updated || '',
    linksChecked: 0,
    products: [],
    errors: [],
    withoutPrice: [],
    outOfStock: [],
  };

  for (const p of products) {
    const offers = (p.offers || []).filter((o) => o.store === 'yandex' && o.url);
    const result = {
      id: p.id,
      name: p.name || '',
      price_rub: Number(p.price_rub) > 0 ? Number(p.price_rub) : null,
      price_mode: p.price_mode || '',
      offers: [],
      price: null,
      stock: null,
    };
    for (const o of offers) {
      const info = await fetchInfo(o.url);
      report.linksChecked++;
      result.offers.push({ kind: o.kind || '', url: o.url, ...info });
      if (info.error) report.errors.push({ id: p.id, url: o.url, error: info.error });
      await sleep(250);
    }
    const primary =
      result.offers.find((o) => !o.error && o.price && o.kind === 'card') ||
      result.offers.find((o) => !o.error && o.price) ||
      null;
    if (primary) {
      result.price = primary.price;
      result.stock = primary.stock;
    }
    if (!result.price) report.withoutPrice.push(p.id);
    if (Number(result.stock) === 0) report.outOfStock.push(p.id);
    report.products.push(result);
  }

  if (outFile) fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n', 'utf8');

  if (jsonOut) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    const pad = (s, n) => String(s).padEnd(n);
    console.log(
      `сверка цен: ${report.products.length} товаров, ${report.linksChecked} ссылок, ${report.checkedAt}`
    );
    console.log(`${pad('товар', 34)}${pad('было', 9)}${pad('стало', 9)}${pad('дельта', 9)}наличие`);
    let changed = 0;
    for (const r of report.products) {
      const oldP = r.price_rub;
      const newP = r.price;
      let delta = '—';
      if (oldP && newP) {
        const d = newP - oldP;
        if (d) changed++;
        delta = `${d > 0 ? '+' : ''}${d}`;
      } else if (newP) {
        changed++;
      }
      console.log(
        `${pad(r.id, 34)}${pad(oldP || '—', 9)}${pad(newP || '—', 9)}${pad(delta, 9)}${
          r.stock === null || r.stock === undefined ? '?' : r.stock
        }`
      );
    }
    console.log('');
    console.log(`изменилось или заполнилось: ${changed}`);
    if (report.outOfStock.length) console.log(`наличие 0 (кандидаты на замену оффера): ${report.outOfStock.join(', ')}`);
    if (report.withoutPrice.length) console.log(`без цены: ${report.withoutPrice.join(', ')}`);
    if (report.errors.length) {
      console.log(`ошибки (${report.errors.length}):`);
      for (const e of report.errors) console.log(`  ${e.id}: ${e.error}`);
    }
    console.log(report.errors.length || report.withoutPrice.length ? 'есть что разобрать' : 'всё ответило, цены есть у всех');
  }

  process.exit(report.errors.length || report.withoutPrice.length ? 1 : 0);
})();
