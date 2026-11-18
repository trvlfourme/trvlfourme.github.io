# Живые фото для статей: 15 снимков по номерам (T-125)

Составлено 2026-11-18 вместе с `docs/image-plan.md`. Нумерация статей — как в плане обложек,
1–27. Номера живых фото — 1–15, они не совпадают с номерами статей: фото 9 и 10 идут к одной
статье (№ 14).

## 1. Как этим пользоваться

- **Куда класть.** Все файлы — в `images/editorial/`. Обложка: `NN-slug.jpg`, фото в тексте:
  `NN-slug-foto.jpg` (если к статье два снимка — `-foto-2.jpg`). `NN` — номер статьи с ведущим
  нулём. Так файлы сортируются по номерам и сразу видно, к чему они.
- **Что нужно от файла:** JPG, ширина от 1600 px, горизонтальный кадр 3:2, без чужих логотипов,
  надписей на предметах, узнаваемых лиц и брендов. Цвет — нейтральный, свет — дневной или
  мягкий комнатный: обложки светлые, фото не должны выбиваться.
- **Имя файла = адрес фото в статье.** После того как файлы легли в папку, я вставлю их в тексты,
  пропишу alt и подпись, сделаю `-640`/`-320` и заполню `images/SOURCES.md`.
- **Если фото со стока** — пришлите ещё ссылку на исходник и автора: это одна строка в SOURCES.md.
- **Если генерируете** — сохраните сам промпт и дату: в SOURCES.md пишем сервис, дату, промпт и
  пункт условий о правах на результат.

## 2. Где генерировать и что с правами (сверено 2026-11-18)

| Сервис | Годится? | Условия |
|---|---|---|
| **Pexels** (сток) | да, основной канал | коммерческое использование разрешено, атрибуция не нужна, менять можно; нельзя продавать неизменённые копии и выдавать за товар. Права на людей и логотипы не передаёт — берём кадры без них. pexels.com/license |
| **Unsplash** (сток) | да, второй канал | бесплатно, коммерчески, без атрибуции; нельзя продавать без переработки. unsplash.com/license |
| **Ideogram, free-план** | да, до 5 картинок | условия не претендуют на права на вход и выход, коммерческое использование не ограничивают независимо от тарифа; на free-плане генерации публичны. Проверить доступность из РФ в момент генерации и записать дату сверки |
| **Kandinsky / Fusion Brain** | не советую | условия на разных площадках противоречат друг другу, однозначного текста о коммерческих правах нет |
| **Adobe Firefly** | нет | официально не работает в России и Беларуси |
| **Шедеврум (Яндекс)** | нет | п. 3.3: только личные некоммерческие цели, коммерция — с письменного согласия Яндекса |
| **Bing Designer** | нет | «personal, non-commercial use» |
| **Midjourney, Freepik, Canva** | нет | платно, оплата из РФ проблемная, у Freepik/Canva свои ограничения на элементы |

Важно: **гаджеты лучше брать фотосо стока, а не генерировать**. Модель рисует правдоподобную, но
неправильную струбцину или газлифт, а статья объясняет именно устройство узла — ошибка будет
стоить доверия. Генерация уместна для сцен и предметов без механики (подарки, стол у окна).

## 3. Пятнадцать фото

### Фото 1 · Статья 1 · `vertikalnaya-mysh-polza`

- Файл: `01-vertikalnaya-mysh-polza-foto.jpg`
- Что снять: вертикальная мышь под расслабленной правой кистью, вид сбоку-сверху; видно, что
  ладонь стоит как при рукопожатии, а не лежит сверху.
- Сток: `vertical ergonomic mouse hand`, `ergonomic mouse side view`, `vertical mouse desk`
  (RU: вертикальная мышь рука, эргономичная мышь сбоку).
- Промпт: `Photorealistic close-up, vertical ergonomic mouse under a relaxed right hand in a
  handshake grip, side-three-quarter view, light oak desk, soft window light, shallow depth of
  field, no logos, no text, no brand marks, 3:2`.
- Alt: «Кисть на вертикальной мыши: ладонь развёрнута внутрь, как при рукопожатии».
- Подпись: «Вертикальная мышь не «лечит» запястье — она убирает постоянный разворот предплечья».

### Фото 2 · Статья 2 · `skrinbar-na-monitor-vybor-zashchita-glaz`

