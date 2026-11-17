# План переезда kabinetdoma.ru с GitHub Pages на hothat.ru

Документ для T-073. Ничего из этого ещё не выполнено: это инструкция, по которой переезд
делается за один вечер, с точками отката. Всё, что относится к панели, делает владелец
(или чат по его указанию с доступами); всё, что в репозитории, — разработка.

## 0. С чем работаем (факты на 2026-11-16)

| Что | Сейчас |
|---|---|
| Домен | `kabinetdoma.ru`, регистратор и DNS — nic.ru (`ns3-l2`, `ns4-l2`, `ns8-l2`, `ns4-cloud`, `ns8-cloud`) |
| A-записи | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (GitHub Pages) |
| AAAA | нет |
| `www` | `CNAME www → kabinetdoma.ru` — поэтому `https://www` идёт на GitHub с сертификатом `CN=*.github.io` и падает по TLS |
| MX | `mx1.improvmx.com` (10), `mx2.improvmx.com` (20) — пересылка на Gmail |
| SPF | `v=spf1 include:spf.improvmx.com ~all` |
| DMARC | нет (`_dmarc` → NXDOMAIN) |
| Хостинг | GitHub Pages, репозиторий `mail4startups-creator/home4work`, публичный |
| Выкладка | `bash tools/deploy-prod.sh --push` (git archive → отбор публикуемого состава → push) |
| Сайт | статика: 32 страницы, 180 файлов, 8,7 МБ, бандл 761 953 Б, пререндер в HTML |
| Цель | hothat.ru, тариф «Пять»: 5 сайтов, 5120 МБ, 183,75 ₽/мес, панель cPanel с разделом Git™ Version Control; второй сайт владельца `trvl4.me` там же |

Почему переезд: уведомление в РКН без российского хостинга бессмысленно (T-055/Q-008),
почта и хранение — там же (T-061), закрытие публичного репозитория (T-060) требует приватного
клона с deploy key, а на Pages приватный репозиторий — платный план.

## 1. Что проверить в панели hothat до переезда (30–40 минут, владелец)

1. **Куда смотрит домен.** В cPanel → «Домены» / «Addon Domains» посмотреть `document root`
   для `kabinetdoma.ru` (обычно `/home/<аккаунт>/kabinetdoma.ru` или `public_html`). Записать путь.
2. **IP хостинга.** cPanel → «Общая информация» → «Shared IP Address» (или `ping` своего домена
   на hothat). Этот IP пойдёт в A-записи.
3. **SSL.** Есть ли AutoSSL / Let's Encrypt в разделе «SSL/TLS Status». Проверить, можно ли
   выписать сертификат сразу на два имени: `kabinetdoma.ru` и `www.kabinetdoma.ru`.
4. **Git.** Раздел «Git™ Version Control»: создать репозиторий, посмотреть, какой клон-URL
   предлагается (HTTPS или SSH), есть ли поле deploy key. Скриншот/текст — в ответ чату.
5. **SSH.** Есть ли доступ по SSH и порт (для rsync-варианта и для отладки).
6. **PHP и cron.** PHP для статики не нужен, но проверить, что `.htaccess` с `mod_rewrite`
   работает (в панели «MultiPHP Manager» выставить любую версию PHP — это включает обработку
   `.htaccess`; для чистой статики достаточно `mod_rewrite`/`mod_headers`).
7. **Почта.** Раздел «Email Accounts»: можно ли завести `info@kabinetdoma.ru`, есть ли DKIM
   (включается галочкой), какой исходящий сервер.
8. **Место и лимиты.** 8,7 МБ сайта против 5120 МБ — с запасом; проверить, сколько уже занято
   `trvl4.me`.
9. **Бэкапы панели.** Есть ли ежедневный бэкап аккаунта (cPanel → «Backup»); если есть — включить.

## 2. Второй сайт владельца

`trvl4.me` остаётся на hothat, его не трогаем: один IP на всех сайтах тарифа — норма, сайты
различаются по имени домена, на SSL и SEO это не влияет. В плане он нужен только как проверка,
что переезд `kabinetdoma.ru` не задел соседний сайт: после переключения открыть `https://trvl4.me`
и убедиться, что отдаётся он, а не наш сайт (признак ошибки в vhost-конфигурации).

