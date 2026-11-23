# Архитектура и сборка

Дата: 2026-11-20. Актуальные числа (страницы, товары, размер сборки) — в `docs/tasks.md`.

## Репозиторий, хостинг и домен

| Что | Значение |
|---|---|
| Рабочая копия (`origin`) | `trvlfourme/trvlfourme.github.io`, ветка `main`: и рабочая копия, и репозиторий, из которого выкладывает панель |
| Хостинг | hothat.ru, cPanel, LiteSpeed, аккаунт `p14021`, выделенный IP `178.57.216.221`, тариф «Пять» (5 сайтов, 5 ГБ) |
| Сайт на сервере | `${HOME}/kabinetdoma.ru` = `/home/p14021/kabinetdoma.ru` — корневой каталог домена, вне `public_html` |
| Клон для выкладки | `/home/p14021/repositories/kabinetdoma` — копия этого репозитория, отдельно от корня сайта |
| Домен | `kabinetdoma.ru` и `www` (отдельная A-запись), DNS на nic.ru, AutoSSL Let's Encrypt с 19.11.2026 до 17.02.2027 |
| Второй сайт на аккаунте | `trvl4.me` — его каталог, `.htaccess` и сертификат не трогаем |
| Локальный запуск | `node tools/server.js <порт>`, например `node tools/server.js 8100` |
| Бывший хостинг | GitHub Pages и репозиторий `mail4startups-creator/home4work`: с 20.11.2026 сайт там не живёт |

Сайт статический: сервер отдаёт готовые файлы, PHP, базы и Node на хостинге не нужны.
`git push origin main` обновляет GitHub и рабочую копию, но **не** сайт: файлы в
`${HOME}/kabinetdoma.ru` кладёт панель cPanel, запасной путь — rsync по SSH (см. «Выкладка»).

## Выкладка

| Что | Где |
|---|---|
| Состав публикации | `tools/public-manifest.txt` — единственный список того, что уезжает на сайт |
| Задание панели | `.cpanel.yml` — команды кнопки «Deploy HEAD Commit» |
| Выкладка по SSH | `bash tools/deploy-hothat.sh` — сухой прогон; `--push` — rsync |
| Правила сервера | `.htaccess`, генерируется `node tools/make-htaccess.js` |
| Архив | `tools/archive/deploy-prod.sh` — выкладка на GitHub Pages, не используется |

**Панель.** cPanel → «Files» → «Git™ Version Control» держит `git clone` этого репозитория в
`/home/<аккаунт>/repositories/kabinetdoma` — **не** в корне сайта, иначе `.git`, `docs/`,
`tools/`, `app/` стали бы публичными. Обновление — две кнопки по порядку:
**«Update from Remote»** (`git pull --ff-only`, забирает коммиты из GitHub) и
**«Deploy HEAD Commit»** (запускает `.cpanel.yml`). Пуш в GitHub панель не уведомляет:
одна первая кнопка сайт не меняет, нужны обе.

**Что делает `.cpanel.yml`.** `DEPLOYPATH` = `${HOME}/kabinetdoma.ru` (с подстраховкой
`/home/$(whoami)`); если в клоне нет `tools/public-manifest.txt`, задача падает с объяснением:
значит, панель склонировала не тот репозиторий. Дальше awk выбирает из манифеста секции
«общие» + «только cPanel» и пропускает «только GitHub Pages» (`CNAME`, `.nojekyll`,
`_redirects`). `rm -rf` сначала убирает прошлую версию каждой записи, чтобы удалённые у нас
файлы не висели на сайте; `cp -a` копирует новую, маски вроде `google*.html` раскрываются, а
запись без совпадений пропускается. В конце `find -name '*.md' -delete` снимает заметки внутри
публикуемых папок (`images/SOURCES.md`) — правило T-053. `.htaccess` — единственная запись
секции «только cPanel»: на GitHub Pages он не нужен.

**`tools/deploy-hothat.sh`.** Тот же состав без панели, по SSH: собирает stage в
`_hothatcheck/stage`, отказывается, если в публикацию попали `docs/`, `tools/`, `app/`,
`content/`, `*.md`, `.git`, `_redirects`, `CNAME`, `.nojekyll`, и прогоняет
`verify-build.js` с `KD_HOSTING=hothat`. `--push` требует
`HOTHAT_REMOTE=user@host:/home/<аккаунт>/kabinetdoma.ru/` — путь обязан заканчиваться на
`kabinetdoma.ru`, иначе rsync `--delete` снесёт чужой сайт; ключ — `HOTHAT_KEY`
(по умолчанию `.secrets/hothat_ed25519`), порт — `HOTHAT_PORT`. С 20.11.2026 это запасной
путь: с рабочей машины SSH к серверу не проходит (порт 22 — reset, 2222 — refused), `rsync`
локально не установлен, поэтому выкладка идёт кнопками панели.