- Файл: `02-skrinbar-na-monitor-vybor-zashchita-glaz-foto.jpg`
- Что снять: планка на верхней кромке монитора, вид сбоку: видно зажим/противовес и то, что
  свет уходит вниз на стол, а не в экран. Кадр вечерний, свет в комнате приглушён.
- Сток: `monitor light bar`, `screen bar monitor`, `monitor lamp top edge`
  (RU: лампа на монитор, скринбар).
- Промпт: `Realistic photo, slim LED light bar clipped on the top edge of a monitor, side view in
  dim room, warm light falling onto the desk and keyboard only, no glare on the screen, dark
  background, no logos, no text, 3:2`.
- Alt: «Скринбар на верхней кромке монитора: зажим сзади, свет уходит вниз на стол».
- Подпись: «Планка крепится на кромку и светит вниз — поэтому на матрице нет блика, как от
  настольной лампы сбоку».

### Фото 3 · Статья 3 · `kronshtejn-dlya-monitora-na-stol-vybor`

- Файл: `03-kronshtejn-dlya-monitora-na-stol-vybor-foto.jpg`
- Что снять: струбцина кронштейна на кромке столешницы, вид сбоку-снизу: винт, площадка, толщина
  стола. Это тот самый узел, от которого зависит, выдержит ли стол.
- Сток: `monitor arm clamp desk`, `desk mount clamp table edge`, `monitor stand c-clamp`
  (RU: струбцина кронштейна монитора, зажим на столешнице).
- Промпт: `Photorealistic macro, metal C-clamp of a monitor arm gripping a 25 mm wooden desk
  top, side view from slightly below, visible tightening screw and rubber pad, neutral light,
  no logos, no text, 3:2`.
- Alt: «Струбцина кронштейна на кромке стола: винт снизу, площадка сверху».
- Подпись: «Нагрузка уходит в кромку стола: сначала смотрят толщину столешницы и затяжку винта,
  а не красоту рычага».

### Фото 4 · Статья 4 · `kronshtejn-dlya-monitora-ergonomika-shei`

- Файл: `04-kronshtejn-dlya-monitora-ergonomika-shei-foto.jpg`
- Что снять: шарнир и газлифт крупно, без логотипов: видно, что осей три (поворот, наклон,
  высота) и где регулировочный винт.
- Сток: `monitor arm joint gas spring`, `monitor arm hinge close up`
  (RU: шарнир кронштейна монитора, газлифт кронштейна).
- Промпт: `Photorealistic close-up of a monitor arm gas-spring joint, three-axis articulation
  visible, matte black metal, neutral studio light, plain light grey background, no logos, no
  text, 3:2`.
- Alt: «Шарнир кронштейна с газлифтом: три оси и регулировочный винт».
- Подпись: «Три оси — это высота, вылет и наклон; газлифт держит вес, а не «фиксирует» его
  навсегда».

### Фото 5 · Статья 5 · `mikrofon-s-shumopodavleniem-dlya-zvonkov`

- Файл: `05-mikrofon-s-shumopodavleniem-dlya-zvonkov-foto.jpg`
- Что снять: микрофон на пантографе рядом с монитором, кадр от стола: видно, как пантограф
  держит микрофон в 15–20 см от лица, не занимая стол.
- Сток: `microphone boom arm desk`, `podcast mic arm monitor`
  (RU: микрофон на пантографе, пантограф для микрофона).
- Промпт: `Photorealistic photo of a condenser microphone on a spring boom arm clamped to a
  desk, positioned beside a monitor, view from the desk, soft daylight, blurred room, no logos,
  no text, 3:2`.
- Alt: «Микрофон на пантографе рядом с монитором: рука не держит стойку, стол свободен».
- Подпись: «Пантограф держит микрофон в 15–20 см от рта: ближе к источнику звука — меньше
  усиления и меньше шума в записи».

### Фото 6 · Статья 8 · `podstavka-dlya-nog-pod-stol-ergonomika`

- Файл: `08-podstavka-dlya-nog-pod-stol-ergonomika-foto.jpg`
- Что снять: три подставки в одном кадре или две рядом — наклонная, массажная (с пупырышками),
  качающаяся. Раздел «виды подставок» без этого не читается.
- Сток: `footrest under desk`, `ergonomic foot rest`, `rocking footrest`
  (RU: подставка для ног под стол, массажная подставка для ног).
