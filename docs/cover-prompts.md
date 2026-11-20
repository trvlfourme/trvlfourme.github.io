# Обложки через нейросеть: стиль и 27 промптов (T-162)

Составлено 2026-11-20 по просьбе владельца: часть нарисованных SVG-обложек выглядит криво,
второй путь — сгенерировать сцены нейросетью по готовым промптам. Список сцен и раскладка
«статья → что на обложке» — в `docs/image-plan.md`, раздел 3; здесь только то, что нужно
вставить в генератор.

## 1. Как пользоваться

1. Возьмите **блок стиля** (раздел 3) и добавьте к нему **сцену** из раздела 4 — одним текстом,
   через пробел. Стиль-блок одинаковый для всех 27 картинок: он и держит серию похожей.
2. Формат — 16:9. Просите у сервиса максимальное разрешение по длинной стороне (1536 px и выше),
   потом обрезаем по центру до **1376×768** — как у нынешних обложек.
3. Фон: 23 картинки светлые, 4 тёмные (№ 2, 5, 13, 15) — для них берите `STYLE DARK`.
4. Файл кладём в `images/editorial/` под именем `NN-slug.jpg` (`NN` — номер статьи с ведущим
   нулём), затем `node tools/make-image-variants.js` сделает `-640` и `-320`. `heroImage`
   в `data/articles/*.json` уже указывает на эти имена — менять не нужно.
5. В `images/SOURCES.md`: сервис, дата, промпт (можно ссылкой на этот файл + номер сцены) и
   пункт условий о правах на результат. Без этой строки картинка на сайт не идёт.

**Главное отличие от SVG: в картинке не должно быть надписей.** Нейросети ломают кириллицу и
цифры, а плашки с текстом в SVG были именно плашками. Если подпись нужна — она ставится HTML-ом
или отдельным слоем, но не внутрь кадра. Поэтому в промптах везде `no text`.

## 2. Где генерировать и что с правами

Правила и вердикты по сервисам — `docs/image-plan.md`, раздел 6 (сверено 2026-11-18):
коммерческое использование разрешают Pexels/Unsplash (это сток, не генерация) и Ideogram на
free-плане; Adobe Firefly в РФ не работает, Шедеврум и Bing Designer — только личное
некоммерческое, Midjourney/Freepik/Canva платные. Локальный запуск открытых моделей возможен,
но лицензию конкретных весов надо проверить отдельно: не всякая открытая модель разрешает
коммерческое использование результата. Если сервис выбран другой — сверьте его условия и
запишите дату сверки в `images/SOURCES.md`.

## 3. Блок стиля

**STYLE** (светлые, 23 сцены):

```
Flat vector editorial illustration for a home-office magazine cover, wide 16:9 banner.
Warm off-white beige background with a very soft diagonal gradient, muted palette: warm oak
wood, slate grey, cream, soft amber highlights, one fresh green accent. Clean rounded geometric
shapes, flat fills, subtle soft shadows, no outlines, calm empty space around the subject.
Cozy Scandinavian home-office mood, tidy but lived-in, gentle daylight. No people's faces, no
text, no letters, no numbers, no logos, no brand marks, no watermark.
```

**STYLE DARK** (тёмные, 4 сцены — № 2, 5, 13, 15):

```
Flat vector editorial illustration for a home-office magazine cover, wide 16:9 banner.
Dark warm charcoal background, deep brown-black with a soft vignette, muted palette: warm oak
wood, slate grey, cream, amber lamp glow as the only light source. Clean rounded geometric
shapes, flat fills, soft shadows, no outlines, calm empty space around the subject. Quiet
evening home-office mood. No people's faces, no text, no letters, no numbers, no logos, no
brand marks, no watermark.
```

Негативный промпт (для Stable Diffusion / Flux / ComfyUI):

```
text, letters, cyrillic, numbers, watermark, signature, logo, brand, photorealistic, 3d render,
plastic toy look, cluttered composition, extra fingers, deformed hands, extra limbs, distorted
face, low contrast, harsh shadows, neon colors
```

## 4. Двадцать семь сцен

В каждой сцене: `Промпт` — что вставлять после стиль-блока, `Должно читаться` — смысл, ради
которого картинка стоит в статье, `Частый брак` — что переделывать сразу, не разглядывая.

