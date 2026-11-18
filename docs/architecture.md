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
| `articles/index.html` | хаб `/articles/`: артефакт `tools/build-hub.js` (карточки из `data/articles`, раскладка — `data/hub.js`), не пререндерится (`TABS` его не содержит) |
| `sitemap.xml`, `_redirects`, `404.html` | генерируются/обслуживают обход |

## Порядок статей, даты и источник приложения

- **Порядок везде автоматический.** Лента на главной (массив статей в бандле) и блок
  «Свежие материалы» в хабе строятся по `publishedAt` по убыванию. `data/articles/order.json`
  больше не обязателен и работает только как tie-break для одинаковых дат;
  `data/hub.js` задаёт только блок, название и подзаголовок карточки.
  Выпуск статьи не требует править `order.json`, `data/hub.js` или `articles/index.html`.
- **Свежие не дублируются:** 5 последних статей (`FRESH_COUNT` в `tools/build-hub.js`) стоят
  в блоке «Свежие материалы», в тематических блоках их нет. Выпав из свежих, статья
  возвращается в свой блок по `data/hub.js`.
- **Даты.** В JSON допустимы ISO (`2026-11-03`) и по-русски («03 ноября 2026»); оба формата
  разбирает `tools/article-dates.js` — он же в `apply-articles.js`, `build-hub.js`, `seo-fix.js`
  и `verify-build.js`. В schema `datePublished`/`dateModified` берутся из JSON статьи,
  а не из mtime и не из константы. `publishedAt` в будущем — предупреждение `verify-build`,
  при сортировке такая дата считается сегодняшней.
- **Исходники приложения** (React + Vite) лежат в папке `Исходники */` в корне и в git не
  попадают (`.gitignore`). Инструменты сборки пропускают папки с `package.json`, чтобы
  чужой `index.html` не попал в сайт и в проверки.

## Админка

Редакторская панель — **локальный инструмент**, в публичной сборке её нет. Скрипты лежат
в `tools/admin/` (`loader.js`, `catalog.js`, `links.js`), `tools/` на прод не уезжает, а на
страницах нет ни одного тега админки: `tools/patch-links.js` вырезает такие теги, `verify-build`
падает, если ссылка на `kd-admin` или `tools/admin` вернётся в HTML.

В бандле вход в панель возможен только на `localhost`/`127.0.0.1` и только при
`localStorage.kd_admin_tool === '1'`: ни `?admin=1`, ни `/admin`, ни `Ctrl+Shift+A` в публичной
сборке панель не открывают. PIN по умолчанию из бандла убран, подсказки в форме больше нет.
Ключ Gemini не читается и не сохраняется (`kd_gemini_api_key` в бандле нет), запросы на
`/api/gemini/*` не уходят с заголовком `x-gemini-api-key`. Как открыть панель локально —
`tools/admin/README.md`. Остаток кода AI-редактора (вместе с SDK Google) вырезается только
production-сборкой из исходников, это T-028.

## Картинки

Иллюстрации лежат в `images/editorial` тремя размерами: `<имя>.jpg` (1376×768),
`<имя>-640.jpg` и `<имя>-320.jpg`; логотип — `logo.png` (512), `logo-128.png`, `logo-64.png`.
Варианты создаёт `node tools/make-image-variants.js` — ему нужен `sharp`, в проект он не входит
(`npm i sharp --no-save`, потом каталог `node_modules` можно удалить). Картинки новых статей
без вариантов не попадут в `srcset`, а `verify-build` упадёт с «srcset ссылается на отсутствующие файлы».

Атрибуты `srcset`/`sizes` пишутся в двух местах: в бандле (строки `srcSet:` в `assets/index.js` —
их применяет React при клиентской навигации) и в готовом HTML шагом
`tools/responsive-images.js` (для первой отрисовки до гидратации). Правило простое: поменяли
класс картинки — поправьте размер в `plan()` этого скрипта. `link rel="preload" as="image"` с
`imagesrcset` не используем: Chrome на телефоне выбирает по нему самый крупный кандидат и тянет
лишнее; главной картинке достаточно `fetchpriority="high"`.

## Источники правды и артефакты

1. **Тексты** — только JSON. `tools/apply-articles.js` проверяет JSON и перегенерирует
   `app/src/data/site.generated.ts` (через `tools/sync-app-data.js`); бандл собирается из `app/`
   и обязан содержать slug каждой статьи — это проверяет `node tools/apply-articles.js --check`.
   Маркеров `/*kd:articles:start*/` в бандле больше нет: массив в него не вставляется руками.
2. **Каталог** — `data/catalog.js`. Админка умеет отдать готовый файл на скачивание, но живые
   правки в ней лежат в браузере: на сайт попадает только закоммиченный файл.