**Требования к клону.** «Deploy HEAD Commit» серая, пока в клоне есть незакоммиченные правки
или пока панель не видит `.cpanel.yml` в HEAD. Поэтому `.cpanel.yml`, `tools/` и `.htaccess`
правят в репозитории и пушат, а на сервере не редактируют. Клонировать надо рабочий
репозиторий: в `mail4startups-creator/home4work` лежала только готовая публикация — без
`tools/`, `.cpanel.yml` и `.htaccess`, выкладывать из него нечего.

**`.htaccess`.** Источник правил — `_redirects` (16 пар «старый адрес → новый, 301») и `data/articles/*.json` (27 пар «id → slug» для старых параметрических адресов `/?article=<id>`, T-168).
`node tools/make-htaccess.js` собирает из них `.htaccess`: `Options -Indexes`, `DirectoryIndex`,
`ErrorDocument 404`, http→https, `www`→apex с сохранением пути, блок `mod_rewrite` с 16
`RewriteRule`, `mod_expires` (HTML без долгого кэша, `assets/*` с `max-age`), `mod_headers`
(см. «Заголовки безопасности») и `AddDefaultCharset UTF-8`. Всё лежит внутри `<IfModule>`,
поэтому на сборке без модуля файл не роняет сайт. Руками `.htaccess` не правят: меняют
`_redirects` или генератор, затем запускают `node tools/make-htaccess.js`, сверка —
`node tools/make-htaccess.js --check`. Раньше правила были на `mod_alias` (`Redirect 301`),
и на LiteSpeed часть воркеров отдавала 200 вместо 301; после перехода на `RewriteRule`
замер §7 п.6 (T-157, 20.11.2026) дал 160/160 `301` с точным `Location` на 16 адресах × 10.

**Порядок выкладки** (только с разрешения владельца, с локом `деплой` на доске):

1. `bash tools/deploy-hothat.sh` — сухой прогон: состав, `verify-build`, число файлов и объём.
2. `git push origin main` — коммит должен доехать до GitHub, иначе «Update from Remote» его не увидит.
3. Владелец: «Update from Remote» → «Deploy HEAD Commit».
4. Проверка на живом сайте: `curl -sI https://kabinetdoma.ru/ | head -1`, адреса из
   `sitemap.xml`, 16 старых адресов (301), служебные пути (`/docs/questions.md` — 404,
   `/.htaccess` — 403), `https://www` (один 301 на apex).
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
| `tables/index.html` | таблица высот `/tables/`: артефакт `tools/build-tables.js` из `data/tables.json`, не пререндерится; метаданные и перелинковку дописывает `seo-fix.js` (T-171) |
| `sitemap.xml`, `404.html` | артефакты сборки; `_redirects` — источник правил для `.htaccess`, на сайт не уезжает |

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

Текст статьи может содержать `<figure><img src="…" alt="…"><figcaption>…</figcaption></figure>`
в `sections[].content` — так в статьях появляются схемы и фото (с 2026-11-18).
`MarkdownRenderer` (`app/src/components/MarkdownRenderer.tsx`) превращает такой блок в `<figure>`
с подписью и адаптивным `srcset` по схеме из `app/src/utils/images.ts`; SVG из `images/` кладутся
без вариантов `-640`/`-320`, `srcset` для них не строится. `alt` обязателен, иначе блок считается
неполным. Другие HTML-теги в тексте статей не поддерживаются: всё, кроме `<figure>`, выводится
как обычный абзац.

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

Политика живёт в двух местах: CSP и `Referrer-Policy` — в разметке, остальное — в `.htaccess`.

`tools/security-headers.js` шагом сборки ставит в каждую страницу две строки сразу после
`meta charset`:

- `Content-Security-Policy`: `default-src 'self'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'`
  (нужен для style-атрибутов React), `img-src 'self' data:`, `font-src 'self'`, `connect-src 'self'`,
  `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-src 'none'`. Хеши не нужны:
  исполняемых инлайн-скриптов на страницах нет, всё инлайн-содержимое — `application/ld+json`;
- `Referrer-Policy: strict-origin-when-cross-origin` (meta `name="referrer"`).

