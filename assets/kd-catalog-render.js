// Рендер каталога на страницах сайта: товары в статьях.
// Источник: /data/catalog.js (window.KD_CATALOG). Ссылки переопределяются
// через window.KD_PRODUCT_LINKS (data/product-links.js) и localStorage.kd_product_links.
// Бандл assets/index.js не трогаем: новые товары появляются этим скриптом.
// Стили — классы .kd-cat-* в assets/index.css.
(function () {
  'use strict';
  var CATALOG = null;
  var mountIds = ['kd-catalog-block'];

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
        render(fresh, true);
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
      // Рекламой считается только партнёрская ссылка: у неё есть erid и рекламодатель.
      // Поисковая ссылка — обычная навигация, помечать её sponsored нельзя.
      var ad = o.kind !== 'search' && !!o.erid;
      var rel = ad ? 'noopener noreferrer sponsored nofollow' : 'noopener noreferrer nofollow';
      return '<a class="kd-cat-btn' + (o.kind !== 'search' ? ' kd-cat-btn-buy' : '') + '" href="' + esc(o.url) + '" ' +
        'target="_blank" rel="' + rel + '">' + esc(offerLabel(o)) + '</a>';
    }).join('');
  }

  function productCard(product, opts) {
    opts = opts || {};
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
    } else if (opts.showPrice && Number(product.price_rub) > 0) {
      html += '<div class="kd-cat-price-note"><b>Ориентир</b> — ' + money(product.price_rub) + '</div>';
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
    section.insertAdjacentHTML('beforeend', priceDisclaimer(catalog, products));
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

  // Статья каталога по слагу или id: у статической страницы слаг, у SPA id.
  function entryOf(key, catalog) {
    var k = String(key || '');
    if (!k) return null;
    var list = (catalog && catalog.articles) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === k || list[i].id === k) return list[i];
    }
    return null;
  }

  // Только страница статьи: в ленте article — карточка материала, туда блок не ставим.
  function articleHost() {
    if (!/\/article\//.test(window.location.pathname)) return null;
    return document.querySelector('article [class*="col-span-8"]') ||
      document.querySelector('article');
  }

  // Слот, который рисует SPA-просмотр: <div data-kd-article-slug="...">.
  function mountInto(host, key, force) {
    if (!host) return;
    var slug = String(key || '');
    var catalog = window.KD_CATALOG;
    if (!catalog) {
      setTimeout(function () { mountInto(host, slug); }, 200);
      return;
    }
    if (!force && host.getAttribute('data-kd-rendered') === slug && host.firstChild) return;
    host.innerHTML = '';
    var entry = entryOf(slug, catalog);
    if (!entry) return;
    var block = articleBlock(entry, catalog);
    if (!block) return;
    host.appendChild(block);
    host.setAttribute('data-kd-rendered', slug);
  }

  function mountSlots(force) {
    var slots = document.querySelectorAll('[data-kd-article-slug]');
    for (var i = 0; i < slots.length; i++) {
      mountInto(slots[i], slots[i].getAttribute('data-kd-article-slug'), force);
    }
  }

  function clearBlocks() {
    mountIds.forEach(function (id) {
      var found = document.getElementById(id);
      if (found && found.parentNode) found.parentNode.removeChild(found);
    });
  }

  function render(catalog, force) {
    clearBlocks();
    if (!catalog) return;
    mountSlots(force);
    // Просмотр статьи на React сам держит слот — второй блок в контейнер не нужен.
    if (document.querySelector('[data-kd-article-slug]')) return;
    var slug = currentSlug();
    var host = articleHost();
    if (!slug || !host) return;
    var entry = entryOf(slug, catalog);
    if (!entry) return;
    var block = articleBlock(entry, catalog);
    if (block) host.appendChild(block);
  }

  function expectedBlocks() {
    return !!currentSlug() && !!articleHost();
  }

  function boot() {
    loadCatalog(function (catalog) {
      mountSlots();
      if (!catalog || !expectedBlocks()) return;
      render(catalog);
      // Страховка на случай, если гидрация React перерисовала контейнер.
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        if (tries > 20) return clearInterval(timer);
        if (!expectedBlocks()) return clearInterval(timer);
        if (!document.getElementById('kd-catalog-block') && currentSlug()) render(catalog);
      }, 1200);
    });
    // Слот SPA появляется позже, чем грузится каталог.
    var slotTries = 0;
    var slotTimer = setInterval(function () {
      slotTries++;
      if (slotTries > 30) return clearInterval(slotTimer);
      if (document.querySelector('[data-kd-article-slug]')) {
        mountSlots();
        clearInterval(slotTimer);
      }
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
  } else {
    setTimeout(boot, 300);
  }
  window.addEventListener('popstate', function () {
    if (window.KD_CATALOG) render(window.KD_CATALOG);
  });
  window.KD_CATALOG_RENDER = {
    render: function () { render(window.KD_CATALOG); },
    mount: function (host, slug) { mountInto(host, slug); },
  };
})();
