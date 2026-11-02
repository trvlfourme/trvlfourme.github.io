// Рендер каталога на страницах сайта: товары в статьях и готовые сетапы.
// Источник: /data/catalog.js (window.KD_CATALOG). Ссылки переопределяются
// через window.KD_PRODUCT_LINKS (data/product-links.js) и localStorage.kd_product_links.
// Бандл assets/index.js не трогаем: новые товары появляются этим скриптом.
// Стили — классы .kd-cat-* в assets/index.css.
(function () {
  'use strict';
  var CATALOG = null;
  var mountIds = ['kd-catalog-block', 'kd-setups-block'];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function node(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }

  // Свежий каталог: fetch с ревалидацией, без ожидания кэша GitHub Pages.
  function fetchFresh(cb) {
    if (typeof fetch !== 'function') return cb(null);
    fetch('/data/catalog.js', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (text) {
        if (!text) return cb(null);
        try {
          window.eval(text);
          cb(window.KD_CATALOG || null);
        } catch (e) { cb(null); }
      })
      .catch(function () { cb(null); });
  }

  function loadCatalog(cb) {
    if (window.KD_CATALOG) {
      cb(window.KD_CATALOG);
      fetchFresh(function (fresh) {
        if (!fresh || !fresh.products) return;
        var before = JSON.stringify(window.KD_CATALOG);
        if (JSON.stringify(fresh) === before) return;
        window.KD_CATALOG = fresh;
        render(fresh);
      });
      return;
    }
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
  function withErid(url, erid) {
    var u = (url || '').trim();
    if (!u || !erid || u.indexOf('erid=') >= 0) return u;
    return u + (u.indexOf('?') >= 0 ? '&' : '?') + 'erid=' + encodeURIComponent(erid);
  }

  function money(value) {
    var raw = String(value).trim();
    if (!/^\d+$/.test(raw)) return esc(raw);
    return Number(raw).toLocaleString('ru-RU') + '&nbsp;₽';
  }

  function ruDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return '';
    var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return Number(m[3]) + ' ' + months[Number(m[2]) - 1] + ' ' + m[1];
  }

  function priceDisclaimer(catalog, products) {
    var hasNote = (products || []).some(function (p) { return p && p.price_mode === 'note' && p.price_note; });
    if (!hasNote) return '';
    var date = ruDate(catalog && catalog.updated);
    return '<div class="kd-cat-disclaimer">Цены — ориентир' + (date ? ' на ' + date : '') +
      '. На Маркете они меняются каждый день: актуальную смотрите по кнопке у товара.</div>';
  }

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
      url = withErid(url, o.erid);
      out.push({
        store: o.store, kind: o.kind === 'card' ? 'card' : 'search',
        url: (url || '').trim(), label: o.label || '', erid: o.erid || '', advertiser: o.advertiser || '',
      });
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
      html += '<div class="kd-cat-ad">Реклама.' + who + ' erid: ' + esc(o.erid) + '</div>';
    });
    return html;
  }

  function buttonsHtml(offers) {
    return offers.map(function (o) {
      var buy = o.kind !== 'search';
      return '<a class="kd-cat-btn' + (buy ? ' kd-cat-btn-buy' : '') + '" href="' + esc(o.url) + '" ' +
        'target="_blank" rel="noopener noreferrer sponsored nofollow">' + esc(offerLabel(o)) + '</a>';
    }).join('');
  }

  function productCard(product) {
    var offers = offersOf(product);
    var card = node('div', 'kd-cat-card');
    card.setAttribute('data-kd-product', product.id);
    var html = '';
    if (product.image) {
      html += '<img class="kd-cat-thumb" src="' + esc(product.image) + '" alt="' + esc(product.name) +
        '" loading="lazy" decoding="async">';
    }
    html += '<div class="kd-cat-body">';
    html += '<div class="kd-cat-title-row"><div class="kd-cat-title">' + esc(product.name) + '</div>' +
      (product.brand ? '<div class="kd-cat-brand">' + esc(product.brand) + '</div>' : '') + '</div>';
    if (product.summary) html += '<div class="kd-cat-summary">' + esc(product.summary) + '</div>';
    if (product.price_mode === 'note' && product.price_note) {
      html += '<div class="kd-cat-price-note"><b>Ориентир</b> — ' + money(product.price_note) + '</div>';
    }
    if (offers.length) {
      html += '<div class="kd-cat-actions">' + buttonsHtml(offers) + '</div>' + adNotes(offers);
    }
    html += '</div>';
    card.innerHTML = html;
    return card;
  }

  function productsOf(ids, catalog) {
    var byId = {};
    (catalog.products || []).forEach(function (p) { byId[p.id] = p; });
    return (ids || []).map(function (id) { return byId[id]; }).filter(function (p) { return p && !p.archived; });
  }

  function headingHtml(title, subtitle) {
    return '<h2 class="kd-cat-heading">' + esc(title) + '</h2>' +
      (subtitle ? '<div class="kd-cat-sub">' + esc(subtitle) + '</div>' : '');
  }

  function articleBlock(entry, catalog) {
    var products = productsOf(entry.product_ids, catalog);
    if (!products.length) return null;
    var section = node('section', 'kd-cat-block');
    section.id = 'kd-catalog-block';
    section.innerHTML = headingHtml(entry.block_title || 'Товары из этой статьи', 'Подборка каталога «Кабинет Дома»');
    products.forEach(function (p) { section.appendChild(productCard(p)); });
    return section;
  }

  function setupsBlock(catalog) {
    var levels = {};
    (catalog.levels || []).forEach(function (l) { levels[l.level] = l; });
    var setups = (catalog.setups || []).slice().sort(function (a, b) { return (a.level || 0) - (b.level || 0); });
    if (!setups.length) return null;
    var setupProducts = [];
    var section = node('section', 'kd-cat-block');
    section.id = 'kd-setups-block';
    section.innerHTML = headingHtml('Готовые сетапы', 'Наборы одного уровня: название и состав правятся в каталоге');
    setups.forEach(function (setup) {
      var level = levels[setup.level] || {};
      var card = node('div', 'kd-cat-setup');
      var html = '<div class="kd-cat-setup-head">' +
        '<span class="kd-cat-level">' + esc(level.title || ('Уровень ' + setup.level)) + '</span>' +
        '<span class="kd-cat-setup-title">' + esc(setup.title) + '</span></div>';
      if (level.note) html += '<div class="kd-cat-level-note">' + esc(level.note) + '</div>';
      if (setup.description) html += '<div class="kd-cat-setup-desc">' + esc(setup.description) + '</div>';
      card.innerHTML = html;
      var products = productsOf(setup.product_ids, catalog);
      products.forEach(function (p) { card.appendChild(productCard(p)); });
      if (!products.length) card.appendChild(node('div', 'kd-cat-empty', 'Состав ещё не заполнен'));
      setupProducts = setupProducts.concat(products);
      section.appendChild(card);
    });
    section.insertAdjacentHTML('beforeend', priceDisclaimer(catalog, setupProducts));
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
  window.KD_CATALOG_RENDER = { render: function () { render(window.KD_CATALOG); } };
})();