### 1 · `vertikalnaya-mysh-polza` · светлый

- Промпт: `Two computer mice side by side on a light oak desk, three-quarter top view. On the
  left a flat mouse under a relaxed hand with the palm facing down and the forearm twisted; on
  the right a tall vertical ergonomic mouse under a hand in a handshake grip, thumb on the side
  buttons. A thin amber arc arrow between them shows the wrist rotating. Hands anatomically
  correct, no watch, no jewelry, no rings.`
- Должно читаться: разница хватов — «ладонь вниз» против «как рукопожатие».
- Частый брак: шесть пальцев, мышь срастается с кистью, стрелка поверх рук.

### 2 · `skrinbar-na-monitor-vybor-zashchita-glaz` · тёмный

- Промпт: `Slim LED light bar clipped on the top edge of a widescreen monitor, side view at desk
  level. A warm cone of light falls only on the keyboard and the desk surface, the screen stays
  dark with no glare, the area above the monitor is unlit, a desk lamp on the side is off. The
  rear clamp of the bar is visible behind the monitor.`
- Должно читаться: свет идёт вниз на стол, а не в экран.
- Частый брак: блик на матрице, планка висит в воздухе, свет заливает всю комнату.

### 3 · `kronshtejn-dlya-monitora-na-stol-vybor` · светлый

- Промпт: `Close-up of a monitor arm C-clamp gripping the edge of a 25 mm oak desktop, view
  slightly from below: visible tightening screw with a folding handle and a rubber pad under the
  top plate, the arm rising out of frame, a monitor floating above the desk in the background.`
- Должно читаться: струбцина держится за кромку стола, а не за стену.
- Частый брак: зажим как канцелярская прищепка, винт сверху, стол просвечивает насквозь.

### 4 · `kronshtejn-dlya-monitora-ergonomika-shei` · светлый

- Промпт: `Side profile of a person sitting at a desk, seen from behind at three-quarter angle,
  face turned away and not visible. A monitor on a desk arm, its top edge level with the eyes,
  a thin amber dashed line from the eyes into the top third of the screen, a second thin line
  along the spine. Relaxed shoulders, no visible screen content.`
- Должно читаться: линия взгляда попадает в верхнюю треть экрана.
- Частый брак: лицо в камеру, линия в центр экрана, монитор ниже глаз.

### 5 · `mikrofon-s-shumopodavleniem-dlya-zvonkov` · тёмный

- Промпт: `Condenser microphone with a pop filter on a spring boom arm clamped to a desk, held
  about 20 cm from where a person would sit, next to a monitor edge, blurred warm room behind,
  shallow bokeh, warm rim light on the metal, cables routed along the arm.`
- Должно читаться: пантограф держит микрофон у лица и не занимает стол.
- Частый брак: микрофон как фен, рука пантографа не крепится к столу.

### 6 · `podemnyj-stol-kak-vybrat` · светлый

- Промпт: `Height-adjustable desk raised to standing height, a person standing at it in side
  view with one hand on a small control panel at the desk edge, face not visible, the office
  chair pushed aside, the telescopic legs clearly visible under the top.`
- Должно читаться: стол поднят, человек работает стоя, высота регулируется.
- Частый брак: стол не выглядит поднятым, ноги человека сливаются с ножками стола.

### 7 · `stol-s-elektroprivodom-polza-dlya-spiny` · светлый

- Промпт: `One frame split in two halves by a thin vertical line: on the left the same desk in
  sitting position with a person slumped in the chair, on the right the desk raised with the same
  person standing upright, both in side view without faces. A bold amber upward arrow between
  the halves. Same room, same objects on both sides.`
- Должно читаться: смена позы на одном и том же месте.
- Частый брак: две разные комнаты, стрелка перекрывает стол, лица видны.

### 8 · `podstavka-dlya-nog-pod-stol-ergonomika` · светлый

- Промпт: `Close-up under a wooden desk: feet in soft socks resting on an inclined footrest, the
  board tilted so the toes are slightly higher than the heels, legs visible from the knee down at
  a natural angle, knees at about 90 degrees, soft shadow under the board.`
- Должно читаться: стопа стоит на наклонной поверхности, а не висит.
- Частый брак: ступни проходят сквозь доску, три ноги, колени под острым углом.

### 9 · `kak-vybrat-kreslo-dlya-spiny` · светлый