Серверные заголовки даёт `.htaccess` (генератор `tools/make-htaccess.js`): в блоке
`<IfModule mod_headers.c>` стоят `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin` и `X-Frame-Options: SAMEORIGIN`, рядом
`AddDefaultCharset UTF-8`. HSTS (`Strict-Transport-Security: max-age=31536000`) с 20.11.2026
(T-159) стоит в том же блоке `mod_headers`: до этого его держали выключенным, пока не прошли
сутки нормальной работы после выпуска сертификата. HSTS прибивает схему в браузере на год и
делает быстрый откат `www` невозможным, поэтому убирают его только правкой генератора
(`tools/make-htaccess.js`) с перегенерацией `.htaccess`, а не правкой файла на сервере.
Заголовки проверяют на живом сайте через `curl -sI`: сам `.htaccess`
снаружи не читается (403), поэтому состояние правил видно только по поведению адресов.
Проверка полноты разметки — `node tools/security-headers.js --check`.
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
PORT=8099 node tools/build.js            # полная: пререндер всех страниц + постобработка
PORT=8099 node tools/build.js --only=<slug>   # одна статья, без переноса в корень
node tools/build.js --skip-prerender     # только постобработка
```

Порядок шагов (`tools/build.js`), менять местами нельзя:

1. `apply-articles.js` — JSON статей → `app/src/data/site.generated.ts` (бандл при этом не правится).
2. `server.js` на `PORT` + `prerender.js` — headless Chrome снимает DOM каждой страницы в
   `_prerender/` (`--dump-dom`; при падении Chrome на тяжёлых статьях — запасной путь через
   DevTools-протокол с реальной паузой).
3. перенос `_prerender/` в корень сайта.
4. `build-tables.js` — страница `/tables/` из `data/tables.json`: проверяет диапазон 110–200 см,
   шаг 5 см, целые высоты и внутренние ссылки, `--check` сверяет готовый файл с JSON. Стоит
   **до** `seo-fix.js`: генератор пишет страницу целиком и иначе затирал бы её метаданные,
   `kd-links` и `theme-color` (ошибка порядка, T-171).
5. `seo-fix.js` — выверенные `title`/`description`, JSON-LD `Article`/`WebPage`/`FAQPage`/
   `BreadcrumbList` с `@id`, равным адресу страницы, блок перелинковки. Идемпотентен по маркерам
   `<!-- kd-seo -->` и `<!-- kd-links -->`. Метаданные `/tables/` берёт из `data/tables.json`,
   отдельной записи в `seo-pages-*.json` у страницы нет.
6. `optimize-html-images.js` — локальные картинки, `width`/`height`, `loading="lazy"`,
   `fetchpriority="high"` у первой.
7. `make-redirects.js` — 16 правил в `_redirects` и meta-refresh в старых страницах.
   `.htaccess` в сборку не входит: его отдельно собирает `node tools/make-htaccess.js`,
   иначе правила сервера и `_redirects` разъезжаются.
8. `strip-third-party.js` — снимает внешние вставки (Метрика, Google Fonts, трекер целей);
   запускается дважды: до пререндера (чистит оболочку) и финально — по всем страницам.
9. `build-hub.js` — хаб `/articles/` из `data/articles` и `data/hub.js`; ссылка на `/tables/`
   живёт в блоке «Инструменты вместо чтения» шаблона `tools/hub-template.html`.
10. `responsive-images.js` — адаптивные картинки и preload.
11. `strip-third-party.js` — финальный проход по всем страницам.
12. `security-headers.js` — CSP и Referrer-Policy meta-тегами во все страницы (T-065);
    идемпотентен, старые теги снимает и ставит заново после `meta charset`.
13. `sitemap.js` — адреса ровно как в canonical (со слешем), `lastmod` меняется только при
    изменении содержимого (`tools/sitemap-lastmod.json` хранит хэши и коммитится). Стоит
    последним: хэши считаются по страницам с CSP, иначе каждый следующий билд сдвигает
    `lastmod` у всех адресов разом (ошибка порядка исправлена в T-107).
14. `verify-build.js` — правила ниже.

Без шагов 4–13 пререндер затирает метаданные, поэтому «собрал и забыл» не работает.

## Что проверяет `verify-build.js`

- в HTML нет `ozon.ru`, нет полей `price`/`priceFrom`;
- у товаров `price_mode` только `hidden`/`note`, `price_rub` — целое > 0;
- `card`-оффер без erid — ошибка; `search`-оффер с erid — ошибка; erid должен быть и в ссылке;
- один erid на нескольких `/cc/`-ссылках — предупреждение (повод сверить кабинет);
- canonical со слешем, `Article`/`WebPage`/`FAQPage` с правильными `@id`, FAQPage на месте;
- на каждой странице `seo-fix` (кроме хаба `/articles/` и редиректов-алиасов) ровно один блок
  `kd-seo` с одним JSON-LD, чьи `@id` ведут на её canonical, ровно один блок `kd-links`
  и по одному `twitter:card`/`title`/`description`/`image` и `theme-color` — потеря любого из них
  даёт красный прогон (T-175); `build-tables.js --check` эти блоки снимает и о разметке не говорит;
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

**Заменить оффер автоматически нельзя.** `GET /v3/affiliate/partner/link/create` требует `clid` типа «Партнерские ссылки» (без него 401 «required parameter 'clid' or 'place_id' is missing»), а `erid` в ссылку подставляется только из креатива в ОРД. `link/info` работает только по нашим партнёрским ссылкам: обычная страница Маркета даёт 404 «Partner link not found», поэтому чужой живой оффер им не проверить. Метода поиска товаров в Referral API нет. Что можно автоматически — проверить уже готовую ссылку (`market-prices.js --only-id`, `check-offers.js --only-id`); сами ссылки приносит владелец (T-140), раскладка — T-139.

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
- в публикацию не попадает: и панель, и `tools/deploy-hothat.sh` берут только записи
  `tools/public-manifest.txt`.


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
- Выкладка — две кнопки панели: `git push` и даже «Deploy HEAD Commit» без «Update from Remote»
  оставляют на сайте прошлую версию, а правки `.cpanel.yml` прямо в клоне на сервере панель
  блокирует («no uncommitted changes»).