## 3. DNS на nic.ru

**За сутки до переключения** (шаг 0): у всех записей, которые будем менять, поставить TTL 300.
Сейчас обычно 3600 — при TTL 3600 ошибка живёт до часа, при 300 — до пяти минут.

Таблица изменений:

| Запись | Сейчас | Станет |
|---|---|---|
| `A @` | 185.199.108.153, .109, .110, .111 | IP hothat (один, из панели) |
| `AAAA @` | нет | нет (не добавлять, пока хостинг не даст IPv6) |
| `CNAME www` | `kabinetdoma.ru` | `kabinetdoma.ru` (не менять: www должен вести на тот же сайт, сертификат — на оба имени) |
| `MX @` | improvmx 10/20 | не трогать в день переезда сайта; меняется отдельно в T-061 |
| `TXT @` (SPF) | `v=spf1 include:spf.improvmx.com ~all` | не трогать до T-061 |
| `TXT _dmarc` | нет | добавить сейчас: `v=DMARC1; p=none; rua=mailto:info@kabinetdoma.ru` |
| `TXT` подтверждений | Яндекс.Вебмастер, Google Search Console, Яндекс.Дистрибуция | сохранить как есть; если подтверждение было файлом — файлы уже в репозитории (`yandex_*.html`, `google*.html`) и уедут с сайтом |

Окно, когда видны оба сайта: от момента смены A до истечения старого TTL (при TTL 300 — до
5 минут). В этот момент часть посетителей ещё на GitHub — это нормально, контент одинаковый.

## 4. HTTPS и `www`