- Промпт: `Ergonomic mesh office chair in strict side profile on a plain light background, thin
  amber dashed measurement lines marking the seat depth from the front edge to the backrest and
  the height of the lumbar support, no numbers, soft even studio light.`
- Должно читаться: поясничный упор и глубина сиденья — это параметры, их меряют.
- Частый брак: кресло в три четверти, на линиях цифры, упор нарисован выше поясницы.

### 10 · `5-luchshih-ergonomichnyh-kresel-rejting` · светлый

- Промпт: `Three different ergonomic office chairs in a row, front three-quarter view, clearly
  different silhouettes: one with a mesh back, one with a headrest and high back, one compact
  with a curved back. Plain light studio background, soft shadows under the wheels.`
- Должно читаться: перед читателем выбор из нескольких разных кресел.
- Частый брак: три одинаковых кресла, кресла висят над полом, «мешки» вместо спинок.

### 11 · `printer-dlya-doma-kompaktno-i-kuda-postavit` · светлый

- Промпт: `Compact home printer standing on a small wooden cabinet beside a desk, view slightly
  from above so the scale is readable next to a mug and a closed notebook, white paper tray, all
  cables neatly routed behind the cabinet, no cables on the floor.`
- Должно читаться: принтер маленький и стоит вне рабочего стола.
- Частый брак: принтер размером с тумбу, бумага и провода по всей комнате.

### 12 · `rabota-za-noutbukom-bez-boli-v-shee` · светлый

- Промпт: `Laptop on an aluminium stand with an external keyboard in front of it, hands typing,
  view from three-quarter side, the top of the laptop screen at eye level of a seated person
  whose face is out of frame, mug and notebook beside, soft daylight from the left.`
- Должно читаться: экран поднят на уровень глаз, руки на отдельной клавиатуре.
- Частый брак: экран ниже глаз, пальцы не той формы, клавиатура на весу.

### 13 · `akusticheskie-paneli-dlya-domashnego-kabineta` · тёмный

- Промпт: `Wall behind a desk covered with hexagonal felt acoustic panels in warm grey and
  beige, concentric sound-wave arcs reaching the panels and fading between them, warm desk lamp
  glow from the side, the edge of a monitor and a microphone in frame.`
- Должно читаться: эхо гаснет в панелях, а не отражается от стены.
- Частый брак: волны как значок Wi-Fi, панели с буквами, панели только на половине стены.

### 14 · `kabel-menedzhment-pod-stolom-svoimi-rukami` · светлый

- Промпт: `One frame split in two halves by a thin vertical line, both showing the underside of
  the same wooden desk: on the left a chaotic tangle of cables hanging down with dust, on the
  right the same cables neatly laid in a metal tray with velcro straps and small blank tags.
  Same desk, same objects, only the cable state differs.`
- Должно читаться: «было / стало» — клубок против лотка.
- Частый брак: провода как змеи, надписи на бирках, halves show different desks.

### 15 · `balans-raboty-i-lichnoj-zhizni-na-udalenke` · тёмный

- Промпт: `Evening home office: a closed laptop on the desk, a warm ceramic cup, a floor lamp
  glowing amber, the chair pushed back, a window with deep blue evening light in the background,
  no clock, no screen content, the room settled for the night.`
- Должно читаться: рабочий день закрыт, свет стал тёплым и низким.
- Частый брак: часы с цифрами, открытый ноутбук с «работой», пляж и коктейль.

### 16 · `chto-podarit-udelenshchiku` · светлый

- Промпт: `Flat lay top view of small gifts arranged on a light oak desk: a compact mouse, a
  small desk lamp, a plain ceramic mug, a notebook with a pen, over-ear headphones, a tiny potted
  plant, one item wrapped in kraft paper with twine. Even soft daylight, blank surfaces.`
- Должно читаться: набор вещей, которые действительно пригодятся за столом.
- Частый брак: надписи на кружке, логотипы, подарки навалены кучей.

### 17 · `domashnij-ofis-s-nulya-nedorogo` · светлый

- Промпт: `Minimal home office by a window: a simple wooden desk, one chair, a laptop, a small
  lamp, a single plant, empty wall, nothing else in the frame, morning daylight and light
  curtains, calm and inexpensive look.`
