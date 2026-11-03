# Архитектура и сборка

Дата: 2026-11-03. Актуальные числа (страницы, товары, размер сборки) — в `docs/tasks.md`.

## Репозитории и домен

| Что | Значение |
|---|---|
| Рабочая копия (`origin`) | `trvlfourme/trvlfourme.github.io`, ветка `main` |
| Прод-репозиторий | `mail4startups-creator/home4work` (значение по умолчанию в `tools/deploy-prod.sh`, переопределяется `PROD_REPO`) |
| Домен | `kabinetdoma.ru`, статика на GitHub Pages |
| Локальный запуск | `node tools/server.js <порт>`, например `node tools/server.js 8100` |

Пуш в `origin` — это только рабочая копия. На прод файлы уезжают скриптом
`bash tools/deploy-prod.sh --push`: он забирает прод-ветку в `_prodcheck/prod-clone`,
запоминает файлы, которые есть только на проде (подтверждения Search Console и т. п.),
заменяет дерево на `git archive main`, прогоняет `verify-build.js` уже по клону и коммитит.
Без `--push` скрипт только готовит и проверяет. Деплой — только с разрешения владельца.

## Каталоги

| Путь | Что это |
|---|---|
| `data/articles/<slug>.json` | источник правды по тексту статьи: `title`, `sections`, `faqList`, `seo`, `id`/`slug`; поля `featuredProductIds` нет (удалено в `4d087eb`) |
| `data/articles/order.json` | порядок и состав статей в бандле |
| `data/catalog.js` | каталог: `products[]` с `offers[]`, `articles[]` с `product_ids`; грузится как `window.KD_CATALOG` |
| `tools/articles.json` | компактный список `{id, slug}` для пререндера (генерируется/обновляется сборкой) |
| `assets/index.js` | минифицированный React-бандл (одна строка, ~1.3 МБ) — SPA целиком |
| `assets/kd-catalog-render.js` | рендер блоков каталога на статических страницах и в SPA |
| `assets/kd-track.js` | цели Метрики: `partner_click`, `tool_view` |
| `assets/kd-admin-catalog.js` | админка каталога (правки в localStorage + экспорт `catalog.js`) |
| `tools/*.js` | генераторы и проверки, `package.json` нет — всё через `node tools/<файл>.js` |
| `article/<slug>/index.html`, `index.html`, `builder/`, `calculator/` … | артефакты пререндера |
| `articles/index.html` | хаб со своей ручной разметкой, не пререндерится (`TABS` в `prerender.js` его не содержит) |
| `sitemap.xml`, `_redirects`, `404.html` | генерируются/обслуживают обход |

## Источники правды и артефакты

1. **Тексты** — только JSON. `tools/apply-articles.js` собирает массив и вставляет его в бандл
   между маркерами `/*kd:articles:start*/` и `/*kd:articles:end*/`. Сборка запускает этот шаг
   первым, `verify-build.js` падает, если бандл разошёлся с JSON. Проверка без сборки:
   `node tools/apply-articles.js --check`.
2. **Каталог** — `data/catalog.js`. Админка умеет отдать готовый файл на скачивание, но живые
   правки в ней лежат в браузере: на сайт попадает только закоммиченный файл.
3. **SEO-метаданные** — `tools/seo-pages-*.json` (`title`, `description`, `related`), их
   применяет `seo-fix.js`.
4. **HTML, sitemap, бандл** — артефакты. Руками не правятся, кроме описанных точечных вставок
   в бандл.

## Сборка

```
PORT=8099 node tools/build.js            # полная: 31 страница + постобработка
PORT=8099 node tools/build.js --only=<slug>   # одна статья, без переноса в корень
node tools/build.js --skip-prerender     # только постобработка
```

Порядок шагов (`tools/build.js`), менять местами нельзя:

1. `apply-articles.js` — JSON статей → бандл.
2. `server.js` на `PORT` + `prerender.js` — headless Chrome снимает DOM каждой страницы в
   `_prerender/` (`--dump-dom`; при падении Chrome на тяжёлых статьях — запасной путь через
   DevTools-протокол с реальной паузой).
3. перенос `_prerender/` в корень сайта.
4. `seo-fix.js` — выверенные `title`/`description`, JSON-LD `Article`/`WebPage`/`FAQPage`/
   `BreadcrumbList` с `@id`, равным адресу страницы, блок перелинковки. Идемпотентен по маркерам
   `<!-- kd-seo -->` и `<!-- kd-links -->`.
5. `optimize-html-images.js` — локальные картинки, `width`/`height`, `loading="lazy"`,
   `fetchpriority="high"` у первой.