- Промпт: `Photorealistic product photo, three different under-desk footrests side by side on a
  light floor: inclined flat board, massage roller version, rocking curved version, soft studio
  light, plain background, no logos, no text, 3:2`.
- Alt: «Три вида подставок: наклонная, массажная и качающаяся».
- Подпись: «Разница между подставками — в поверхности и в том, что она делает с голеностопом;
  наклон 10–15° есть у всех трёх».

### Фото 7 · Статья 9 · `kak-vybrat-kreslo-dlya-spiny`

- Файл: `09-kak-vybrat-kreslo-dlya-spiny-foto.jpg`
- Что снять: кресло в профиль на нейтральном фоне: видно поясничный упор, глубину сиденья и
  то, где заканчивается край сиденья относительно колена.
- Сток: `office chair side view`, `ergonomic chair profile lumbar`
  (RU: офисное кресло в профиль, кресло с поясничной поддержкой сбоку).
- Промпт: `Photorealistic side view of a mesh office chair, lumbar support clearly visible,
  seat depth readable, plain light grey background, even studio light, no logos, no text, 3:2`.
- Alt: «Кресло в профиль: поясничный упор попадает в изгиб поясницы, край сиденья — под коленом».
- Подпись: «Смотреть надо в профиль: упор должен попадать в изгиб поясницы, а не давить выше
  или ниже».

### Фото 8 · Статья 6 · `podemnyj-stol-kak-vybrat`

- Файл: `06-podemnyj-stol-kak-vybrat-foto.jpg`
- Что снять: привод подъёмного стола в сборе — телескопическая колонна и мотор, по возможности
  рядом одно- и двухмоторная рама, чтобы была видна разница.
- Сток: `standing desk frame motor`, `height adjustable desk leg mechanism`
  (RU: подъёмный стол механизм, привод подъёмного стола).
- Промпт: `Photorealistic technical photo of a height-adjustable desk frame upside down on a
  light floor: two telescopic legs with motors, control box and cable, neutral light, no logos,
  no text, 3:2`.
- Alt: «Рама подъёмного стола снизу: две телескопические колонны, моторы и блок управления».
- Подпись: «Два мотора синхронизируют колонны; у одного мотора перекос ловится по нагрузке».

### Фото 9 · Статья 14 · `kabel-menedzhment-pod-stolom-svoimi-rukami`

- Файл: `14-kabel-menedzhment-pod-stolom-svoimi-rukami-foto.jpg`
- Что снять: лоток под столом с уложенными проводами и стяжками, вид снизу-сбоку: видно, что
  провода лежат в лотке, а не висят.
- Сток: `cable tray under desk`, `cable management tray`
  (RU: лоток для проводов под стол, кабель-лоток).
- Промпт: `Photorealistic photo from below of an under-desk cable tray with neatly routed
  cables and velcro straps, wooden desk underside, soft light, no logos, no text, 3:2`.
- Alt: «Лоток под столешницей: провода лежат внутри, стяжки держат пучок».
- Подпись: «Лоток решает главную проблему — провода перестают падать на ноги и собирать пыль».

### Фото 10 · Статья 14 · `kabel-menedzhment-pod-stolom-svoimi-rukami`

- Файл: `14-kabel-menedzhment-pod-stolom-svoimi-rukami-foto-2.jpg`
- Что снять: клипса на ноге стола и бирки на проводах, крупно; видно, что крепление без
  сверления (самоклейка или зажим).
- Сток: `cable clip desk leg`, `cable labels velcro`, `adhesive cable clips`
  (RU: клипса для провода, бирки на провода).
- Промпт: `Photorealistic macro, self-adhesive cable clip on a desk leg holding two cables, one
  cable has a small blank label, clean modern desk, soft light, no logos, no text, 3:2`.
- Alt: «Клипса на ноге стола и бирка на проводе: крепление без сверления».
- Подпись: «Клипса и бирка — два рубля, а искать нужный провод в следующий раз придётся секунду,
  а не десять минут».

### Фото 11 · Статья 13 · `akusticheskie-paneli-dlya-domashnego-kabineta`

- Файл: `13-akusticheskie-paneli-dlya-domashnego-kabineta-foto.jpg`
- Что снять: войлочная панель и поролон рядом, крупно, под углом: видна толщина, фактура и срез.
  Это выбор материала, его словами не передать.
- Сток: `acoustic felt panel`, `acoustic foam panel texture`
  (RU: акустическая панель войлок, акустический поролон).