- Должно читаться: рабочий уголок собран из малого, без ремонта и гарнитура.
- Частый брак: богатый кабинет, заваленный стол, окно как картина на стене.

### 18 · `ergonomika-rabochego-mesta-nastroyka` · светлый

- Промпт: `The whole workspace in strict side profile: desk, chair and a seated person seen from
  the side without a visible face, thin amber measurement lines showing the top of the screen at
  eye level, elbows at 90 degrees, feet flat on the floor, no numbers on the lines.`
- Должно читаться: три уровня настройки — экран, локти, стопы.
- Частый брак: неправдоподобные пропорции, цифры на линиях, человек «висит» над стулом.

### 19 · `kuda-postavit-rabochij-stol-v-komnate` · светлый

- Промпт: `Desk placed next to a window with soft side light falling across the desktop, a
  radiator under the window and a wall socket with a plugged cable visible in the same frame, a
  chair, a small lamp, warm neutral walls.`
- Должно читаться: свет сбоку, батарея и розетка — то, что проверяют до покупки стола.
- Частый брак: стол перекрывает батарею, розетка нарисована на другой стене.

### 20 · `rabochee-mesto-dlya-dvoih-v-komnate` · светлый

- Промпт: `Two separate workstations in one room, each with its own desk, monitor and chair, a
  low open shelving unit used as a divider between them, warm daylight, no people, tidy cables.`
- Должно читаться: два места разведены перегородкой, а не один длинный стол.
- Частый брак: один общий стол, стеллаж вплотную к головам, люди с лицами.

### 21 · `rabochee-mesto-na-balkone` · светлый

- Промпт: `Insulated balcony workspace: a desk along the glazing, a chair with a folded plaid, a
  knitted hat and gloves on the windowsill, frost patterns on the glass and cold blue light
  outside, warm cozy light inside, an electric convector heater under the desk.`
- Должно читаться: балкон утеплён и отапливается, за стеклом мороз.
- Частый брак: открытый балкон, снег внутри, кондиционер вместо обогревателя.

### 22 · `rabochee-mesto-v-odnushke-s-rebenkom` · светлый

- Промпт: `One-room apartment: an adult's work desk with a monitor on one side and a small
  child's table with a few toys on the other, a rug and a low shelf marking the two zones, same
  room, warm daylight, no people.`
- Должно читаться: взрослое место и детский уголок живут в одной комнате и не мешают друг другу.
- Частый брак: два стола одного размера, игрушки по всей комнате, две разные комнаты.

### 23 · `rabochee-mesto-v-semnoy-kvartire` · светлый

- Промпт: `Desk placed on a wide windowsill with a clamp-mounted monitor arm fixed to its edge, a
  tote bag on the floor, clean undrilled walls with no shelves and no holes, curtains, warm
  daylight, rented-apartment look.`
- Должно читаться: всё держится струбциной, в стене ни одного следа.
- Частый брак: полки и дырки в стене, струбцина сквозь стекло, офисный вид.

### 24 · `udalennaya-rabota-s-rebenkom` · светлый

- Промпт: `An adult and a child at their own desks in the same room, both seen from behind at a
  slight angle so no faces are visible, the adult wearing headphones, the child drawing, two
  separate work surfaces, warm daylight.`
- Должно читаться: у каждого своё место и своё занятие.
- Частый брак: лица видны, тела сливаются, ребёнок за взрослым ноутбуком.

### 25 · `metod-svetofor-udalenka-s-detmi` · светлый

- Промпт: `Three round cards standing on a desk in red, yellow and green, no letters on them, a
  child's hand raising the green card, an adult's open laptop softly blurred behind, warm
  daylight, simple tabletop scene.`
- Должно читаться: три состояния договорённости, ребёнок выбирает зелёное.
- Частый брак: надписи и слова на карточках, светофор на столбе, рука взрослого.

### 26 · `udalennaya-rabota-v-poezdke-i-otpuske` · светлый

- Промпт: `Laptop on a small table by the window of a hotel room or a train compartment, a view
  of a city or mountain pass outside, a backpack on the floor, over-ear headphones and a notebook
  on the table, neat and compact, no beach and no cocktail.`
- Должно читаться: работа в дороге, а не отпуск у моря.
- Частый брак: пляж, шезлонг, раскрытый на кровати чемодан.

