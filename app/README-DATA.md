# Генерация `app/src/data/site.generated.ts` из данных сайта

`app/` — исходники React-приложения (то, из чего собирается `assets/index.js`). Цифры и тексты
в них не живут: источник правды — `data/`, как и у всего остального сайта.

```bash
node tools/sync-app-data.js      # переписать app/src/data/site.generated.ts
cd app && npx vite build         # production-сборка в app/dist/assets/index.js
```

Что попадает в сгенерированный файл:

- `SITE_ARTICLES` — все статьи из `data/articles/*.json` (их же собирает `tools/build.js`),
  `author: "editorial"` разворачивается в `EDITORIAL_AUTHOR`, а `featuredProductIds` берутся
  из привязок каталога (`data/catalog.js` → `articles[].product_ids`);
- `SITE_PRODUCTS` — товары каталога с офферами (`offers`: `store`, `kind`, `url`, `erid`,
  `advertiser`) и ценами `price_mode`/`price_rub`;
- `SITE_LINKS` — `data/product-links.js`.

Файл перезаписывается целиком: править его руками нельзя, как и HTML-артефакты. Правки данных —
только в `data/`, потом `node tools/sync-app-data.js`.

`app/src/data/products.ts` склеивает каталог сайта с редакционными описаниями из
`contentData.ts`: тексты, рейтинги и плюсы остаются там, а цены и партнёрские ссылки приходят
из каталога. Товар, которого нет в каталоге, в сборку не попадает — каталог решает, что продаём.