- Промпт: `Photorealistic macro, a 9 mm polyester felt acoustic panel next to a classic grey
  acoustic foam wedge, edge visible, soft side light, plain background, no logos, no text, 3:2`.
- Alt: «Войлочная панель и поролон рядом: видна разница в толщине и фактуре».
- Подпись: «Войлок 9 мм гасит середину и верх, поролон-пирамидка — верх; для голоса важнее
  войлок и расстояние до стены».

### Фото 12 · Статья 11 · `printer-dlya-doma-kompaktno-i-kuda-postavit`

- Файл: `11-printer-dlya-doma-kompaktno-i-kuda-postavit-foto.jpg`
- Что снять: компактный принтер на тумбе рядом со столом, в кадре часть стола и стены — чтобы
  читался реальный масштаб и что он никому не мешает.
- Сток: `small printer on cabinet`, `home printer desk corner`
  (RU: принтер на тумбе, компактный принтер дома).
- Промпт: `Photorealistic interior photo, compact white laser printer on a low wooden cabinet
  next to a desk, cable hidden behind, daylight from a window, no logos, no text, 3:2`.
- Alt: «Компактный принтер на тумбе рядом со столом: видно, сколько места он занимает».
- Подпись: «Компактность — это не только ширина: важны глубина, ход лотка и куда открывается
  крышка».

### Фото 13 · Статья 12 · `rabota-za-noutbukom-bez-boli-v-shee`

- Файл: `12-rabota-za-noutbukom-bez-boli-v-shee-foto.jpg`
- Что снять: ноутбук на подставке (экран на уровне глаз) и внешняя клавиатура, руки на ней.
  Кадр сбоку, чтобы была видна высота экрана.
- Сток: `laptop stand external keyboard desk`, `laptop riser setup`
  (RU: подставка для ноутбука, ноутбук на подставке с клавиатурой).
- Промпт: `Photorealistic side view of a laptop on an aluminium stand raised to eye level, an
  external keyboard in front with hands typing, light desk, soft daylight, no logos, no text,
  3:2`.
- Alt: «Ноутбук на подставке и внешняя клавиатура: экран выше, руки ниже».
- Подпись: «Смысл подставки не в наклоне, а в том, что экран можно поднять, не поднимая руки».

### Фото 14 · Статья 23 · `rabochee-mesto-v-semnoy-kvartire`

- Файл: `23-rabochee-mesto-v-semnoy-kvartire-foto.jpg`
- Что снять: струбцина на столешнице без сверления, вид снизу-сбоку: видно, что крепление
  держится за кромку и ничего не проделано в столе.
- Сток: `clamp desk no drilling`, `desk clamp monitor mount edge`
  (RU: струбцина без сверления, зажим на столешнице).
- Промпт: `Photorealistic close-up from below of a clamp fixing a monitor arm to a rented
  apartment desk, no holes drilled, wooden top, neutral light, no logos, no text, 3:2`.
- Alt: «Струбцина на столешнице: крепление за кромку, отверстий в столе нет».
- Подпись: «Съёмное крепление держится за кромку: после переезда на столе не остаётся следов».

### Фото 15 · Статья 21 · `rabochee-mesto-na-balkone`

- Файл: `21-rabochee-mesto-na-balkone-foto.jpg`
- Что снять: холодное остекление и конденсат на раме, крупно: капли на стекле и на профиле.
  «Балкон — инженерия, а не картинка» — нужен реальный узел, а не красивый вид.
- Сток: `condensation window frame`, `cold glazing balcony`
  (RU: конденсат на окне, холодное остекление балкона).
- Промпт: `Photorealistic macro of condensation on an aluminium window profile and glass,
  winter morning, droplets running down, cold blue daylight, no people, no logos, no text, 3:2`.
- Alt: «Конденсат на раме холодного остекления: вода на профиле после ночи».
- Подпись: «Если утром на раме вода — одним обогревателем балкон не спасти: сначала считают
  точку росы, потом ставят стол».

## 4. Что дальше

1. Вы кладёте файлы в `images/editorial/` с именами из списка.
2. Я вставляю их в тексты (каждое — в свой раздел), прописываю alt и подпись, делаю `-640`/`-320`,
   заполняю `images/SOURCES.md`, прогоняю `node tools/verify-build.js`.
3. Обложки-мультики рисую отдельно по таблице раздела 3 из `docs/image-plan.md` — их генерировать
   не нужно, это наша графика.