3. **SEO-метаданные** — `tools/seo-pages-*.json` (`title`, `description`, `related`), их
   применяет `seo-fix.js`.
4. **HTML, sitemap, бандл** — артефакты. Руками не правятся, кроме описанных точечных вставок
   в бандл.

## Исходники приложения (`app/`)

Бандл `assets/index.js` собирается из React-исходников в `app/` (React 19 + Vite + TypeScript).
В git входят `src/`, `scripts/`, конфиги и `README-DATA.md`; `app/node_modules`, `app/dist`
и `app/public` — нет. Цифры и тексты в `app/` не живут: `node tools/sync-app-data.js`
переписывает `app/src/data/site.generated.ts` из `data/articles/*.json`, `data/catalog.js`
и `data/product-links.js`, а `app/src/data/products.ts` склеивает каталог с редакционными
описаниями из `contentData.ts`. Сгенерированный файл править нельзя — как и HTML-артефакты.

Сборка: `cd app && npx vite build` → `app/dist/assets/index.js`. Перед подменой бандла на сайте
проверить гейты из T-028: в сборке не должно быть админки, `@google/genai`, выдуманных
партнёрских ссылок (`ozon.ru/search`, `ref=WBR_KD`), а `srcSet` и canonical
должны быть перенесены из текущего бандла. Установка зависимостей требует
`npm install --legacy-peer-deps`: в `package.json` нет lockfile под vite 8 и esbuild
разъезжается по peer-зависимостям.

## Режим «сайт без ПДн»

Владелец выбрал режим без обработки персональных данных: на сайте нет счётчиков, Вебвизора,
чужих шрифтов и любых сторонних запросов. Держится это двумя вещами: `tools/strip-third-party.js`
в сборке и проверкой в `verify-build.js` — если на странице появится `mc.yandex`,
`fonts.googleapis.com`, `fonts.gstatic.com` или `kd-track.js`, сборка падает. Новые интеграции
(аналитика, шрифты, виджеты) в этот режим не добавляются без отдельного решения владельца и
правки политики (T-054). Шрифты — системные: `--font-sans` в `assets/index.css`.

## Заголовки безопасности

GitHub Pages не отдаёт HTTP-заголовки, поэтому политика живёт в разметке. `tools/security-headers.js`
шагом сборки ставит в каждую страницу две строки сразу после `meta charset`:

- `Content-Security-Policy`: `default-src 'self'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'`
  (нужен для style-атрибутов React), `img-src 'self' data:`, `font-src 'self'`, `connect-src 'self'`,
  `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-src 'none'`. Хеши не нужны:
  исполняемых инлайн-скриптов на страницах нет, всё инлайн-содержимое — `application/ld+json`;
- `Referrer-Policy: strict-origin-when-cross-origin` (meta `name="referrer"`).

Ограничения хостинга, которые meta-тегом не решаются: `X-Frame-Options` и `frame-ancestors`
(защита от встраивания в iframe), `HSTS` и `X-Content-Type-Options`. Они появятся при переезде,
где заголовки настраиваются на сервере (`docs/migration-hothat.md`). Проверка полноты разметки —
`node tools/security-headers.js --check`.

## Бэкапы

Бэкап — архив ветки `main` плюс проверка, что из него всё восстанавливается:

    bash tools/backup.sh          # архив в .backup/ и проверка распаковкой
    bash tools/backup.sh --check  # проверить последний архив, новый не делать

`.backup/` в `.gitignore`: архив лежит на диске (и синхронизируется в OneDrive), в git и на
прод не попадает. Скрипт сверяет число файлов с деревом ветки, прогоняет `node --check` по
бандлу, `apply-articles.js --check` и проверяет наличие ключевых файлов
(`index.html`, `articles/index.html`, `sitemap.xml`, `robots.txt`, `404.html`,
`_redirects`, `data/catalog.js`, `app/package.json`). Архив, который не прошёл проверку,
бэкапом не считается.

## Сборка

```
PORT=8099 node tools/build.js            # полная: 31 страница + постобработка
PORT=8099 node tools/build.js --only=<slug>   # одна статья, без переноса в корень
node tools/build.js --skip-prerender     # только постобработка
```

Порядок шагов (`tools/build.js`), менять местами нельзя:

1. `apply-articles.js` — JSON статей → `app/src/data/site.generated.ts` (бандл при этом не правится).
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
7. `strip-third-party.js` — снимает внешние вставки (Метрика, Google Fonts, трекер целей);
   запускается дважды: до пререндера (чистит оболочку) и финально — по всем страницам.