6. `make-redirects.js` — 17 страниц на meta-refresh (GitHub Pages не умеет 301) + `_redirects`
   для Cloudflare.
7. `inject-tracker.js` — `assets/kd-track.js` на канонические страницы, кроме редиректов.
8. `sitemap.js` — адреса ровно как в canonical (со слешем), `lastmod` меняется только при
   изменении содержимого (`tools/sitemap-lastmod.json` хранит хэши и коммитится).
9. `verify-build.js` — правила ниже.

Без шагов 4–8 пререндер затирает метаданные, поэтому «собрал и забыл» не работает.

## Что проверяет `verify-build.js`

- в HTML нет `ozon.ru`, нет полей `price`/`priceFrom`;
- у товаров `price_mode` только `hidden`/`note`, `price_rub` — целое > 0;
- `card`-оффер без erid — ошибка; `search`-оффер с erid — ошибка; erid должен быть и в ссылке;
- один erid на нескольких `/cc/`-ссылках — предупреждение (повод сверить кабинет);
- canonical со слешем, `Article`/`WebPage`/`FAQPage` с правильными `@id`, FAQPage на месте;
- sitemap совпадает с canonical, нет сирот и лишних адресов;
- бандл совпадает с JSON статей, картинки локальные, размеры прописаны;
- итог обязан быть «всё чисто: можно выкладывать».

## Как устроен фронтенд

- Один React-бандл, `createRoot(...).render()` (не `hydrateRoot`: гидрация даёт расхождение
  разметки, решение осознанное).
- Страницы: `/`, `/calculator`, `/builder`, `/tests`, `/checklist`, `/catalog`, `/articles`,
  `/about`, `/privacy`, `/terms`, `/article/<slug>/`. Пререндерятся только `TABS` из
  `prerender.js` плюс статьи; хаб `/articles/` — ручная страница.
- Быстрый просмотр статьи: `/?article=<id>` (`ArticleView`). Статическая страница
  `/article/<slug>/` — канонический вход.
- Карточка в ленте — `<a href="/article/<slug>/">`: левый клик без модификаторов перехватывается
  и открывает быстрый просмотр, всё остальное (средняя кнопка, Ctrl/Cmd, краулер) идёт на
  каноническую страницу. Клик по тегу внутри карточки гасит переход и фильтрует ленту.
- Блок товаров: разметку рисует `assets/kd-catalog-render.js`, данные — `data/catalog.js`.
  В SPA `ArticleView` держит слот `<div data-kd-article-slug="<slug>">` и через `ref` вызывает
  `window.KD_CATALOG_RENDER.mount(host, slug|id)`; рендерер принимает и слаг, и id, ставит
  `data-kd-rendered`, чтобы не дублировать блок, и не вставляет ничего в ленту. На статической
  странице тот же слот уже есть в HTML, поэтому второй блок не появляется.
- Товары в блоке — `articles[].product_ids` каталога. Других полей подборок нет:
  `featuredProductIds` удалён (`4d087eb`), а `apply-articles.js` вырезает его, если он появится
  в JSON снова.

## Локальная проверка

```
node tools/server.js 8100          # статика + SPA-фолбэк через index.spa.html
```

- `http://localhost:8100/` — лента, `http://localhost:8100/?article=guide-…` — быстрый просмотр,
- `http://localhost:8100/article/<slug>/` — собранная статическая страница,
- проверить гидрацию/консоль и что блок ровно один.

## Грабли

- `assets/index.js` — одна строка: массовые правки делать node-скриптом с проверкой
  уникальности подстроки, после — `node --check assets/index.js`. Данные статей в бандле
  перезаписываются `apply-articles.js`.
- `str_replace` по путям с прямыми слешами на Windows может падать — использовать обратные.
- HTML-артефакты в CRLF (`.gitattributes` → `* -text`); смешанные переводы строк ломают
  сравнение с продом.
- `sitemap.xml` и `tools/sitemap-lastmod.json` меняются от любой правки страниц — это нормально,
  их коммитят вместе с изменением.
- Пререндер поднимает Chrome: при таймауте/пустом DOM перезапустить сборку, а не править HTML.
- Рабочее дерево общее для нескольких чатов: перед коммитом `git status`/`git diff`, иначе
  чужие правки уедут в твой коммит (уже случалось).
- Админка (`#admin`) и каталог в ней ничего не пишут на сервер: изменения живут в localStorage
  до экспорта `catalog.js`.
- Фоновые node-процессы на 8080/8081/8099/8124/8142/8143 — чужие, не убивать.