1. После смены DNS дождаться, пока домен начнёт резолвиться на hothat (`nslookup kabinetdoma.ru`).
2. cPanel → «SSL/TLS Status» → «Run AutoSSL» (или Let's Encrypt) — сертификат должен покрыть
   **оба** имени: `kabinetdoma.ru` и `www.kabinetdoma.ru`.
3. Включить «Force HTTPS Redirect» (или строки в `.htaccess`, см. п. 5).
4. HSTS — только после суток нормальной работы: `Header always set Strict-Transport-Security "max-age=31536000"`.
5. Проверка приёмки:
   - `curl -I https://kabinetdoma.ru/` → 200 по HTTPS;
   - `curl -I http://kabinetdoma.ru/` → 301 на `https://kabinetdoma.ru/`;
   - `curl -I https://www.kabinetdoma.ru/article/rabochee-mesto-na-balkone/` → 301 на
     `https://kabinetdoma.ru/article/rabochee-mesto-na-balkone/` (путь сохраняется);
   - `openssl s_client -connect www.kabinetdoma.ru:443 -servername www.kabinetdoma.ru | openssl x509 -noout -text | grep -A1 "Subject Alternative Name"` — в SAN есть `www.kabinetdoma.ru`.

## 5. 17 редиректов: `_redirects` → `.htaccess`

`_redirects` в репозитории — источник истины (его понимают Cloudflare Pages/Workers). На cPanel
он не работает: правила переносятся в `.htaccess` в публичном корне. Чтобы списки не разъехались,
делаем генератор `tools/make-htaccess.js`: читает `_redirects` и пишет блок `Redirect 301` —
тогда правка одна, а формат один и тот же.

Полный список (17 правил, все — постоянные 301):

| Откуда | Куда |
|---|---|
| `/article/rabochij-ugolok-v-odnushke-s-rebenkom/` | `/article/rabochee-mesto-v-odnushke-s-rebenkom/` |
| `/article/stol-s-elektroprivodom-vs-obychnyj/` | `/article/stol-s-elektroprivodom-polza-dlya-spiny/` |
| `/article/5-luchshih-ergonomichnyh-kresel-do-35000/` | `/article/5-luchshih-ergonomichnyh-kresel-rejting/` |
| `/article/skrinbar-na-monitor-pochemu-nastolnaya-lampa-portit-zrenie/` | `/article/skrinbar-na-monitor-vybor-zashchita-glaz/` |
| `/article/kristalnyj-zvuk-na-sozvonah-bez-krikov-detej/` | `/article/mikrofon-s-shumopodavleniem-dlya-zvonkov/` |
| `/article/kabel-menedzhment-pod-stolom-za-1-chas-i-2500-rublej/` | `/article/kabel-menedzhment-pod-stolom-svoimi-rukami/` |
| `/article/kronshtejn-dlya-monitora-i-podstavka-dlya-nog/` | `/article/kronshtejn-dlya-monitora-ergonomika-shei/` |
| `/article/metod-svetofor-tajm-menedzhment-dlya-roditelej/` | `/article/metod-svetofor-udalenka-s-detmi/` |
| `/article/rabochee-mesto-dlya-dvoih-v-odnoj-komnate/` | `/article/rabochee-mesto-dlya-dvoih-v-komnate/` |
| `/article/podstavki-dlya-nog-ergonomika-oteki/` | `/article/podstavka-dlya-nog-pod-stol-ergonomika/` |
| `/article/vybor-kronshtejna-dlya-monitora-gazlift/` | `/article/kronshtejn-dlya-monitora-na-stol-vybor/` |
| `/article/akusticheskie-paneli-peregorodki-dlya-kvartiry/` | `/article/akusticheskie-paneli-dlya-domashnego-kabineta/` |
| `/article/v-kakoj-komnate-luchshe-rabotat-doma/` | `/article/v-kakoj-komnate-luchshe-rabotat-na-udalenke/` |
| `/article/kuda-postavit-rabochij-stol-okno-batareya-rozetki/` | `/article/kuda-postavit-rabochij-stol-v-komnate/` |
| `/article/domashnij-ofis-s-nulya-chto-kupit-srazu-a-chto-zaminit/` | `/article/domashnij-ofis-s-nulya-nedorogo/` |
| `/article/kak-podgotovitsya-k-udalennoj-rabote-v-poezde/` | `/article/udalennaya-rabota-v-poezde-i-otpuske/` |
| `/catalog/` | `/` (пока нет страницы каталога, T-050) |

Служебные правила в том же `.htaccess`:

```apache
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

# http -> https
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# www -> без www, путь сохраняется
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]

# кэш: ресурсы надолго, страницы — не кэшировать
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType application/javascript "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set X-Frame-Options "SAMEORIGIN"
</IfModule>

AddDefaultCharset UTF-8
```

Первый порядок правил важен: сначала https, потом www — иначе получится цепочка из двух
редиректов. Проверка: `curl -I http://www.kabinetdoma.ru/article/.../` должно дать **один** 301
сразу на `https://kabinetdoma.ru/article/.../`.

## 6. Файлы сайта: `404.html`, `sitemap.xml`, `robots.txt`, кэш, кодировка

- 404: `ErrorDocument 404 /404.html` (файл уже есть, 200-независимый, свой дизайн).
- `sitemap.xml` и `robots.txt` переезжают как есть, пути абсолютные — менять нечего.
  `robots.txt` сейчас закрывает `/tools/` и `/index.spa.html`; на новом хостинге они и так
  не попадут в публичный корень, но оставить правило безопасно.
- Кэш — по блоку выше; после каждой выкладки у `index.html` не должно быть `max-age`,
  иначе правки не видны.
- Кодировка — `AddDefaultCharset UTF-8`; HTML в CRLF (`.gitattributes` → `* -text`),
  заливка по SSH/через Git не должна конвертировать переводы строк (в cPanel Git — без CRLF-опций,
  в File Manager проверять «не конвертировать»).
- Сжатие: если в панели есть «Optimize Website» (mod_deflate) — включить для `text/*`,
  `application/javascript`, `image/svg+xml`.

## 7. Выкладка: чем заменяется `tools/deploy-prod.sh`

Главное правило T-053 остаётся: **в публичный корень уезжают только страницы и их ресурсы**,
без `docs/`, `tools/`, `*.md`, `app/`, `.backup/`. Сейчас этот список живёт в `PUBLIC` внутри
`tools/deploy-prod.sh`; на новом хостинге он должен быть в одном месте, иначе разъедется молча.

**Основной вариант — cPanel Git Version Control (`.cpanel.yml`).**

1. В панели: «Git™ Version Control» → «Create» → Clone a Repository, URL — GitHub-репозиторий,
   путь клона, например `/home/<аккаунт>/repos/kabinetdoma`.
2. В репозиторий добавляется `.cpanel.yml` (файл готовит разработка):

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/<аккаунт>/kabinetdoma.ru
    - /bin/rm -rf $DEPLOYPATH/assets $DEPLOYPATH/article $DEPLOYPATH/articles
    - /bin/rm -rf $DEPLOYPATH/about $DEPLOYPATH/builder $DEPLOYPATH/calculator
    - /bin/rm -rf $DEPLOYPATH/catalog $DEPLOYPATH/checklist $DEPLOYPATH/privacy
    - /bin/rm -rf $DEPLOYPATH/terms $DEPLOYPATH/tests
    - /bin/cp -R index.html 404.html robots.txt sitemap.xml .htaccess $DEPLOYPATH/
    - /bin/cp -R article articles about builder calculator catalog checklist privacy terms tests $DEPLOYPATH/
    - /bin/cp -R assets data images $DEPLOYPATH/
    - /bin/cp favicon.svg favicon-32.png apple-touch-icon.png logo.png logo-64.png logo-128.png $DEPLOYPATH/
    - /bin/cp google*.html yandex*.html $DEPLOYPATH/ 2>/dev/null || true
```

   `CNAME`, `.nojekyll` и `_redirects` на cPanel не нужны: первые два — механика Pages,
   третий — формат Cloudflare (источник для `.htaccess`).

3. Кнопка «Deploy HEAD Commit» в панели — это и есть ручная выкладка. Автоматизация по желанию:
   GitHub Actions с `ssh` + `git pull` в клоне, или cron `*/10 * * * * cd /home/<аккаунт>/repos/kabinetdoma && git pull -q`.
4. Приватный репозиторий (T-060): в панели создать SSH-ключ развёртывания, публичную часть
   добавить в GitHub как deploy key, клон-URL сделать `git@github.com:...`. Это единственный
   способ, которым приватный репозиторий попадает на хостинг без пароля в конфиге.
5. Запасные варианты, если Git VC в панели не заработает: (а) `rsync -az --delete` по SSH из
   локальной копии с тем же списком состава (скрипт `tools/deploy-rsync.sh` — 20 строк,
   делается за час); (б) GitHub Actions → `rsync` по SSH-ключу.
6. Из репозитория после переезда: `tools/deploy-prod.sh` уходит в `tools/archive/` (или остаётся
   как история), вместо него — `tools/deploy-hothat.sh`, который делает то же самое, но зовёт
   `cpanel`/`rsync`. `PUBLIC` переезжает в один файл `tools/public-manifest.txt`, который читают
   и verify-build, и выкладка.

## 8. Почта (T-061, отдельным окном, не в день переезда сайта)

1. Завести `info@kabinetdoma.ru` на hothat, включить DKIM, получить DKIM-запись.
2. В nic.ru: добавить DKIM (`default._domainkey`), поменять MX на хостинг, SPF на
   `v=spf1 include:<spf-хостинга> ~all`.
3. Через сутки — `_dmarc` с `p=quarantine`, затем `p=reject`. Первые сутки `p=none`, чтобы
   увидеть отчёты.
4. Проверка: письмо на `info@` доходит, ответ уходит, `dig TXT kabinetdoma.ru` показывает SPF,
   `dig TXT default._domainkey.kabinetdoma.ru` — DKIM, в заголовке письма `Authentication-Results: spf=pass dkim=pass dmarc=pass`.
5. После переезда почты — T-061 закрывается, и только тогда политика (T-054) может писать
   «почта обрабатывается в РФ».

## 9. Откат за час

1. В nic.ru вернуть A-записи на четыре IP GitHub Pages (`185.199.108.153`, `.109`, `.110`, `.111`),
   `www` CNAME оставить как есть.
2. Дождаться TTL (300 секунд), если он был снижен заранее. Если нет — до часа.
3. Ничего в репозитории и на Pages не удалять минимум месяц: Pages продолжает отдавать сайт,
   пока DNS смотрит на него. `kabinetdoma.ru` на Pages остаётся включённым.
4. Почту в день переезда сайта не трогаем — значит откат не затрагивает письма.
5. Признак, что откат удался: `curl -I https://kabinetdoma.ru/` отвечает `server: GitHub.com`.

## 10. Приёмка после переезда

Проверки, которые делаются в тот же вечер (и потом повторяются в T-081):

1. `curl -I https://kabinetdoma.ru/` → 200, `server:` не `GitHub.com`.
2. Все 32 адреса из `sitemap.xml` → 200.
3. Все 17 редиректов → 301 на правильный адрес, путь сохраняется.
4. `https://kabinetdoma.ru/nesushchestvuyushchaya-stranitsa/` → 404 с нашим `404.html`.
5. `http://` → 301 на `https://`; `https://www` → 301 на без-www; в SAN сертификата оба имени.
6. Служебное не отдаётся: `/docs/questions.md`, `/AGENTS.md`, `/tools/deploy-prod.sh`, `/*.md` → 404.
7. `robots.txt` и `sitemap.xml` с правильными абсолютными адресами.
8. На главной и статье в браузере: консоль без ошибок, картинки на месте, кнопки магазинов с erid,
   Метрики и Google Fonts нет (режим «без ПДн»).
9. Кэш: `curl -I https://kabinetdoma.ru/assets/index.js` → `Cache-Control: max-age=...`;
   `curl -I https://kabinetdoma.ru/` → без долгого кэша.
10. `https://trvl4.me` открывается и показывает свой сайт, не наш.
11. Яндекс.Вебмастер и Search Console: переобход не нужен, но проверить, что `sitemap.xml`
    читается (в Вебмастере «Индексирование → Файлы Sitemap»).
12. Скорость: `curl -w '%{time_total}' -o /dev/null -s https://kabinetdoma.ru/` — сравнить
    с Pages (было ~0,2–0,4 с из РФ).

## 11. График и кто что делает

| Когда | Шаг | Кто | Время |
|---|---|---|---|
| За 1–2 дня | Проверить панель по п. 1, записать IP и путь к корню | владелец | 30–40 мин |
| За 1 день | TTL всех A/CNAME → 300 | владелец | 10 мин |
| За 1 день | `tools/make-htaccess.js`, `.cpanel.yml`, `tools/public-manifest.txt`, `tools/deploy-hothat.sh` | разработка | 2–3 ч |
| За 1 день | Добавить `_dmarc` `p=none` | владелец | 10 мин |
| День переезда | Клон репозитория в панели, первая выкладка на временный адрес | владелец + разработка | 40 мин |
| День переезда | Проверка на временном адресе (IP + `Host`), потом смена A-записей | владелец | 20 мин |
| День переезда | AutoSSL, Force HTTPS, проверка `www`, приёмка по п. 10 | владелец + разработка | 40 мин |
| +1 день | HSTS, повторная приёмка, закрытие T-073 | разработка | 30 мин |
| Отдельным окном | Почта: MX, DKIM, DMARC (T-061) | владелец | 1 ч |
| После почты | Закрыть репозиторий, deploy key (T-060) | владелец | 30 мин |

Итого чистое время переезда сайта — около двух часов, из них владельца — минут сорок.

## 12. Что меняется в репозитории

- `tools/make-htaccess.js` — генерирует `.htaccess` из `_redirects` (единый список правил).
- `tools/public-manifest.txt` — публикуемый состав, читается выкладкой и `verify-build`.
- `tools/deploy-hothat.sh` — выкладка на cPanel (или rsync), с тем же отказом, если в составе
  появились `docs/`, `tools/`, `*.md`.
- `.cpanel.yml` — задачи деплоя для панели (путь к корню подставляет владелец под свой аккаунт).
- `CNAME` и `.nojekyll` остаются в репозитории, пока Pages не выключен; после переезда их можно
  убрать одним коммитом.
- T-062 (пункт о ЕРИР в оферте Яндекса) от переезда не зависит — идёт своим чередом.