8. `sitemap.js` — адреса ровно как в canonical (со слешем), `lastmod` меняется только при
   изменении содержимого (`tools/sitemap-lastmod.json` хранит хэши и коммитится).
9. `security-headers.js` — CSP и Referrer-Policy meta-тегами во все страницы (T-065);
   идемпотентен, старые теги снимает и ставит заново после `meta charset`.
10. `verify-build.js` — правила ниже.

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

### Цены товаров: только официальный API партнёрской программы

Витрина цены не печатает (`price_mode: hidden`); `price_rub` хранится как база для сверки. Карточки Маркета руками не открывать — отдают captcha. Цену и наличие по партнёрской ссылке отдаёт
`GET https://api.content.market.yandex.ru/v3/affiliate/partner/link/info?url=<ссылка>` с заголовком
`Authorization: OAuth <токен>`: поля `price` (рубли) и `stockAmount`. Метод требует соглашения
«API Яндекс Маркет для партнеров»; токен лежит в `.secrets/market-token` (папка в `.gitignore`),
на сайт, в git и на прод не попадает. Ответ API — не повод включать `note`: показывать цену
можно только со свежей датой сверки.

### Сбор цен: `tools/market-prices.js`

Скрипт читает `data/catalog.js`, ходит по yandex-ссылкам тем же методом `/partner/link/info` (токен — `.secrets/market-token`, `Authorization: OAuth`) и печатает таблицу «товар → было → стало → дельта → наличие».

- `node tools/market-prices.js` — отчёт человеку; `--json` — то же машинным чтением; `--out <файл>` —
  сохранить отчёт (файл в репозиторий не кладём); `--only-id`, `--data`, `--token-file`, `--timeout` — как у
  `check-offers.js`;
- цена товара берётся с «главного» оффера: `kind: card` раньше остальных; `stockAmount: 0` и пустой `price`
  означают распродажу — старая цена в данных не затирается, товар попадает в список кандидатов на замену;
- код выхода 1, если были ошибки запросов или пустая цена: годится для cron; токен не печатается;
- скрипт ничего не пишет в репозиторий: `price_rub` вносится отдельной правкой, `updated` каталога — на дату
  сверки; `price_mode` остаётся `hidden`, витрина цен не показывает.

### Сетевая проверка офферов: `tools/check-offers.js`

`verify-build.js` проверяет структуру данных, но не сеть: битый URL с корректным erid её проходит.
Отдельный скрипт открывает все ссылки каталога и `data/product-links.js` (HEAD с таймаутом,
при 403/405 — GET), редиректы не разворачивает, а сверяет хост `Location` с маркетплейсами.

- `node tools/check-offers.js` — отчёт «товар → магазин → ссылка → что не так», итог
  «проверено N, подозрительных M», код выхода 1 при находках (годится для cron);
- `--json` — то же машинным чтением, `--only-id <id>` — один товар, `--data <dir>` — данные из
  другой папки (так проверяют сам скрипт), `--no-net` — только правила данных;
- таймаут и 5xx повторяются один раз: плавающий ответ CDN не превращается в «битую ссылку»;
- если DNS не отвечает ни на один хост, печатается «сети нет: проверка ссылок пропущена»,
  и такие ссылки не считаются битыми;
- `price_rub` необязателен, как и в `verify-build`; товары без цены перечисляются отдельной
  строкой — это подсказка контенту, а не ошибка;
- в публикацию не попадает: `deploy-prod.sh` выкладывает только список `PUBLIC`.


## Как устроен фронтенд

- Один React-бандл, `createRoot(...).render()` (не `hydrateRoot`: гидрация даёт расхождение
  разметки, решение осознанное).
- Страницы: `/`, `/calculator`, `/builder`, `/tests`, `/checklist`, `/catalog`, `/articles`,
  `/about`, `/privacy`, `/terms`, `/article/<slug>/`. Пререндерятся только `TABS` из
  `prerender.js` плюс статьи; хаб `/articles/` — отдельная статическая страница, которую
  собирает `tools/build-hub.js`.
- Быстрый просмотр статьи: открывается из ленты, меняет адрес на канонический
  `/article/<slug>/` и `document.title`, «назад» закрывает статью. Старые ссылки
  `/?article=<id>` нормализуются на тот же адрес. Статическая страница `/article/<slug>/` —
  канонический вход, на неё же ведут карточки и `sitemap.xml`.
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
- Админка живёт только локально (`tools/admin`, см. раздел «Админка»): на сайте её нет,
  а правки каталога всё равно остаются в localStorage до экспорта `catalog.js`.
- Фоновые node-процессы на 8080/8081/8099/8124/8142/8143 — чужие, не убивать.
