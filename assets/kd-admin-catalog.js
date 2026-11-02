// Панель «Каталог»: товары, офферы, сетапы и привязки статей.
// Источник: /data/catalog.js (window.KD_CATALOG) + localStorage.kd_catalog_draft.
// Доступ: Ctrl+Shift+A, код 2026 (общий гейт sessionStorage.kd_admin_auth).
// Публикация: «Скачать catalog.js» -> заменить data/catalog.js в проекте.
(function () {
  'use strict';
  var KEY = 'kd_catalog_draft';
  var STORES = { yandex: 'Яндекс Маркет', ozon: 'Ozon', wb: 'Wildberries' };
  var STORE_ORDER = ['yandex', 'ozon', 'wb'];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function emptyCatalog() {
    return {
      version: 1,
      updated: new Date().toISOString().slice(0, 10),
      levels: [
        { level: 1, title: 'Старт', note: '' },
        { level: 2, title: 'Оптимум', note: '' },
        { level: 3, title: 'Премиум', note: '' },
      ],
      products: [],
      setups: [],
      articles: [],
    };
  }

  function readDraft() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      return raw && raw.products ? raw : null;
    } catch (e) { return null; }
  }
  function writeDraft() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
  }

  function normalize(raw) {
    var cat = emptyCatalog();
    if (!raw || typeof raw !== 'object') return cat;
    cat.version = raw.version || 1;
    cat.updated = raw.updated || cat.updated;
    if (Array.isArray(raw.levels)) cat.levels = raw.levels;
    cat.products = (Array.isArray(raw.products) ? raw.products : []).map(function (p) {
      return {
        id: p.id || '',
        name: p.name || '',
        brand: p.brand || '',
        category: p.category || '',
        summary: p.summary || '',
        price_mode: p.price_mode === 'note' ? 'note' : 'hidden',
        price_note: p.price_note || '',
        archived: p.archived === true,
        offers: (Array.isArray(p.offers) ? p.offers : []).map(function (o) {
          return {
            store: STORES[o.store] ? o.store : 'yandex',
            kind: o.kind === 'card' ? 'card' : 'search',
            url: o.url || '',
            label: o.label || '',
            erid: o.erid || '',
            advertiser: o.advertiser || '',
          };
        }),
      };
    });
    cat.setups = (Array.isArray(raw.setups) ? raw.setups : []).map(function (s) {
      return {
        id: s.id || '',
        level: Math.min(3, Math.max(1, parseInt(s.level, 10) || 1)),
        title: s.title || '',
        description: s.description || '',
        product_ids: Array.isArray(s.product_ids) ? s.product_ids.slice() : [],
      };
    });
    cat.articles = (Array.isArray(raw.articles) ? raw.articles : []).map(function (a) {
      return {
        slug: a.slug || '',
        title: a.title || '',
        block_title: a.block_title || 'Товары из этой статьи',
        product_ids: Array.isArray(a.product_ids) ? a.product_ids.slice() : [],
      };
    });
    return cat;
  }

  var state = normalize(readDraft() || (window.KD_CATALOG ? clone(window.KD_CATALOG) : null));
  var tab = 'products';
  var ui = { q: '', editing: null, offerProduct: '', msg: null };
  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === 'style') node.style.cssText = props[k];
      else if (k === 'text') node.textContent = props[k];
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  var STYLE_CARD = 'border:1px solid #e7e5e4;border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fff';
  var STYLE_INPUT = 'width:100%;box-sizing:border-box;border:1px solid #d6d3d1;border-radius:8px;padding:6px 8px;font-size:12px;font-family:inherit';
  var STYLE_LABEL = 'display:block;margin-bottom:6px';
  var STYLE_CAP = 'display:block;font-size:11px;font-weight:600;color:#78716c;margin-bottom:2px';
  var STYLE_HINT = 'font-size:11px;color:#78716c;margin-top:2px';
  var STYLE_BAD = 'font-size:11px;color:#b91c1c;margin-top:2px';

  function btn(label, onClick, primary) {
    return el('button', {
      text: label, onclick: onClick,
      style: 'font:inherit;font-size:12px;font-weight:600;padding:7px 11px;border-radius:9px;cursor:pointer;' +
        (primary ? 'background:#1c1917;color:#fff;border:1px solid #1c1917' : 'background:#fff;color:#292524;border:1px solid #d6d3d1'),
    });
  }

  function input(value, placeholder, onInput) {
    var node = el('input', { type: 'text', value: value || '', placeholder: placeholder || '', style: STYLE_INPUT });
    if (onInput) node.addEventListener('input', function () { onInput(node.value); });
    return node;
  }

  function field(label, node, hint) {
    return el('label', { style: STYLE_LABEL }, [
      el('span', { text: label, style: STYLE_CAP }), node,
      hint ? el('span', { text: hint, style: STYLE_HINT }) : null,
    ]);
  }

  function select(value, options, onChange) {
    var node = el('select', { style: STYLE_INPUT });
    options.forEach(function (o) {
      var opt = el('option', { text: o.text, value: o.value });
      if (o.value === value) opt.selected = true;
      node.appendChild(opt);
    });
    node.addEventListener('change', function () { onChange(node.value); });
    return node;
  }

  function noteBox(text, bad) {
    return el('div', {
      text: text,
      style: 'font-size:12px;padding:8px 10px;border-radius:9px;margin:0 0 10px;' +
        (bad ? 'background:#fef2f2;color:#b91c1c;border:1px solid #fecaca' : 'background:#f0fdf4;color:#166534;border:1px solid #bbf7d0'),
    });
  }

  function productById(id) {
    for (var i = 0; i < state.products.length; i++) if (state.products[i].id === id) return state.products[i];
    return null;
  }

  function activeProducts() {
    return state.products.filter(function (p) { return !p.archived; });
  }

  function catalogBody(data) {
    return [
      '// Каталог товаров kabinetdoma.ru — единый источник правды.',
      '// window.KD_CATALOG = { version, updated, levels, products, setups, articles }.',
      '// Цена на сайте не печатается: price_mode "hidden" | "note".',
      '// Удаление товара — archived: true, чтобы не ломать привязки.',
      'window.KD_CATALOG = ' + JSON.stringify(data, null, 2) + ';',
      '',
    ].join(String.fromCharCode(10));
  }
  function validate() {
    var errors = [];
    var ids = {};
    state.products.forEach(function (p, idx) {
      var where = 'Товар ' + (p.id || '#' + (idx + 1));
      if (!p.id) errors.push(where + ': пустой id');
      if (/[^a-z0-9-]/.test(p.id) || p.id.indexOf('--') > -1 || p.id[0] === '-' || p.id.slice(-1) === '-') {
        errors.push(where + ': id — только строчная латиница, цифры и одиночные дефисы');
      }
      if (ids[p.id]) errors.push(where + ': id повторяется');
      ids[p.id] = true;
      if (!p.name) errors.push(where + ': нет названия');
      if (p.price_mode === 'hidden' && p.price_note) errors.push(where + ': при price_mode "hidden" пометка о цене не выводится');
      if (p.price_mode === 'note' && !p.price_note) errors.push(where + ': price_mode "note" без текста пометки');
      var seen = {};
      (p.offers || []).forEach(function (o) {
        if (!STORES[o.store]) errors.push(where + ': неизвестная площадка ' + o.store);
        if (seen[o.store]) errors.push(where + ': две ссылки на ' + STORES[o.store]);
        seen[o.store] = true;
        if (o.url && o.url.indexOf('https://') !== 0) errors.push(where + ': ссылка должна начинаться с https://');
        if (o.kind === 'card' && /\/search|search\?/.test(o.url)) errors.push(where + ': оффер «карточка» ведёт на поиск — нужна ссылка на товар или kind «поиск»');
      });
    });

    var setupIds = {};
    state.setups.forEach(function (s) {
      var where = 'Сетап ' + (s.id || 'без id');
      if (!s.id) errors.push(where + ': пустой id');
      if (setupIds[s.id]) errors.push(where + ': id повторяется');
      setupIds[s.id] = true;
      if (!s.title) errors.push(where + ': нет названия');
      if ([1, 2, 3].indexOf(s.level) < 0) errors.push(where + ': level должен быть 1, 2 или 3');
      checkRefs(s.product_ids, where, errors);
    });

    var slugs = {};
    state.articles.forEach(function (a) {
      var where = 'Статья ' + (a.slug || 'без slug');
      if (!a.slug) errors.push(where + ': пустой slug');
      if (slugs[a.slug]) errors.push(where + ': slug повторяется');
      slugs[a.slug] = true;
      checkRefs(a.product_ids, where, errors);
    });
    return errors;
  }

  function checkRefs(list, where, errors) {
    (list || []).forEach(function (id) {
      var p = productById(id);
      if (!p) errors.push(where + ': привязка на несуществующий товар ' + id);
      else if (p.archived) errors.push(where + ': товар ' + id + ' в архиве — уберите его из привязок');
    });
  }

  function checkAndToast() {
    var errors = validate();
    if (!errors.length) { toast('Проверка пройдена: привязки и офферы корректны'); return; }
    toast('Проблем: ' + errors.length + ' — первая: ' + errors[0], true);
  }
  function badge(text, tone) {
    var colors = { muted: '#e7e5e4|#57534e', warn: '#fef3c7|#92400e', ok: '#dcfce7|#166534', bad: '#fee2e2|#b91c1c' };
    var pair = (colors[tone] || colors.muted).split('|');
    return el('span', {
      text: text,
      style: 'display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;' +
        'background:' + pair[0] + ';color:' + pair[1] + ';margin-left:6px;vertical-align:middle',
    });
  }

  function picker(ids, onChange) {
    var wrap = el('div');
    var count = el('div', { style: STYLE_HINT });
    var box = el('div', {
      style: 'border:1px solid #e7e5e4;border-radius:10px;padding:6px 8px;max-height:200px;overflow:auto;background:#fff;margin-top:4px',
    });
    function refreshCount() {
      count.textContent = 'Выбрано: ' + ids.length + ' — новые товары появятся в блоке на сайте';
    }
    function row(p) {
      var cb = el('input', { type: 'checkbox' });
      cb.checked = ids.indexOf(p.id) > -1;
      cb.addEventListener('change', function () {
        var at = ids.indexOf(p.id);
        if (cb.checked && at < 0) ids.push(p.id);
        if (!cb.checked && at > -1) ids.splice(at, 1);
        refreshCount();
        if (onChange) onChange(ids);
      });
      var label = el('label', {
        style: 'display:flex;align-items:center;gap:8px;padding:4px 2px;font-size:12px;color:#292524;cursor:pointer',
      }, [cb, el('span', { text: p.name + (p.brand ? ' · ' + p.brand : '') }), badge(p.archived ? 'архив' : p.id, p.archived ? 'bad' : 'muted')]);
      label.dataset.pid = p.id;
      return label;
    }
    var list = activeProducts().slice();
    state.products.forEach(function (p) {
      if (p.archived && ids.indexOf(p.id) > -1) list.push(p);
    });
    list.forEach(function (p) { box.appendChild(row(p)); });
    if (!list.length) box.appendChild(el('div', { text: 'В каталоге ещё нет товаров', style: 'font-size:12px;color:#a8a29e' }));
    refreshCount();
    var search = input('', 'Фильтр по названию или id', function (v) {
      var q = v.toLowerCase().trim();
      Array.prototype.forEach.call(box.children, function (r) {
        if (!r.dataset.pid) return;
        r.style.display = r.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
      });
    });
    wrap.appendChild(search);
    wrap.appendChild(box);
    wrap.appendChild(count);
    return wrap;
  }

  function addProduct() {
    var n = 1;
    while (productById('new-product-' + n)) n++;
    var p = {
      id: 'new-product-' + n, name: '', brand: '', category: '', summary: '',
      price_mode: 'hidden', price_note: '', archived: false, offers: [],
    };
    state.products.unshift(p);
    ui.editing = p.id;
    ui.q = '';
    renderBody();
  }

  function renderProducts(body) {
    body.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px' }, [
      el('div', { style: 'flex:1;min-width:180px' }, [input(ui.q, 'Поиск: название, id, бренд', filterProducts)]),
      btn('Добавить товар', addProduct, true),
      btn('Проверить', checkAndToast),
    ]));
    var list = el('div', { id: 'kd-cat-products' });
    var items = state.products.slice().sort(function (a, b) {
      if (a.archived !== b.archived) return a.archived ? 1 : -1;
      return a.name.localeCompare(b.name, 'ru');
    });
    items.forEach(function (p) { list.appendChild(productCard(p)); });
    if (!items.length) list.appendChild(el('div', { text: 'Каталог пуст — нажмите «Добавить товар».', style: 'font-size:13px;color:#57534e' }));
    body.appendChild(list);
    filterProducts(ui.q);
  }

  function filterProducts(q) {
    ui.q = q || '';
    var list = document.getElementById('kd-cat-products');
    if (!list) return;
    var needle = ui.q.toLowerCase().trim();
    Array.prototype.forEach.call(list.children, function (row) {
      if (!row.dataset.id) return;
      row.style.display = row.textContent.toLowerCase().indexOf(needle) > -1 ? '' : 'none';
    });
  }
  function area(value, placeholder, rows, onInput) {
    var node = el('textarea', { placeholder: placeholder || '', rows: rows || 2, style: STYLE_INPUT + ';resize:vertical' });
    node.value = value || '';
    node.addEventListener('input', function () { onInput(node.value); });
    return node;
  }

  function productEditor(p) {
    var box = el('div', { style: 'margin-top:10px;padding-top:10px;border-top:1px solid #f5f5f4;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px' });
    var idInput = input(p.id, 'latin-ids-only', function (v) {
      var old = p.id;
      p.id = v.trim();
      if (ui.editing === old) ui.editing = p.id;
      if (ui.offerProduct === old) ui.offerProduct = p.id;
      renameRefs(old, p.id);
    });
    box.appendChild(field('id товара (в привязках и офферах)', idInput, 'Смена id обновит привязки статей и сетапов.'));
    box.appendChild(field('Название', input(p.name, 'Например: Кресло Ergo Plus', function (v) { p.name = v; })));
    box.appendChild(field('Бренд', input(p.brand, 'Бренд или мастерская', function (v) { p.brand = v; })));
    box.appendChild(field('Категория', input(p.category, 'Кресла, столы, свет…', function (v) { p.category = v; })));
    box.appendChild(field('Короткое описание', area(p.summary, 'Одна строка для карточки', 2, function (v) { p.summary = v; })));
    var note = input(p.price_note, 'Например: ориентир по рынку — проверьте цену', function (v) { p.price_note = v; });
    note.disabled = p.price_mode === 'hidden';
    note.style.opacity = p.price_mode === 'hidden' ? '0.5' : '1';
    box.appendChild(field('Пометка «ориентир» (цена не печатается)', note,
      p.price_mode === 'hidden' ? 'При price_mode «hidden» пометка не выводится.' : 'Выводится плашка «Ориентир» и этот текст, без цифр цены.'));
    box.appendChild(field('Режим цены', select(p.price_mode, [
      { value: 'hidden', text: 'hidden — цену не показывать' },
      { value: 'note', text: 'note — только пометка «ориентир»' },
    ], function (v) { p.price_mode = v; renderBody(); })));
    var arch = el('label', { style: 'display:flex;align-items:center;gap:8px;font-size:12px;color:#292524;margin-top:4px' }, [
      el('input', { type: 'checkbox' }),
      el('span', { text: 'В архиве (не показывать на сайте, привязки сохраняются)' }),
    ]);
    arch.firstChild.checked = p.archived;
    arch.firstChild.addEventListener('change', function () { p.archived = arch.firstChild.checked; renderBody(); });
    box.appendChild(arch);
    return box;
  }

  function renameRefs(oldId, newId) {
    if (!oldId) return;
    state.setups.forEach(function (s) {
      s.product_ids = s.product_ids.map(function (id) { return id === oldId ? newId : id; });
    });
    state.articles.forEach(function (a) {
      a.product_ids = a.product_ids.map(function (id) { return id === oldId ? newId : id; });
    });
  }

  function productCard(p) {
    var card = el('div', { style: STYLE_CARD + (p.archived ? ';background:#fafaf9;opacity:.85' : '') });
    card.dataset.id = p.id;
    var title = el('div', { style: 'font-size:13px;font-weight:600;color:#1c1917' }, [
      el('span', { text: p.name || '(без названия)' }),
      p.brand ? el('span', { text: ' · ' + p.brand, style: 'font-weight:400;color:#78716c' }) : null,
      badge(p.id, 'muted'),
      p.archived ? badge('архив', 'bad') : null,
      p.price_mode === 'note' ? badge('ориентир', 'warn') : null,
      el('span', { text: 'офферов: ' + p.offers.length, style: STYLE_HINT + ';margin-left:6px' }),
    ]);
    var actions = el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' }, [
      btn(ui.editing === p.id ? 'Свернуть' : 'Править', function () {
        ui.editing = ui.editing === p.id ? null : p.id;
        renderBody();
      }),
      btn('Офферы', function () { tab = 'offers'; ui.offerProduct = p.id; renderBody(); }),
      btn(p.archived ? 'Вернуть' : 'В архив', function () {
        p.archived = !p.archived;
        if (p.archived) {
          var used = refsOf(p.id);
          if (used.length) toast('Товар в архиве, но остался в привязках: ' + used.join(', '), true);
        }
        renderBody();
      }),
    ]);
    card.appendChild(el('div', { style: 'display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap' }, [title, actions]));
    if (ui.editing === p.id) card.appendChild(productEditor(p));
    return card;
  }

  function refsOf(id) {
    var out = [];
    state.setups.forEach(function (s) { if (s.product_ids.indexOf(id) > -1) out.push('сетап ' + (s.id || s.title)); });
    state.articles.forEach(function (a) { if (a.product_ids.indexOf(id) > -1) out.push('статья ' + a.slug); });
    return out;
  }
  function isSearchUrl(url) {
    return /\/search|search\?/.test(url || '');
  }

  function offerText(o) {
    if (o.kind === 'search') return 'Найти на ' + (STORES[o.store] || o.store);
    return 'Купить';
  }

  function renderOffers(body) {
    if (!state.products.length) {
      body.appendChild(el('div', { text: 'Сначала добавьте товар на вкладке «Товары».', style: 'font-size:13px;color:#57534e' }));
      return;
    }
    if (!productById(ui.offerProduct)) ui.offerProduct = state.products[0].id;
    var cur = productById(ui.offerProduct);
    body.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:10px' }, [
      el('div', { style: 'flex:1;min-width:240px' }, [
        field('Товар', select(cur.id, state.products.map(function (p) {
          return { value: p.id, text: p.name + (p.archived ? ' (архив)' : '') };
        }), function (v) { ui.offerProduct = v; renderBody(); })),
      ]),
      btn('Добавить оффер', function () {
        var used = cur.offers.map(function (o) { return o.store; });
        var free = STORE_ORDER.filter(function (s) { return used.indexOf(s) < 0; })[0] || 'yandex';
        cur.offers.push({ store: free, kind: 'search', url: '', label: '', erid: '', advertiser: '' });
        renderBody();
      }, true),
      btn('Проверить', checkAndToast),
    ]));
    body.appendChild(el('p', {
      text: 'Пустой url — оффер не показывается. kind «поиск» рисует кнопку «Найти на …», kind «карточка» — «Купить» и требует прямую ссылку на товар (без /search).',
      style: 'font-size:12px;line-height:1.5;color:#57534e;margin:0 0 10px',
    }));
    if (!cur.offers.length) {
      body.appendChild(el('div', { text: 'У товара нет офферов — кнопок на сайте не будет.', style: 'font-size:13px;color:#57534e' }));
      return;
    }
    cur.offers.forEach(function (o, i) { body.appendChild(offerCard(cur, o, i)); });
  }

  function offerCard(p, o, index) {
    var urlHint = el('span', { style: STYLE_HINT });
    var urlInput = input(o.url, 'https://market.yandex.ru/cc/…', function (v) { o.url = v.trim(); refresh(); });
    function refresh() {
      var bad = o.kind === 'card' && isSearchUrl(o.url);
      urlHint.textContent = bad
        ? 'Это поисковая ссылка, а kind = «карточка». Переключите kind на «поиск» или дайте прямую ссылку на товар.'
        : 'Кнопка на сайте: ' + offerText(o);
      urlHint.style.cssText = bad ? STYLE_BAD : STYLE_HINT;
    }
    var card = el('div', { style: STYLE_CARD });
    card.appendChild(el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px' }, [
      el('div', { style: 'font-size:12px;font-weight:700;color:#1c1917' }, [
        el('span', { text: STORES[o.store] || o.store }),
        badge(offerText(o), o.kind === 'search' ? 'warn' : 'ok'),
        o.url ? null : badge('не показывается', 'muted'),
      ]),
      btn('Убрать', function () { p.offers.splice(index, 1); renderBody(); }),
    ]));
    var grid = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px' });
    grid.appendChild(field('Площадка', select(o.store, STORE_ORDER.map(function (s) {
      return { value: s, text: STORES[s] };
    }), function (v) { o.store = v; renderBody(); })));
    grid.appendChild(field('Формат', select(o.kind, [
      { value: 'search', text: 'поиск — «Найти на …»' },
      { value: 'card', text: 'карточка — «Купить»' },
    ], function (v) { o.kind = v; renderBody(); })));
    grid.appendChild(field('Ссылка', urlInput));
    grid.appendChild(field('Подпись кнопки (необязательно)', input(o.label, 'Например: Смотреть на Маркете', function (v) { o.label = v; })));
    grid.appendChild(field('erid', input(o.erid, 'токен маркировки', function (v) { o.erid = v; }), 'Вместе с erid на сайте выводится пометка «Реклама».'));
    grid.appendChild(field('Рекламодатель', input(o.advertiser, 'ООО «…», ИНН …', function (v) { o.advertiser = v; })));
    card.appendChild(grid);
    card.appendChild(el('div', { style: 'margin-top:6px' }, [urlHint]));
    refresh();
    return card;
  }
  function levelTitle(n) {
    var found = state.levels.filter(function (l) { return l.level === n; })[0];
    return (found && found.title) || ('Уровень ' + n);
  }

  function renderLevels() {
    var card = el('div', { style: STYLE_CARD + ';background:#fafaf9' });
    card.appendChild(el('div', { text: 'Уровни сетапов', style: 'font-size:13px;font-weight:700;color:#1c1917;margin-bottom:6px' }));
    card.appendChild(el('div', { text: 'Названия уровней берутся отсюда — в коде они не зашиты. Уровень 1..3 = Старт / Оптимум / Премиум.', style: STYLE_HINT + ';margin-bottom:8px' }));
    var grid = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px' });
    [1, 2, 3].forEach(function (n) {
      var found = state.levels.filter(function (l) { return l.level === n; })[0];
      if (!found) { found = { level: n, title: '', note: '' }; state.levels.push(found); }
      var cell = el('div');
      cell.appendChild(field('Уровень ' + n + ' — название', input(found.title, 'Старт / Оптимум / Премиум', function (v) { found.title = v; })));
      cell.appendChild(field('Подпись уровня', input(found.note, 'Короткая строка под заголовком', function (v) { found.note = v; })));
      grid.appendChild(cell);
    });
    card.appendChild(grid);
    return card;
  }

  function renderSetups(body) {
    body.appendChild(renderLevels());
    body.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;margin:10px 0' }, [
      btn('Добавить сетап', function () {
        var n = 1;
        while (state.setups.some(function (s) { return s.id === 'setup-' + n; })) n++;
        state.setups.push({ id: 'setup-' + n, level: 1, title: '', description: '', product_ids: [] });
        renderBody();
      }, true),
      btn('Проверить', checkAndToast),
    ]));
    if (!state.setups.length) {
      body.appendChild(el('div', { text: 'Сетапов пока нет. Сетап — это набор товаров одного уровня; на сайте он выводится блоком «Старт / Оптимум / Премиум».', style: 'font-size:13px;color:#57534e' }));
      return;
    }
    state.setups.forEach(function (s, i) { body.appendChild(setupCard(s, i)); });
  }

  function setupCard(s, index) {
    var card = el('div', { style: STYLE_CARD });
    card.appendChild(el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px' }, [
      el('div', { style: 'font-size:13px;font-weight:600;color:#1c1917' }, [
        el('span', { text: s.title || '(без названия)' }),
        badge(levelTitle(s.level), 'ok'),
        badge(s.id, 'muted'),
      ]),
      btn('Удалить сетап', function () {
        if (!window.confirm('Удалить сетап «' + (s.title || s.id) + '»? Товары останутся в каталоге.')) return;
        state.setups.splice(index, 1);
        renderBody();
      }),
    ]));
    var grid = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px' });
    grid.appendChild(field('id сетапа', input(s.id, 'setup-1', function (v) { s.id = v.trim(); })));
    grid.appendChild(field('Уровень', select(String(s.level), [1, 2, 3].map(function (n) {
      return { value: String(n), text: n + ' — ' + levelTitle(n) };
    }), function (v) { s.level = parseInt(v, 10); renderBody(); })));
    grid.appendChild(field('Название', input(s.title, 'Например: Старт за 60 000 ₽', function (v) { s.title = v; })));
    grid.appendChild(field('Описание', area(s.description, 'Кому подходит набор', 2, function (v) { s.description = v; })));
    card.appendChild(grid);
    card.appendChild(field('Товары в сетапе', picker(s.product_ids), 'Порядок — как отмечено; в привязках только существующие товары.'));
    return card;
  }
  var KNOWN_SLUGS = [
    'balans-raboty-i-lichnoj-zhizni-na-udalenke', 'rabochee-mesto-v-odnushke-s-rebenkom', 'stol-s-elektroprivodom-polza-dlya-spiny',
    '5-luchshih-ergonomichnyh-kresel-rejting', 'skrinbar-na-monitor-vybor-zashchita-glaz', 'mikrofon-s-shumopodavleniem-dlya-zvonkov',
    'kabel-menedzhment-pod-stolom-svoimi-rukami', 'kronshtejn-dlya-monitora-ergonomika-shei', 'metod-svetofor-udalenka-s-detmi',
    'rabochee-mesto-dlya-dvoih-v-komnate', 'podstavka-dlya-nog-pod-stol-ergonomika', 'kronshtejn-dlya-monitora-na-stol-vybor',
    'akusticheskie-paneli-dlya-domashnego-kabineta', 'v-kakoj-komnate-luchshe-rabotat-na-udalenke',
    'kuda-postavit-rabochij-stol-v-komnate', 'domashnij-ofis-s-nulya-nedorogo', 'udalennaya-rabota-v-poezdke-i-otpuske',
  ];

  function renderArticles(body) {
    body.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px' }, [
      btn('Добавить привязку', function () {
        state.articles.push({ slug: '', title: '', block_title: 'Товары из этой статьи', product_ids: [] });
        renderBody();
      }, true),
      btn('Проверить', checkAndToast),
    ]));
    body.appendChild(el('p', {
      text: 'Привязка = slug статьи из адреса /article/<slug>/ + товары каталога. Блок с карточками вставляется в конец статьи; статьи без привязки не меняются.',
      style: 'font-size:12px;line-height:1.5;color:#57534e;margin:0 0 10px',
    }));
    if (!state.articles.length) {
      body.appendChild(el('div', { text: 'Привязок пока нет — статьи показывают только встроенные карточки.', style: 'font-size:13px;color:#57534e' }));
      return;
    }
    var dl = el('datalist', { id: 'kd-cat-slugs' });
    KNOWN_SLUGS.forEach(function (s) { dl.appendChild(el('option', { value: s })); });
    body.appendChild(dl);
    state.articles.forEach(function (a, i) { body.appendChild(articleCard(a, i)); });
  }

  function articleCard(a, index) {
    var card = el('div', { style: STYLE_CARD });
    card.appendChild(el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px' }, [
      el('div', { style: 'font-size:13px;font-weight:600;color:#1c1917' }, [
        el('span', { text: a.title || a.slug || '(новая привязка)' }),
        badge('товаров: ' + a.product_ids.length, a.product_ids.length ? 'ok' : 'muted'),
      ]),
      btn('Удалить привязку', function () {
        state.articles.splice(index, 1);
        renderBody();
      }),
    ]));
    var slug = input(a.slug, 'slug статьи', function (v) { a.slug = v.trim().replace(/^\/+|\/+$/g, ''); refreshLink(); });
    slug.setAttribute('list', 'kd-cat-slugs');
    var link = el('span', { style: STYLE_HINT });
    function refreshLink() { link.textContent = 'Адрес: /article/' + (a.slug || '…') + '/'; }
    refreshLink();
    var grid = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px' });
    grid.appendChild(field('Slug статьи', slug, link.textContent));
    grid.appendChild(field('Заголовок для админки', input(a.title, 'Как статью называть здесь', function (v) { a.title = v; })));
    grid.appendChild(field('Заголовок блока на сайте', input(a.block_title, 'Товары из этой статьи', function (v) { a.block_title = v; })));
    card.appendChild(grid);
    card.appendChild(el('div', { style: STYLE_HINT + ';margin:-6px 0 8px' }, [link]));
    card.appendChild(field('Товары статьи', picker(a.product_ids), 'Карточки появятся в конце статьи в этом порядке.'));
    return card;
  }
  var panel = null;
  var bodyNode = null;

  function toast(text, bad) {
    var t = el('div', {
      text: text,
      style: 'position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:100001;' +
        'background:' + (bad ? '#b91c1c' : '#1c1917') + ';color:#fafaf9;font-size:13px;padding:10px 16px;' +
        'border-radius:10px;font-family:system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:80vw',
    });
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, bad ? 4200 : 2600);
  }

  function stats() {
    var offers = 0;
    state.products.forEach(function (p) { offers += p.offers.length; });
    return 'товаров: ' + state.products.length + ' (в архиве ' + state.products.filter(function (p) { return p.archived; }).length + ') · офферов: ' +
      offers + ' · сетапов: ' + state.setups.length + ' · привязок: ' + state.articles.length;
  }

  function renderBody() {
    if (!bodyNode) return;
    bodyNode.textContent = '';
    if (tab === 'products') renderProducts(bodyNode);
    else if (tab === 'offers') renderOffers(bodyNode);
    else if (tab === 'setups') renderSetups(bodyNode);
    else renderArticles(bodyNode);
    Array.prototype.forEach.call(panel.querySelectorAll('[data-tab]'), function (b) {
      var on = b.dataset.tab === tab;
      b.style.background = on ? '#1c1917' : '#fff';
      b.style.color = on ? '#fff' : '#292524';
    });
    var info = panel.querySelector('#kd-cat-stats');
    if (info) info.textContent = stats();
  }

  function download() {
    state.updated = new Date().toISOString().slice(0, 10);
    var blob = new Blob([catalogBody(state)], { type: 'text/javascript;charset=utf-8' });
    var a = el('a', { href: URL.createObjectURL(blob), download: 'catalog.js' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Файл скачан — положите его в data/catalog.js');
  }

  function closePanel() {
    if (panel) { panel.remove(); panel = null; bodyNode = null; }
  }

  function openPanel() {
    if (panel) return closePanel();
    var fileInput = el('input', { type: 'file', accept: '.js,.json', style: 'display:none' });
    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result || '');
        var from = text.indexOf('{');
        var to = text.lastIndexOf('}');
        if (from < 0 || to < 0) return toast('Не нашёл объект каталога в файле', true);
        try {
          state = normalize(JSON.parse(text.slice(from, to + 1)));
          writeDraft();
          renderBody();
          toast('Файл загружен: ' + state.products.length + ' товаров');
        } catch (e) { toast('Не разобрал файл: ' + e.message, true); }
      };
      reader.readAsText(f);
    });

    var tabs = el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px' });
    [['products', 'Товары'], ['offers', 'Офферы'], ['setups', 'Сетапы'], ['articles', 'Привязки статей']].forEach(function (t) {
      tabs.appendChild(el('button', {
        text: t[1],
        'data-tab': t[0],
        onclick: function () { tab = t[0]; renderBody(); },
        style: 'font:inherit;font-size:12px;font-weight:600;padding:7px 12px;border-radius:999px;cursor:pointer;border:1px solid #d6d3d1',
      }));
    });

    bodyNode = el('div', { style: 'overflow:auto;padding-right:4px;flex:1' });

    panel = el('div', {
      style: 'position:fixed;inset:0;z-index:99998;background:rgba(28,25,23,.45);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif',
    }, [
      el('div', {
        style: 'background:#fafaf9;border-radius:16px;width:min(1040px,96vw);max-height:92vh;display:flex;flex-direction:column;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.3)',
      }, [
        el('div', { style: 'display:flex;align-items:flex-start;justify-content:space-between;gap:12px' }, [
          el('div', {}, [
            el('div', { text: 'Каталог товаров', style: 'font-size:16px;font-weight:700;color:#1c1917' }),
            el('div', { id: 'kd-cat-stats', text: stats(), style: STYLE_HINT }),
          ]),
          el('button', { text: 'Закрыть', onclick: closePanel, style: 'font:inherit;font-size:12px;background:#fff;border:1px solid #d6d3d1;border-radius:9px;padding:8px 12px;cursor:pointer' }),
        ]),
        tabs,
        el('p', {
          text: 'Правки хранятся в этом браузере. Чтобы их увидели посетители, нажмите «Скачать catalog.js» и замените файл data/catalog.js в проекте.',
          style: 'font-size:12px;line-height:1.5;color:#57534e;margin:0 0 10px',
        }),
        bodyNode,
        el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid #e7e5e4' }, [
          btn('Сохранить в браузере', function () {
            state.updated = new Date().toISOString().slice(0, 10);
            var ok = writeDraft();
            toast(ok ? 'Черновик сохранён в браузере' : 'Не удалось сохранить — мало места', !ok);
          }, true),
          btn('Скачать catalog.js', download),
          btn('Загрузить файл', function () { fileInput.click(); }),
          btn('Проверить', checkAndToast),
          btn('Сбросить правки', function () {
            localStorage.removeItem(KEY);
            state = normalize(window.KD_CATALOG ? clone(window.KD_CATALOG) : null);
            renderBody();
            toast('Правки в браузере сброшены');
          }),
          fileInput,
        ]),
      ]),
    ]);
    panel.addEventListener('click', function (e) { if (e.target === panel) closePanel(); });
    document.body.appendChild(panel);
    renderBody();
  }
  function isAdmin() {
    try { return sessionStorage.getItem('kd_admin_auth') === 'true'; } catch (e) { return false; }
  }

  var fab = null;
  function syncFab() {
    var need = isAdmin();
    if (need && !fab) {
      fab = el('button', {
        text: 'Каталог',
        onclick: openPanel,
        style: 'position:fixed;right:16px;bottom:64px;z-index:99997;font:inherit;font-size:12px;font-weight:700;' +
          'background:#fff;color:#1c1917;border:1px solid #1c1917;border-radius:999px;padding:12px 18px;cursor:pointer;' +
          'box-shadow:0 10px 24px rgba(0,0,0,.18)',
      });
      document.body.appendChild(fab);
    } else if (!need && fab) {
      fab.remove();
      fab = null;
      closePanel();
    }
  }

  var pin = null;
  function closePin() { if (pin) { pin.remove(); pin = null; } }

  function showPin() {
    if (pin || isAdmin()) return;
    var inputNode = el('input', {
      type: 'password', placeholder: 'код доступа', autocomplete: 'off',
      style: 'width:100%;box-sizing:border-box;border:1px solid #d6d3d1;border-radius:8px;padding:8px 10px;font-size:14px;font-family:inherit;text-align:center',
    });
    var err = el('div', { style: 'font-size:11px;color:#b91c1c;margin-top:6px;min-height:14px' });
    function submit() {
      var code = (inputNode.value || '').trim().toLowerCase();
      if (code === '2026' || code === 'admin' || code === 'kabinetdoma') {
        try { sessionStorage.setItem('kd_admin_auth', 'true'); } catch (e) {}
        closePin();
        syncFab();
        openPanel();
      } else {
        err.textContent = 'Неверный код (подсказка: 2026)';
        inputNode.value = '';
        inputNode.focus();
      }
    }
    inputNode.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      if (e.key === 'Escape') closePin();
    });
    pin = el('div', {
      style: 'position:fixed;inset:0;z-index:100002;background:rgba(28,25,23,.5);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif',
    }, [
      el('div', {
        style: 'background:#fafaf9;border-radius:16px;padding:18px;width:min(300px,94vw);box-shadow:0 24px 60px rgba(0,0,0,.3)',
      }, [
        el('div', { text: 'Панель управления', style: 'font-size:14px;font-weight:700;color:#1c1917;margin-bottom:8px' }),
        el('div', { text: 'Введите код доступа, чтобы открыть каталог.', style: 'font-size:12px;color:#57534e;margin-bottom:10px' }),
        inputNode, err,
        el('div', { style: 'display:flex;gap:8px;justify-content:flex-end;margin-top:10px' }, [
          btn('Отмена', closePin),
          btn('Войти', submit, true),
        ]),
      ]),
    ]);
    pin.addEventListener('click', function (e) { if (e.target === pin) closePin(); });
    document.body.appendChild(pin);
    inputNode.focus();
  }

  // Вход Ctrl+Shift+A: пока админка не разблокирована, показываем свой запрос кода.
  // После разблокировки клавишу обрабатывает основная админка сайта.
  window.addEventListener('keydown', function (e) {
    var key = (e.key || '').toLowerCase();
    var isA = e.code === 'KeyA' || key === 'a' || key === 'ф';
    if (!isA || !(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
    if (isAdmin()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showPin();
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncFab);
  else syncFab();
  setInterval(syncFab, 1200);

  window.KD_CATALOG_ADMIN = { open: openPanel, validate: validate, state: function () { return state; } };
})();
