#!/usr/bin/env node
// Собирает app/src/data/site.generated.ts из данных сайта: статьи, каталог, партнёрские ссылки.
// Запуск: node tools/sync-app-data.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'app/src/data/site.generated.ts');

function loadWindowFile(rel) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox, { filename: rel });
  return sandbox.window;
}

const catalog = loadWindowFile('data/catalog.js').KD_CATALOG;
const links = loadWindowFile('data/product-links.js').KD_PRODUCT_LINKS || {};

const bySlug = new Map((catalog.articles || []).map((a) => [a.slug, a]));

// order.json — не статья, а порядок выдачи хаба: он строится по каталогу.
const files = fs
  .readdirSync(path.join(ROOT, 'data/articles'))
  .filter((f) => f.endsWith('.json') && f !== 'order.json');

// Категории, которые есть в данных, но не в типе приложения: уводим в ближайшую.
const CATEGORY_ALIASES = { 'remote-work': 'with-kids' };
const articles = files.map((file) => {
  const a = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/articles', file), 'utf8'));
  const link = bySlug.get(a.slug);
  return {
    id: a.id,
    slug: a.slug,
    slugAliases: a.slugAliases || [],
    title: a.title,
    subtitle: a.subtitle || '',
    excerpt: a.excerpt || '',
    category: CATEGORY_ALIASES[a.category] || a.category,
    tags: a.tags || [],
    author: a.author === 'editorial' || !a.author ? 'EDITORIAL_AUTHOR' : a.author,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt || a.publishedAt,
    readTimeMin: a.readTimeMin,
    heroImage: a.heroImage,
    // В оглавлении иногда лежит лишний erid от старого генератора — берём только id и label.
    tableOfContents: (a.tableOfContents || []).map((t) => ({ id: t.id, label: t.label })),
    sections: (a.sections || []).map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      ...(s.highlightBox ? { highlightBox: s.highlightBox } : {}),
      ...(s.productIds ? { productIds: s.productIds } : {}),
    })),
    featuredProductIds: a.featuredProductIds || (link ? link.product_ids : []),
    conclusion: a.conclusion || '',
    faqList: a.faqList || [],
    seo: {
      metaTitle: (a.seo && a.seo.metaTitle) || a.title,
      metaDescription: (a.seo && a.seo.metaDescription) || a.excerpt || '',
      primaryKeyword: (a.seo && a.seo.primaryKeyword) || '',
      secondaryKeywords: (a.seo && a.seo.secondaryKeywords) || [],
      yandexWordstatSearches: (a.seo && a.seo.yandexWordstatSearches) || 0,
    },
  };
});

// Статьи в том порядке, в котором их отдаёт каталог (свежие сверху), остальные — по дате файла.
const order = new Map((catalog.articles || []).map((a, i) => [a.slug, i]));
articles.sort((x, y) => {
  const ox = order.has(x.slug) ? order.get(x.slug) : 10_000;
  const oy = order.has(y.slug) ? order.get(y.slug) : 10_000;
  return ox - oy;
});

const products = (catalog.products || [])
  .filter((p) => !p.archived)
  .map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand || '',
    category: p.category || '',
    summary: p.summary || '',
    priceMode: p.price_mode === 'note' ? 'note' : 'hidden',
    priceNote: p.price_note || '',
    priceRub: p.price_rub || 0,
    offers: (p.offers || []).map((o) => ({
      store: o.store,
      kind: o.kind,
      url: o.url,
      label: o.label || '',
      erid: o.erid || '',
      advertiser: o.advertiser || '',
    })),
    links: links[p.id] || {},
  }));

const banner = `// СГЕНЕРИРОВАНО tools/sync-app-data.js — руками не править.
// Источник: data/articles/*.json, data/catalog.js, data/product-links.js.
/* eslint-disable */
import type { Article } from '../types';
import { EDITORIAL_AUTHOR } from './editorial';

export interface SiteOffer {
  store: string;
  kind: string;
  url: string;
  label: string;
  erid: string;
  advertiser: string;
}

export interface SiteProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  summary: string;
  priceMode: 'hidden' | 'note';
  priceNote: string;
  priceRub: number;
  offers: SiteOffer[];
  links: { yandex?: string; ozon?: string; wb?: string };
}
`;

const body = `
export const SITE_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)
  .replace(/"EDITORIAL_AUTHOR"/g, 'EDITORIAL_AUTHOR')
  .replace(/\n/g, '\n')};

export const SITE_PRODUCTS: SiteProduct[] = ${JSON.stringify(products, null, 2)};

export const SITE_UPDATED = ${JSON.stringify(catalog.updated || '')};
`;

fs.writeFileSync(OUT, banner + body);
console.log(
  `app/src/data/site.generated.ts: статей ${articles.length}, товаров ${products.length}, обновлено ${catalog.updated || '—'}`
);
