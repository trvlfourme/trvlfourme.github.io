// Рендер каталога на страницах сайта: товары в статьях и готовые сетапы.
// Источник: /data/catalog.js (window.KD_CATALOG). Ссылки переопределяются
// через window.KD_PRODUCT_LINKS (data/product-links.js) и localStorage.kd_product_links.
// Бандл assets/index.js не трогаем: новые товары появляются этим скриптом.
(function () {
  'use strict';
  var CATALOG = null;
  var mountIds = ['kd-catalog-block', 'kd-setups-block'];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function node(tag, style, html) {
    var n = document.createElement(tag);
    if (style) n.setAttribute('style', style);
    if (html) n.innerHTML = html;
    return n;
  }

  function loadCatalog(cb) {
    if (window.KD_CATALOG) return cb(window.KD_CATALOG);
    var s = document.createElement('script');
    s.src = '/data/catalog.js';
    s.onload = function () { cb(window.KD_CATALOG || null); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  function localLinks() {
    try { return JSON.parse(localStorage.getItem('kd_product_links') || '{}') || {}; } catch (e) { return {}; }
  }

  // Офферы товара: url из каталога, затем переопределение KD_PRODUCT_LINKS.
  // Пустой url = оффер не показывается. Переопределение '' прячет кнопку.
  function offersOf(product) {
    var fileLinks = (window.KD_PRODUCT_LINKS && window.KD_PRODUCT_LINKS[product.id]) || {};
    var locLinks = localLinks()[product.id] || {};
    var override = {};
    Object.keys(fileLinks).forEach(function (k) { override[k] = fileLinks[k]; });
    Object.keys(locLinks).forEach(function (k) { override[k] = locLinks[k]; });

    var out = [];
    (product.offers || []).forEach(function (o) {
      if (!o || !o.store) return;
      var url = Object.prototype.hasOwnProperty.call(override, o.store) ? override[o.store] : o.url;
      out.push({ store: o.store, kind: o.kind === 'card' ? 'card' : 'search', url: (url || '').trim(), label: o.label || '', erid: o.erid || '', advertiser: o.advertiser || '' });
    });
    Object.keys(override).forEach(function (store) {
      if (out.some(function (o) { return o.store === store; })) return;
      out.push({ store: store, kind: 'search', url: (override[store] || '').trim(), label: '', erid: '', advertiser: '' });
    });
    return out.filter(function (o) { return !!o.url; });
  }

  var STORE_LABEL = { yandex: 'Яндекс Маркете', ozon: 'Ozon', wb: 'Wildberries' };

  function offerLabel(o) {
    if (o.label) return o.label;
    if (o.kind === 'search') return 'Найти на ' + (STORE_LABEL[o.store] || o.store);
    return 'Купить';
  }
  function adNotes(offers) {
    var seen = {};
    var html = '';
    offers.forEach(function (o) {
      if (!o.erid || seen[o.erid]) return;
      seen[o.erid] = true;
      var who = o.advertiser ? ' ' + esc(o.advertiser) + ',' : '';
      html += '<div style="font-size:10px;line-height:1.4;color:#78716c;margin-top:6px;font-family:ui-monospace,monospace">' +
        'Реклама.' + who + ' erid: ' + esc(o.erid) + '</div>';
    });
    return html;
  }

  function buttonsHtml(offers) {
    return offers.map(function (o) {
      var primary = o.kind !== 'search';
      var style = primary
        ? 'display:inline-block;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;background:#1c1917;color:#fff;border:1px solid #1c1917'
        : 'display:inline-block;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;background:#fafaf9;color:#292524;border:1px solid #d6d3d1';
      return '<a href="' + esc(o.url) + '" target="_blank" rel="noopener noreferrer sponsored nofollow" style="' + style + '">' +
        esc(offerLabel(o)) + '</a>';
    }).join('');
  }

  function productCard(product) {
    var offers = offersOf(product);
    var card = node('div', 'border:1px solid #e7e5e4;border-radius:12px;padding:12px 14px;background:#fff;margin-bottom:8px');
    card.setAttribute('data-kd-product', product.id);
    var html = '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap">' +
      '<div style="font-size:14px;font-weight:700;color:#1c1917">' + esc(product.name) + '</div>' +
      (product.brand ? '<div style="font-size:11px;color:#78716c">' + esc(product.brand) + '</div>' : '') +
      '</div>';
    if (product.summary) html += '<div style="font-size:12px;line-height:1.55;color:#57534e;margin-top:4px">' + esc(product.summary) + '</div>';
    if (product.price_mode === 'note' && product.price_note) {
      html += '<div style="display:inline-block;margin-top:8px;padding:3px 8px;border-radius:999px;background:#fffbeb;border:1px solid #fde68a;font-size:11px;color:#92400e">' +
        '<b>Ориентир</b> — ' + esc(product.price_note) + '</div>';
    }
    if (offers.length) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' + buttonsHtml(offers) + '</div>' + adNotes(offers);
    }
    card.innerHTML = html;
    return card;
  }

  function productsOf(ids, catalog) {
    var byId = {};
    (catalog.products || []).forEach(function (p) { byId[p.id] = p; });
    return (ids || []).map(function (id) { return byId[id]; }).filter(function (p) { return p && !p.archived; });
  }

  function heading(title, subtitle) {
    return '<h2 style="font-size:18px;font-weight:700;color:#1c1917;margin:0 0 4px">' + esc(title) + '</h2>' +
      (subtitle ? '<div style="font-size:12px;color:#78716c;margin-bottom:12px">' + esc(subtitle) + '</div>' : '');
  }

  function articleBlock(entry, catalog) {
    var products = productsOf(entry.product_ids, catalog);
    if (!products.length) return null;
    var section = node('section', 'margin-top:28px;padding:18px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:16px');
    section.id = 'kd-catalog-block';
    section.innerHTML = heading(entry.block_title || 'Товары из этой статьи', 'Подборка каталога «Кабинет Дома»');
    products.forEach(function (p) { section.appendChild(productCard(p)); });
    return section;
  }

  function setupsBlock(catalog) {
    var levels = {};
    (catalog.levels || []).forEach(function (l) { levels[l.level] = l; });
    var setups = (catalog.setups || []).slice().sort(function (a, b) { return (a.level || 0) - (b.level || 0); });
    if (!setups.length) return null;
    var section = node('section', 'margin-top:28px');
    section.id = 'kd-setups-block';
    section.innerHTML = heading('Готовые сетапы', 'Наборы одного уровня: название и состав правятся в каталоге');
    setups.forEach(function (setup) {
      var level = levels[setup.level] || {};
      var card = node('div', 'border:1px solid #e7e5e4;border-radius:14px;padding:14px;background:#fff;margin-bottom:10px');
      var products = productsOf(setup.product_ids, catalog);
      var html = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
        '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:#fef3c7;color:#92400e">' +
        esc(level.title || ('Уровень ' + setup.level)) + '</span>' +
        '<span style="font-size:14px;font-weight:700;color:#1c1917">' + esc(setup.title) + '</span></div>';
      if (level.note) html += '<div style="font-size:11px;color:#78716c;margin-top:2px">' + esc(level.note) + '</div>';
      if (setup.description) html += '<div style="font-size:12px;line-height:1.55;color:#57534e;margin-top:6px">' + esc(setup.description) + '</div>';
      card.innerHTML = html;
      products.forEach(function (p) { card.appendChild(productCard(p)); });
      if (!products.length) card.appendChild(node('div', 'font-size:12px;color:#a8a29e;margin-top:8px', 'Состав ещё не заполнен'));
      section.appendChild(card);
    });
    return section;
  }
  function currentSlug() {
    var m = window.location.pathname.match(/\/article\/([^\/]+)\/?/);
    if (m) return decodeURIComponent(m[1]);
    try {
      var q = new URLSearchParams(window.location.search).get('article');
      if (q) return decodeURIComponent(q);
    } catch (e) {}
    return '';
  }

  function articleHost() {
    return document.querySelector('article [class*="col-span-8"]') ||
      document.querySelector('article') ||
      document.querySelector('main');
  }

  function setupHost() {
    var marker = document.querySelector('[data-kd-setups]');
    if (marker) return marker;
    if (/\/builder\/?$/.test(window.location.pathname)) return document.querySelector('main') || document.getElementById('root');
    return null;
  }

  function clearBlocks() {
    mountIds.forEach(function (id) {
      var found = document.getElementById(id);
      if (found && found.parentNode) found.parentNode.removeChild(found);
    });
  }

  function render(catalog) {
    clearBlocks();
    if (!catalog) return;
    var slug = currentSlug();
    if (slug) {
      var entry = (catalog.articles || []).filter(function (a) { return a.slug === slug; })[0];
      var host = articleHost();
      if (entry && host) {
        var block = articleBlock(entry, catalog);
        if (block) host.appendChild(block);
      }
    }
    var setupsHost = setupHost();
    if (setupsHost) {
      var setups = setupsBlock(catalog);
      if (setups) setupsHost.appendChild(setups);
    }
  }

  function expectedBlocks() {
    return !!currentSlug() || !!setupHost();
  }

  function boot() {
    loadCatalog(function (catalog) {
      if (!catalog || !expectedBlocks()) return;
      render(catalog);
      // Страховка на случай, если гидрация React перерисовала контейнер.
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        if (tries > 20) return clearInterval(timer);
        if (!expectedBlocks()) return clearInterval(timer);
        if (!document.getElementById('kd-catalog-block') && currentSlug()) render(catalog);
        else if (setupHost() && !document.getElementById('kd-setups-block')) render(catalog);
      }, 1200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
  } else {
    setTimeout(boot, 300);
  }
  window.addEventListener('popstate', function () {
    if (window.KD_CATALOG) render(window.KD_CATALOG);
  });
})();