### 27 · `v-kakoj-komnate-luchshe-rabotat-na-udalenke` · светлый

- Промпт: `One frame divided into three vertical panels by thin lines, showing three room
  corners in the same flat style and palette: a kitchen with upper cabinets and a small table, a
  bedroom with a desk beside the bed, a loggia with glazing and a desk. No labels.`
- Должно читаться: сравнение трёх мест в одной картинке.
- Частый брак: три разных стиля, подписи КУХНЯ/СПАЛЬНЯ, панели разной высоты.

## 5. Что проверять в результате

1. **Надписей нет вообще** — ни букв, ни цифр, ни «псевдотекста» на плашках и кружках.
2. **Анатомия**: пальцы, кисти, стопы, колени. Сцены с людьми — № 1, 4, 6, 7, 8, 12, 18,
   22, 24, 25: здесь брак вероятнее всего, и именно на них «корявость» видна сильнее всего.
3. **Смысл сцены** из строки `Должно читаться` — если его нет, картинка не годится, даже
   если красивая.
4. **Серия**: рядом с соседними обложками тот же тёплый фон, та же толщина теней, тот же
   уровень детализации. Для этого в Midjourney — `--sref` с уже принятой картинкой, в
   Stable Diffusion / Flux — фиксированный seed и один и тот же стиль-блок.
5. **Кроп**: после обрезки до 1376×768 главный предмет не обрезан и не липнет к краю.
6. **Права**: нет логотипов, узнаваемых лиц и попыток изобразить конкретную модель товара.

## 6. Порядок замены

1. Сгенерировать и отобрать; файлы — `images/editorial/NN-slug.jpg` (1376×768).
2. `node tools/make-image-variants.js` — варианты `-640` и `-320`.
3. Строка в `images/SOURCES.md`: сервис, дата, номер сцены из этого файла, пункт условий.
4. `node tools/verify-build.js` — «всё чисто: можно выкладывать»; проверить, что на странице
   статьи новая обложка и оба варианта отдаются 200.
5. Старые SVG не удалять: они остаются запасным вариантом, как и прежние JPEG.
## 7. Поиск на стоках: 27 запросов

Если генерация не идёт — тот же кадр ищется фотографией на Pexels и Unsplash (условия —
раздел 2 и `docs/image-plan.md` §6: коммерческое использование разрешено, атрибуция не нужна).
Запросы английские: обе площадки индексируют по-английски, русский запрос даёт в разы меньше
попаданий и почти не находит западные кадры.

Как искать:

- фильтр **orientation = landscape** и размер от 24 Мп: обложка 1376×768 — широкий кадр, из
  вертикального он не вырезается;
- смотреть на свет и температуру: 23 обложки светлые, с тёплым дневным светом; кадр с холодным
  офисным светом или синими тенями в серию не встанет;
- ни логотипов, ни надписей на предметах, ни узнаваемых лиц: права на них сток не передаёт;
- 2–4 слова на запрос, дальше уточнять фильтрами; синонимы в таблице — это разные попытки,
  а не одна длинная строка.

