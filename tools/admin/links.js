// Панель «Ссылки на товары» для админки.
// Источники: /data/product-links.js (опубликовано) + localStorage.kd_product_links (правки этого браузера).
// Пустое поле = кнопка маркетплейса не показывается.
(function () {
  'use strict';
  var KEY = 'kd_product_links';
  var FILE_LINKS = window.KD_PRODUCT_LINKS || {};
  var catalog = null;

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeLocal(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function merged(id) {
    var base = FILE_LINKS[id] ? Object.assign({}, FILE_LINKS[id]) : {};
    var local = readLocal()[id];
    return local ? Object.assign(base, local) : base;
  }
  function isAdmin() {
    try { return sessionStorage.getItem('kd_admin_auth') === 'true'; } catch (e) { return false; }
  }
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
  function loadCatalog(cb) {
    if (catalog) return cb(catalog);
    if (window.KD_CATALOG && window.KD_CATALOG.products) { catalog = window.KD_CATALOG.products; return cb(catalog); }
    var s = document.createElement('script');
    s.src = '/data/catalog.js';
    s.onload = function () { catalog = (window.KD_CATALOG && window.KD_CATALOG.products) || []; cb(catalog); };
    s.onerror = function () { catalog = []; cb(catalog); };
    document.head.appendChild(s);
  }

  var STYLE_CARD = 'border:1px solid #e7e5e4;border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fff';
  var STYLE_INPUT = 'width:100%;box-sizing:border-box;border:1px solid #d6d3d1;border-radius:8px;padding:6px 8px;font-size:12px;font-family:inherit';

  function field(label, value, placeholder, status) {
    var input = el('input', { type: 'url', value: value || '', placeholder: placeholder, style: STYLE_INPUT });
    input.dataset.kind = label.key;
    return {
      input: input,
      node: el('label', { style: 'display:block;margin-bottom:6px' }, [
        el('span', {
          text: label.text + (status ? ' · ' + status : ''),
          style: 'display:block;font-size:11px;font-weight:600;color:#78716c;margin-bottom:2px',
        }),
        input,
      ]),
    };
  }

  function productRow(item) {
    var cur = merged(item.id);
    var row = el('div', { style: STYLE_CARD });
    row.dataset.id = item.id;
    row.appendChild(el('div', {
      text: item.name + (item.brand ? ' · ' + item.brand : ''),
      style: 'font-size:13px;font-weight:600;color:#1c1917;margin-bottom:8px',
    }));
    var offerUrl = function (store) {
      var found = (item.offers || []).filter(function (o) { return o.store === store; })[0];
      return found ? (found.url || '') : '';
    };
    var hint = function (kind) {
      var url = offerUrl(kind);
      return url ? 'из каталога: ' + url : 'ссылка не задана — кнопки не будет';
    };
    var f = {
      yandex: field({ key: 'yandex', text: 'Яндекс Маркет' }, cur.yandex, hint('yandex')),
      ozon: field({ key: 'ozon', text: 'Ozon' }, cur.ozon, hint('ozon')),
      wb: field({ key: 'wb', text: 'Wildberries' }, cur.wb, hint('wb')),
    };
    Object.keys(f).forEach(function (k) { row.appendChild(f[k].node); });
    row._fields = f;
    return row;
  }

  function collect() {
    var data = {};
    Array.prototype.forEach.call(document.querySelectorAll('#kd-links-list [data-id]'), function (row) {
      var id = row.dataset.id;
      if (!row._fields) return;
      var out = {};
      ['yandex', 'ozon', 'wb'].forEach(function (k) {
        var v = (row._fields[k].input.value || '').trim();
        if (v) out[k] = v;
      });
      if (Object.keys(out).length) data[id] = out;
    });
    return data;
  }

  function fileBody(data) {
    return [
      '// Ссылки на товары. Пустая строка = кнопку маркетплейса не показывать.',
      'window.KD_PRODUCT_LINKS = ' + JSON.stringify(data, null, 2) + ';',
      '',
    ].join('\n');
  }

  var panel = null;

  function toast(msg) {
    var t = el('div', {
      text: msg,
      style: 'position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:100000;' +
        'background:#1c1917;color:#fafaf9;font-size:13px;padding:10px 16px;border-radius:10px;' +
        'font-family:system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)',
    });
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function closePanel() { if (panel) { panel.remove(); panel = null; } }

  function openPanel() {
    if (panel) return closePanel();
    loadCatalog(function (items) {
      var list = el('div', { id: 'kd-links-list', style: 'overflow:auto;padding-right:4px;flex:1' });
      items.forEach(function (item) { list.appendChild(productRow(item)); });
      if (!items.length) list.appendChild(el('div', { text: 'Каталог товаров не загрузился (data/catalog.js).', style: 'font-size:13px;color:#b91c1c' }));

      var search = el('input', { type: 'search', placeholder: 'Поиск товара', style: STYLE_INPUT + ';max-width:240px' });
      search.addEventListener('input', function () {
        var q = search.value.toLowerCase().trim();
        Array.prototype.forEach.call(list.children, function (row) {
          if (!row.dataset.id) return;
          row.style.display = row.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
        });
      });

      var fileInput = el('input', { type: 'file', accept: '.js,.json', style: 'display:none' });
      fileInput.addEventListener('change', function () {
        var f = fileInput.files && fileInput.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          var text = String(reader.result || '');
          var json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
          try {
            var data = JSON.parse(json);
            writeLocal(data);
            toast('Файл загружен: ' + Object.keys(data).length + ' товаров');
            closePanel();
            openPanel();
          } catch (e) { toast('Не разобрал файл: ' + e.message); }
        };
        reader.readAsText(f);
      });

      var btn = function (label, onClick, primary) {
        return el('button', {
          text: label, onclick: onClick,
          style: 'font:inherit;font-size:12px;font-weight:600;padding:8px 12px;border-radius:9px;cursor:pointer;' +
            (primary ? 'background:#1c1917;color:#fff;border:1px solid #1c1917' : 'background:#fff;color:#292524;border:1px solid #d6d3d1'),
        });
      };

      panel = el('div', {
        style: 'position:fixed;inset:0;z-index:99998;background:rgba(28,25,23,.45);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif',
      }, [
        el('div', {
          style: 'background:#fafaf9;border-radius:16px;width:min(920px,96vw);max-height:90vh;display:flex;flex-direction:column;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.3)',
        }, [
          el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px' }, [
            el('div', { text: 'Ссылки на товары', style: 'font-size:16px;font-weight:700;color:#1c1917' }),
            el('button', { text: 'Закрыть', onclick: closePanel, style: 'font:inherit;font-size:12px;background:#fff;border:1px solid #d6d3d1;border-radius:9px;padding:8px 12px;cursor:pointer' }),
          ]),
          el('p', {
            text: 'Пустая строка — показывается встроенная ссылка сайта (если она есть). Ozon без вашей ссылки не показывается вообще. Правки сразу видны в этом браузере; чтобы их увидели посетители, нажмите «Скачать product-links.js» и замените файл data/product-links.js в проекте.',
            style: 'font-size:12px;line-height:1.5;color:#57534e;margin:0 0 12px',
          }),
          el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px' }, [
            search,
            btn('Сохранить в браузере', function () {
              var data = collect();
              toast(writeLocal(data) ? 'Сохранено: ' + Object.keys(data).length + ' товаров' : 'Не удалось сохранить');
            }, true),
            btn('Скачать product-links.js', function () {
              var blob = new Blob([fileBody(collect())], { type: 'text/javascript;charset=utf-8' });
              var a = el('a', { href: URL.createObjectURL(blob), download: 'product-links.js' });
              document.body.appendChild(a); a.click(); a.remove();
              toast('Файл скачан — положите его в data/');
            }),
            btn('Загрузить файл', function () { fileInput.click(); }),
            btn('Очистить правки', function () {
              localStorage.removeItem(KEY);
              toast('Правки в браузере сброшены');
              closePanel(); openPanel();
            }),
          ]),
          list,
          fileInput,
        ]),
      ]);
      panel.addEventListener('click', function (e) { if (e.target === panel) closePanel(); });
      document.body.appendChild(panel);
    });
  }

  var fab = null;
  function syncFab() {
    var need = isAdmin();
    if (need && !fab) {
      fab = el('button', {
        text: 'Ссылки',
        onclick: openPanel,
        style: 'position:fixed;right:16px;bottom:16px;z-index:99997;font:inherit;font-size:12px;font-weight:700;' +
          'background:#1c1917;color:#fff;border:0;border-radius:999px;padding:12px 18px;cursor:pointer;' +
          'box-shadow:0 10px 24px rgba(0,0,0,.25)',
      });
      document.body.appendChild(fab);
    } else if (!need && fab) {
      fab.remove(); fab = null;
      closePanel();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncFab);
  else syncFab();
  setInterval(syncFab, 1200);
})();