| № | Что на обложке | Запросы (Pexels / Unsplash) |
|---|---|---|
| 1 | вертикальная мышь под ладонью | `vertical ergonomic mouse hand`, `ergonomic mouse grip side view`, `hand resting on vertical mouse` |
| 2 | планка света на мониторе | `monitor light bar`, `screen bar monitor`, `monitor lamp clip on` |
| 3 | струбцина кронштейна на столе | `monitor arm desk clamp`, `c-clamp table edge`, `monitor mount table edge` |
| 4 | человек за столом в профиль | `person working at monitor side view`, `desk setup side profile person`, `eye level monitor desk` |
| 5 | микрофон на пантографе | `microphone boom arm desk`, `condenser microphone desk setup`, `podcast mic arm` |
| 6 | подъёмный стол, работа стоя | `standing desk person working`, `height adjustable desk standing`, `sit stand desk home office` |
| 7 | сидя и стоя в одном кадре | `standing desk sitting position`, `height adjustable desk two positions`, `same desk standing sitting` — см. ниже |
| 8 | ноги на подставке под столом | `footrest under desk`, `feet on ergonomic footrest`, `foot rest office desk` |
| 9 | кресло в профиль | `office chair side view`, `ergonomic chair profile`, `mesh office chair studio` |
| 10 | три разных кресла в ряд | `office chairs row`, `office chair collection`, `office chair showroom` |
| 11 | принтер на тумбе | `home printer on shelf`, `small printer home office`, `printer on cabinet` |
| 12 | ноутбук на подставке, руки на клавиатуре | `laptop stand external keyboard`, `laptop riser hands typing`, `laptop stand desk setup` |
| 13 | акустические панели за столом | `acoustic panels home studio`, `felt acoustic panels wall`, `hexagon acoustic panels` |
| 14 | провода под столом, было/стало | `cable management under desk`, `cable tray desk underside`, `messy cables under desk` — см. ниже |
| 15 | вечер, закрытый ноутбук, торшер | `closed laptop evening desk`, `cozy desk lamp evening`, `home office evening light` |
| 16 | подарки раскладкой на столе | `desk accessories flat lay`, `office gifts flat lay`, `desk flat lay wooden` |
| 17 | минимальный стол у окна | `minimal home office window`, `small desk near window`, `scandinavian home office` |
| 18 | рабочее место в профиль целиком | `ergonomic workstation side view`, `correct posture desk side`, `home office side view` |
| 19 | стол у окна, батарея и розетка | `desk by window radiator`, `workspace next to window`, `desk under window home` |
| 20 | два места, стеллаж между ними | `two desks home office`, `two workstations one room`, `home office shelf divider` |
| 21 | утеплённый балкон, мороз за стеклом | `balcony workspace`, `loggia desk window`, `small balcony office` |
| 22 | детский столик рядом со взрослым | `child desk next to workspace`, `home office with kids corner`, `family desk one room` |
| 23 | подоконник, струбцина, съёмная квартира | `desk on windowsill`, `monitor clamp windowsill`, `small apartment workspace` |
| 24 | взрослый и ребёнок за своими столами | `parent and child at desk`, `mother working child drawing`, `homeschool desk` |
| 25 | три карточки: красная, жёлтая, зелёная | `red yellow green cards`, `colored cards table`, `traffic light cards` — см. ниже |
| 26 | ноутбук у окна в поездке | `laptop train window`, `laptop hotel room window`, `working on train` |
| 27 | три комнаты в одном кадре | `kitchen table workspace`, `desk in bedroom`, `loggia workspace` — см. ниже |

Русские подсказки для отдельных предметов (на обеих площадках их меньше, но находятся):
вертикальная мышь рука, лампа на монитор, струбцина кронштейна, подставка для ног, лоток для
проводов, акустические панели, кресло сбоку.

**Где сток кадр не даст.** Четыре сцены в одном фото не находятся, и это не повод гнать
неудачный кадр в обложку:

- № 7 и № 14 (сидя/стоя и было/стало в одном кадре) — берите две картинки одного стола из одной
  серии одного автора, иначе половины не сойдутся по свету и цвету; если такой серии нет,
  оставляйте SVG: склейка двух разных комнат читается как ошибка;
- № 25 (три карточки, ребёнок поднимает зелёную) — по запросу выходит светофор, а не карточки;
  проще снять самим: три кружка из цветной бумаги на столе, телефон, пять минут;
- № 27 (кухня, спальня и лоджия в одном кадре) — только коллаж из трёх фото, а коллаж в серии
  обложек видно сразу; оставьте SVG.

**Что делать с серией.** Двадцать три обложки фотографией и четыре тёмные рисованные — это уже не
серия, а два разных сайта: фото и вектор рядом в списке статей читаются как разные издания. Поэтому
фото имеет смысл ставить только пачкой и только туда, где предмет важнее настроения (№ 2, 3, 5, 8,
9, 11, 13, 23 — узлы и гаджеты), а сцены с людьми и комнатами оставить векторными. Решение за
владельцем; пока ни одна обложка на сайте не менялась.

**Порядок замены тот же** (раздел 6), плюс в `images/SOURCES.md` для стока пишем не сервис и
промпт, а ссылку на исходник и автора.

**Что уже сделано.** 2026-11-20 восемь самых кривых сцен (№ 1, 3, 8, 11, 13, 14, 20, 23) перерисованы
вручную в SVG — см. `docs/image-plan.md`, раздел 3. Промпты и сток-запросы остаются запасным вариантом для
остальных девятнадцати сцен: их пока не трогали.
