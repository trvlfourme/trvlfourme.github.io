import { Article, CategoryInfo, LaunchChecklistItem, ProductItem, SetupPreset } from '../types';
import { EDITORIAL_AUTHOR } from './editorial';
import { SITE_ARTICLES } from './site.generated';

export { EDITORIAL_AUTHOR };

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'Все материалы', description: 'Полная база знаний по эргономике и продуктивности', count: 18 },
  { id: 'balance', label: 'Баланс и продуктивность', description: 'Work-Life Balance, защита от выгорания, ритуалы перехода и тайм-менеджмент', count: 4 },
  { id: 'organization', label: 'Планировка и порядок', description: 'Выбор комнаты, расположение у окна, кабель-менеджмент', count: 3 },
  { id: 'ergonomics', label: 'Эргономика и здоровье', description: 'Здоровая осанка, настройки стола, стула и монитора', count: 4 },
  { id: 'furniture', label: 'Столы и кресла', description: 'Тесты электростолов, ортопедических кресел и подставок', count: 4 },
  { id: 'lighting-sound', label: 'Свет и микрофоны', description: 'Скринбары, рассеянный свет, ENC-гарнитуры и петлички', count: 2 },
  { id: 'with-kids', label: 'Удаленка с детьми', description: 'Зонирование, фокус, созвоны без шума и режим дня', count: 2 },
  { id: 'other', label: 'Прочее', description: 'Удаленка в поездках, цифровой номадизм, техника в дорогу и нестандартные форматы', count: 1 },
];

export const POPULAR_TAGS: string[] = [
  'Баланс',
  'Work-Life',
  'Эргономика',
  'Осанка',
  'Кресла',
  'Столы',
  'Освещение',
  'Звук и шум',
  'С детьми',
  'Кабель-менеджмент',
  'Поездки',
  'Тайм-менеджмент',
  'Биоритмы и сон',
  'Бюджетный сетап',
  'Здоровье спины',
  'Микрофоны',
  'Планировка',
  'Компактная квартира'
];

/**
 * Returns tags for an article, falling back to smart contextual tags if undefined
 */
export function getTagsForArticle(article: { category?: string; title?: string; tags?: string[] }): string[] {
  if (article.tags && article.tags.length > 0) return article.tags;
  const t = (article.title || '').toLowerCase();
  const c = article.category || '';
  const tags: string[] = [];

  if (c === 'balance' || /баланс|выгоран|отдых|стресс|work-life|сон|ритуал|жизн/i.test(t)) {
    tags.push('Баланс', 'Work-Life', 'Биоритмы и сон');
  }
  if (c === 'with-kids' || /дет|малыш|семь/i.test(t)) {
    tags.push('С детьми', 'Зонирование');
  }
  if (c === 'furniture' || /стол|электропривод|подъемн/i.test(t)) {
    tags.push('Столы', 'Эргономика');
  }
  if (/кресл|стул|поясниц/i.test(t)) {
    tags.push('Кресла', 'Осанка');
  }
  if (c === 'lighting-sound' || /свет|скринбар|лампа/i.test(t)) {
    tags.push('Освещение');
  }
  if (/микрофон|звук|шум|акустик|гарнитур/i.test(t)) {
    tags.push('Звук и шум', 'Микрофоны');
  }
  if (c === 'organization' || /кабел|провод|порядок|зонирован/i.test(t)) {
    tags.push('Кабель-менеджмент', 'Планировка');
  }
  if (c === 'travel' || c === 'other' || /поездк|дорог|номад|отпуск/i.test(t)) {
    tags.push('Поездки', 'Автономность');
  }
  if (/бюджет|2500|недорого|с нуля/i.test(t)) {
    tags.push('Бюджетный сетап');
  }
  if (tags.length === 0) {
    tags.push('Эргономика', 'Продуктивность');
  }
  return Array.from(new Set(tags));
}

export const PRODUCTS_EDITORIAL: ProductItem[] = [
  {
    id: 'ergostol-terra',
    name: 'Ergostol Terra (электрорегулировка)',
    brand: 'Ergostol',
    category: 'desk',
    shortDesc: 'Стол с двухмоторным приводом, памятью на 4 положения и защитой от зажима',
    priceRub: 38900,
    pros: ['Два мотора и плавный ход без вибраций', 'Память высоты на 4 пресета', 'Широкий диапазон 62–128 см (подходит и детям, и высоким взрослым)'],
    cons: ['Тяжелая рама (более 28 кг)', 'Сборка требует шуруповерта'],
    imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'metta-samurai-s3',
    name: 'Metta Samurai S-3.05 (Сетка)',
    brand: 'Метта',
    category: 'chair',
    shortDesc: 'Сетчатое эргономичное кресло с раздельной синхромеханикой и поддержкой поясницы',
    priceRub: 24900,
    pros: ['Сверхпрочный стальной каркас', 'Дышащая сетка (спина не потеет летом)', 'Синхромеханика Multiblock со смещенной осью качания', 'Регулируемый по высоте и глубине поясничный валик'],
    cons: ['Жестковато для любителей мягких кожаных кресел', 'Подлокотники 2D (нет регулировки угла поворота в базовой версии)'],
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'sihoo-doro-c300',
    name: 'SIHOO Doro C300 Ergonomic Chair',
    brand: 'SIHOO',
    category: 'chair',
    shortDesc: 'Динамическая поясничная опора с системой автоподстройки угла наклона тела',
    priceRub: 34500,
    pros: ['Подвижная 3D-поддержка поясницы под любой наклон', 'Мягкие 3D-подлокотники с широким диапазоном настроек', 'Широкий подголовник для расслабления шейного отдела'],
    cons: ['Пластиковая крестовина (но армированная нейлоном)', 'Цена в РФ колеблется из-за курса'],
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'xiaomi-lightbar',
    name: 'Xiaomi Mi Computer Monitor Light Bar (1S)',
    brand: 'Xiaomi',
    category: 'lighting',
    shortDesc: 'Асимметричный скринбар на монитор с беспроводным пультом управления',
    priceRub: 4290,
    pros: ['Асимметричная оптика (нулевые блики на матрице экрана)', 'Удобный беспроводной поворотный пульт', 'CRI > 90 (естественная передача цветов)', 'Не занимает место на столе'],
    cons: ['Питание по USB-C (нужен порт 5V/1A или блочок)', 'Крепление слабо подходит для очень толстых или изогнутых мониторов > 1500R'],
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'benq-screenbar-halo',
    name: 'BenQ ScreenBar Halo',
    brand: 'BenQ',
    category: 'lighting',
    shortDesc: 'Премиум скринбар с тыловой подсветкой стены для защиты зрения в темноте',
    priceRub: 19800,
    pros: ['Тыловая фоновая подсветка стены (Ambient light)', 'Интеллектуальный авто-датчик освещенности', 'Идеально садится на изогнутые мониторы', 'Сенсорный беспроводной пульт'],
    cons: ['Высокая цена', 'Требует мощного питания (USB 5V/1.5A)'],
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'jabra-evolve2-65',
    name: 'Jabra Evolve2 65 Flex (ENC микрофон)',
    brand: 'Jabra',
    category: 'audio',
    shortDesc: 'Беспроводная бизнес-гарнитура со складной штангой и шумоподавлением микрофона уровня студии',
    priceRub: 23500,
    pros: ['Абсолютное подавление фоновых бытовых шумов', 'Индикатор занятости Busylight (ребенок видит красный огонек)', 'Складная компактная конструкция', 'До 32 часов работы от одного заряда'],
    cons: ['Накладная посадка (может давить при ношении более 4 часов подряд)', 'Пассивное шумоподавление динамиков среднее'],
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Ситилинк», ИНН 7718979307'
  },
  {
    id: 'fifine-k688',
    name: 'Fifine K688 (Динамический XLR/USB микрофон)',
    brand: 'Fifine',
    category: 'audio',
    shortDesc: 'Динамический кардиоидный микрофон: ловит только голос и игнорирует эхо комнаты',
    priceRub: 6490,
    pros: ['Динамический капсюль (не ловит эхо голой комнаты и шум соседей)', 'Сенсорная кнопка глушения Mute со светодиодом', 'Выход на наушники с прямым мониторингом без задержки', 'Металлический корпус и паук-амортизатор в комплекте'],
    cons: ['Нужно говорить близко к микрофону (до 15 см)', 'Требуется пантограф на край стола'],
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'onkron-g80',
    name: 'Кронштейн для монитора ONKRON G80 (газлифт)',
    brand: 'ONKRON',
    category: 'accessory',
    shortDesc: 'Надежный настольный газлифт-кронштейн для экранов 13–32 дюйма весом до 8 кг',
    priceRub: 3290,
    pros: ['Мягкий газлифт для регулировки одним пальцем', 'Встроенный скрытый кабель-канал', 'Два типа крепления: струбцина к краю или через отверстие в столе', 'VESA 75x75 и 100x100'],
    cons: ['Требуется отрегулировать жесткость пружины под вес экрана'],
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'cable-management-kit',
    name: 'Подвесной лоток кабель-менеджмента под стол',
    brand: 'ErgoSteel',
    category: 'organization',
    shortDesc: 'Металлический корзинный лоток на струбцинах (без сверления столешницы)',
    priceRub: 1850,
    pros: ['Установка без сверления (мягкие накладки на струбцинах)', 'Вместительный (длина 40 см, глубина 12 см)', 'Вентилируемая решетка (блоки питания не перегреваются)'],
    cons: ['Не подходит к столам с глубокой царгой толще 5 см'],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Вайлдберриз», ИНН 7721546864'
  },
  {
    id: 'ugreen-gan-100w',
    name: 'GaN-зарядка Ugreen Nexode 100W (4 порта USB-C / USB-A)',
    brand: 'Ugreen',
    category: 'accessory',
    shortDesc: 'Универсальный ультракомпактный блок питания для ноутбука, смартфона и наушников в дорогу',
    priceRub: 4890,
    pros: ['Выдает честные 100 Вт на один порт для мощных ноутбуков', 'Компактные размеры на основе нитрида галлия (GaN)', 'Защита от перегрева и скачков напряжения в зарубежных сетях'],
    cons: ['При подключении второго кабеля кратковременно перезагружает порты на 1 секунду'],
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'baseus-blade-powerbank',
    name: 'Тонкий пауэрбанк для ноутбука Baseus Blade 100W (20 000 мАч)',
    brand: 'Baseus',
    category: 'accessory',
    shortDesc: 'Плоский аккумулятор толщиной 18 мм для автономной работы с ноутбуком в поездках и кафе',
    priceRub: 6490,
    pros: ['Помещается в плоскую сумку для ноутбука', 'Информативный дисплей с процентом заряда и временем работы', 'Разрешен к провозу в ручной клади самолетов (74 Вт·ч)'],
    cons: ['Глянцевый дисплей может собирать микроцарапины без чехла'],
    imageUrl: 'https://images.unsplash.com/photo-1609592424368-c115712e09b5?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'moft-laptop-stand',
    name: 'Складная невидимая подставка для ноутбука MOFT Adhesive Stand',
    brand: 'MOFT',
    category: 'accessory',
    shortDesc: 'Ультратонкая (3 мм) складная подставка на дно ноутбука с углами 15° и 25°',
    priceRub: 2490,
    pros: ['Толщина всего 3 мм — ноутбук легко помещается в обычный чехол', 'Два удобных угла наклона: 15° (печать текста) и 25° (просмотр созвонов)', 'Многоразовый клеевой слой — не оставляет следов на алюминии', 'Выдерживает нагрузку до 8 кг'],
    cons: ['Не подходит к ноутбукам с вентиляционными решетками прямо по центру дна'],
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'travel-adapter-universal',
    name: 'Универсальный дорожный адаптер с розетками всего мира + USB-C PD 35W',
    brand: 'Lencent',
    category: 'accessory',
    shortDesc: 'Сетевой адаптер с выдвижными вилками UK / US / EU / AU и портами для быстрой зарядки',
    priceRub: 1990,
    pros: ['Работает более чем в 150 странах мира', 'Встроенный порт USB-C Power Delivery 35W для смартфона и планшета', 'Автоматический предохранитель с защитой от детей', 'Компактный кубический корпус'],
    cons: ['Не преобразует напряжение 110В в 220В (нужна поддержка техникой 100-240V)'],
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'chair-budget-burokrat',
    name: 'Бюрократ KB-8 (Сетка, поясничный упор)',
    brand: 'Бюрократ',
    category: 'chair',
    shortDesc: 'Бюджетное эргономичное кресло с дышащей спинкой и анатомическим поясничным валиком',
    priceRub: 6890,
    pros: ['Доступная цена до 7 000 ₽', 'Дышащая акриловая сетка', 'Регулируемый валик под поясницу', 'Плавный газлифт 3 класса'],
    cons: ['Пластиковая крестовина (нагрузка до 120 кг)', 'Фиксированные подлокотники без регулировки высоты'],
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'chair-chairman-795',
    name: 'Chairman 795 Ergo (Хром, синхромеханика)',
    brand: 'Chairman',
    category: 'chair',
    shortDesc: 'Оптимальный средний класс: хромированное пятилучие и синхронный механизм отклонения 1:2',
    priceRub: 13900,
    pros: ['Синхромеханика 1:2 с фиксацией в 3 положениях', 'Хромированный цельный металл крестовины', 'Плотный формованный ППУ сиденья не просиживается'],
    cons: ['Подголовник не регулируется по вылету вперед'],
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'chair-ergohuman-plus',
    name: 'Ergohuman Plus Elite (Алюминий, 5D адаптация)',
    brand: 'Comfort Workspace',
    category: 'chair',
    shortDesc: 'Премиальное ортопедическое кресло из литого алюминия с динамической поддержкой 24/7',
    priceRub: 68500,
    pros: ['Полностью литой монокок из полированного алюминия', 'Автоматически адаптирующийся поясничный блок', '5D подлокотники под смартфон, клавиатуру и планшет', 'Срок службы более 12 лет'],
    cons: ['Премиальная цена', 'Вес конструкции более 30 кг'],
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'desk-loft-wood-budget',
    name: 'Письменный стол Hoff Loft Wood 120х60',
    brand: 'Hoff Loft',
    category: 'desk',
    shortDesc: 'Прочный базовый стол на стальном замкнутом металлокаркасе со столешницей 22 мм',
    priceRub: 5990,
    pros: ['Жесткий металлический каркас без раскачки', 'Столешница 22 мм с антискольной кромкой 2 мм', 'Легкая сборка за 15 минут'],
    cons: ['Фиксированная стандартная высота 75 см (требуется подставка для ног при росте < 175 см)'],
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'desk-loctek-et114',
    name: 'Подъемный стол Loctek / Eureka Basic (1 мотор, память)',
    brand: 'Loctek',
    category: 'desk',
    shortDesc: 'Доступный стол с электроподъемом, дисплеем высоты и 4 пресетами памяти',
    priceRub: 21900,
    pros: ['Электроподъем по цене обычного офисного стола', 'Память на 4 кнопки (сидя, стоя, для ребенка)', 'Плавный старт и защита от перегрузки'],
    cons: ['Один мотор (скорость подъема чуть ниже двухмоторных)', 'Грузоподъемность 70 кг (достаточно для 2 мониторов и ПК)'],
    imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'lumbar-cushion-memory',
    name: 'Анатомическая подушка под поясницу с эффектом памяти (Memory Foam)',
    brand: 'ErgoSpine',
    category: 'accessory',
    shortDesc: 'Мгновенно превращает обычный жесткий стул в ортопедическое место за 1 490 ₽',
    priceRub: 1490,
    pros: ['Эффективное снятие боли в пояснице всего за 1 490 ₽', 'Эффект памяти Memory Foam без усадки со временем', 'Дышащий чехол 3D-сетка на молнии (легко стирать)', 'Подходит для дома, офиса и автокресла'],
    cons: ['Первые 2 дня требует привыкания к правильному прогибу спины'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Вайлдберриз», ИНН 7721546864'
  },
  {
    id: 'ergonomic-footrest-adjustable',
    name: 'Анатомическая подставка для ног с массажной поверхностью',
    brand: 'ErgoFeet Pro',
    category: 'accessory',
    shortDesc: 'Снимает застой крови и сдавливание подколенных сосудов при стандартной высоте стола',
    priceRub: 1890,
    pros: ['Свободная регулировка угла наклона от 0 до 30 градусов', 'Массажные ролики в центре для стимуляции кровообращения', 'Прорезиненные ножки не скользят по ламинату и плитке'],
    cons: ['Пластиковый корпус (не вставать полным весом)'],
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'laptop-stand-aluminum-folding',
    name: 'Алюминиевая складная подставка для ноутбука Ugreen / Baseus',
    brand: 'Ugreen',
    category: 'accessory',
    shortDesc: 'Поднимает дисплей ноутбука на уровень глаз (6 углов) и складывается в узкий чехол',
    priceRub: 1690,
    pros: ['Литой анодированный алюминий с силиконовыми накладками', '6 ступеней регулировки угла (15°–45°)', 'Складывается в узкий брусок шириной 4 см (чехол в комплекте)', 'Выдерживает тяжелые ноутбуки до 17.3 дюймов'],
    cons: ['Для комфортной печати требует внешнюю клавиатуру'],
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'mouse-delux-vertical',
    name: 'Вертикальная беспроводная мышь Delux M618DB',
    brand: 'Delux',
    category: 'accessory',
    shortDesc: 'Естественный хват «рукопожатие» 57° — защита кисти от туннельного синдрома запястья',
    priceRub: 1990,
    pros: ['Эргономичный угол 57° снимает напряжение сухожилий кисти', 'Тихий клик (Silent micro-switches)', 'Двойное подключение: Bluetooth 5.0 + радиоканал 2.4G', 'Встроенный аккумулятор (зарядка по Type-C)'],
    cons: ['Первые 3–4 дня требуется привыкание к боковому хвату'],
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'mouse-logitech-mx-master-3s',
    name: 'Logitech MX Master 3S (Бесшумная, MagSpeed)',
    brand: 'Logitech',
    category: 'accessory',
    shortDesc: 'Флагманская мышь для профессионалов: бесшумные клики, колесо 1000 строк/сек и боковой скролл',
    priceRub: 10900,
    pros: ['Сверхтихие клики Quiet Clicks (на 90% тише предшественника)', 'Электромагнитная прокрутка MagSpeed SmartShift', 'Сенсор Darkfield 8000 DPI работает на любой поверхности', 'Подключение к 3 устройствам с технологией Flow (копирование между Mac и Windows)'],
    cons: ['Рассчитана строго под правую руку', 'Вес 141 г (не для киберспорта)'],
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'headphones-anker-space-one',
    name: 'Anker Soundcore Space One (Активное шумоподавление ANC)',
    brand: 'Anker',
    category: 'audio',
    shortDesc: 'Беспроводные полноразмерные наушники с 2-кратным подавлением человеческого голоса',
    priceRub: 7490,
    pros: ['Адаптивное активное шумоподавление (ANC)', 'До 55 часов работы (40 часов с включенным ANC)', 'Поддержка кодека высокой четкости LDAC', 'Режим прозрачности активируется прикосновением ладони'],
    cons: ['Микрофон в ветреную погоду на улице передает шумы (для дома идеален)'],
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'webcam-anker-powerconf-c200',
    name: 'Веб-камера Anker PowerConf C200 2K (Физическая шторка)',
    brand: 'Anker',
    category: 'audio',
    shortDesc: '2K QHD веб-камера с физической шторкой приватности и направленными микрофонами с ИИ',
    priceRub: 5890,
    pros: ['Четкое разрешение 2K QHD с естественной цветопередачей', 'Физическая сдвижная шторка объектива', 'Двойные стереомикрофоны с алгоритмом подавления эха', 'Регулируемый угол обзора: 65°, 78° или 95°'],
    cons: ['Нет автофокуса (фокус фиксированный, оптимизирован под дистанцию 40–120 см)'],
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'pomodoro-timer-cube',
    name: 'Физический Pomodoro-таймер TickTime Cube',
    brand: 'TickTime',
    category: 'accessory',
    shortDesc: 'Шестигранный гравитационный таймер для спринтов глубокой концентрации без отвлечения на смартфон',
    priceRub: 2890,
    pros: ['Мгновенный старт переворачиванием грани', 'Исключает контакт со смартфоном во время работы', 'Бесшумный виброрежим для тихих созвонов', 'Магнитный корпус крепится к ножке стола'],
    cons: ['Фиксированные пресеты минут на гранях'],
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'acupressure-mat-pranamat',
    name: 'Игольчатый акупунктурный коврик для спины и шеи',
    brand: 'Bradex / Pranamat',
    category: 'accessory',
    shortDesc: 'Медицинский акупрессурный мат для вечернего снятия компрессии и мышечных спазмов поясницы',
    priceRub: 2390,
    pros: ['Быстро снимает ощущение затекшей спины', 'Льняной гипоаллергенный чехол и кокосовая койра', 'Компактно сворачивается в рулон'],
    cons: ['Первые 2 минуты легкое покалывание до наступления приятного тепла'],
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',






    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  }
];

export const ARTICLES_DATA: Article[] = SITE_ARTICLES;

export const SETUP_PRESETS: SetupPreset[] = [
  {
    id: 'preset-parent-focus',
    title: 'Удаленный родитель (Тишина и фокус)',
    targetAudience: 'Специалисты с детьми в 1-2 комнатной квартире',
    budgetRub: 53980,
    description: 'Комплект с упором на отсечение детских криков микрофоном, эргономичное кресло и скринбар для работы ранним утром или поздним вечером.',
    includedProductIds: ['metta-samurai-s3', 'xiaomi-lightbar', 'jabra-evolve2-65', 'cable-management-kit'],
    keyBenefit: 'Коллеги не слышат плача и мультиков, спина не затекает, ребенок видит индикатор звонка'
  },
  {
    id: 'preset-sit-stand-pro',
    title: 'Здоровая спина 360° (Sit-Stand Pro)',
    targetAudience: 'Разработчики, аналитики и дизайнеры (8+ часов у экрана)',
    budgetRub: 81580,
    description: 'Двухмоторный подъемный стол, адаптивное ортопедическое кресло и газлифт-кронштейн для экрана. Идеальная профилактика грыж.',
    includedProductIds: ['ergostol-terra', 'sihoo-doro-c300', 'onkron-g80', 'cable-management-kit'],
    keyBenefit: 'Чередование работы стоя и сидя каждые 45 минут + освобождение 100% поверхности стола'
  },
  {
    id: 'preset-budget-starter',
    title: 'Умный старт до 35 000 ₽',
    targetAudience: 'Быстрый апгрейд базового рабочего стола с минимальными вложениями',
    budgetRub: 34330,
    description: 'Надежное российское кресло с 10-летней гарантией, свет без бликов на экран и наведение идеального порядка под ногами.',
    includedProductIds: ['metta-samurai-s3', 'xiaomi-lightbar', 'onkron-g80', 'cable-management-kit'],
    keyBenefit: 'Максимальный КПД на каждый вложенный рубль без переплат за премиум бренды'
  }
];

export const LAUNCH_CHECKLIST_DATA: LaunchChecklistItem[] = [
  {
    id: 'step-google',
    title: '1. Единый рабочий аккаунт под проект',
    service: 'Google / Яндекс ID',
    status: 'completed',
    priority: 'must_have',
    directLink: 'https://accounts.google.com',
    whyNeeded: 'Центр управления: привязка Яндекс Вебмастера, Google Search Console, счетчиков Яндекс Метрики и регистрация в партнерских кабинетах.',
    actionGuide: 'Аккаунт готов. Используйте его для входа во все сервисы.'
  },
  {
    id: 'step-yandex-distrib',
    title: '2. Яндекс Дистрибуция (Главная партнерка для Яндекс Маркета)',
    service: 'Яндекс Дистрибуция (distribution.yandex.ru)',
    status: 'in_progress',
    priority: 'must_have',
    directLink: 'https://distribution.yandex.ru',
    whyNeeded: '№1 в РФ по доступности и конверсии! Доступна без VPN, без ограничений по числу подписчиков (принимает сайты от 0 визитов со своим доменом). Автоматическая маркировка ОРД Яндекса, выплаты на карты РФ/самозанятому.',
    actionGuide: 'Войдите под Яндекс ID. Подайте заявку на оффер «Яндекс Маркет». В поле адреса площадки укажите ваш зарегистрированный домен https://kabinetdoma.ru.'
  },
  {
    id: 'step-advcake',
    title: '3. AdvCake (Главная e-commerce сеть: Мегамаркет, Hoff, Restore)',
    service: 'AdvCake.com',
    status: 'pending',
    priority: 'must_have',
    directLink: 'https://advcake.com',
    whyNeeded: 'Лидер российского e-commerce! Именно здесь сидят все крупнейшие ритейлеры мебели и техники: Мегамаркет (Сбер), Hoff, Restore, М.Видео, Эльдорадо, Орматек, Askona, ВсеИнструменты. Отличные комиссии на мебель и электронику.',
    actionGuide: 'Зарегистрируйтесь как Вебмастер (Webmaster). В качестве площадки укажите https://kabinetdoma.ru (тип: контентный сайт/обзоры). Модерация проходит быстро.'
  },
  {
    id: 'step-gdeslon',
    title: '4. ГдеСлон (gdeslon.ru) — мебель, кресла и техника для дома',
    service: 'GdeSlon.ru',
    status: 'pending',
    priority: 'must_have',
    directLink: 'https://www.gdeslon.ru',
    whyNeeded: 'Старейшая специализированная товарная CPA-сеть в РФ. Сотни интернет-магазинов мебели, электроники и товаров для дома. Идеально под наши статьи про столы, кресла и аксессуары.',
    actionGuide: 'Зарегистрируйтесь вебмастером на gdeslon.ru. Добавьте площадку kabinetdoma.ru и подключайте офферы мебельных фабрик в 1 клик.'
  },
  {
    id: 'step-wb-partners',
    title: '5. Wildberries Partners (Официальная партнерка WB)',
    service: 'WB Partners (partners.wb.ru / guru)',
    status: 'pending',
    priority: 'recommended',
    directLink: 'https://partners.wb.ru',
    whyNeeded: 'Прямая партнерская программа Wildberries. Огромный ассортимент кронштейнов, скринбаров, органайзеров проводов и мелочей для дома с быстрой доставкой в ПВЗ.',
    actionGuide: 'Авторизуйтесь по номеру телефона в кабинете WB Partners. Создавайте диплинки на любые товары из каталога WB.'
  },
  {
    id: 'step-ozon',
    title: '6. Ozon (Партнерские диплинки и CPA)',
    service: 'Ozon / CPA Агрегаторы',
    status: 'pending',
    priority: 'recommended',
    directLink: 'https://ozon.ru',
    whyNeeded: 'Ozon подключен к CPA-сетям (AdvCake, ГдеСлон, CityAds). Также можно использовать реферальные ссылки с персональным кодом или диплинками.',
    actionGuide: 'Подключайте оффер Ozon через кабинет AdvCake или ГдеСлон, либо используйте прямые диплинк-ссылки.'
  },
  {
    id: 'step-github',
    title: '7. Размещение на GitHub Pages + домен kabinetdoma.ru',
    service: 'GitHub Pages & DNS',
    status: 'in_progress',
    priority: 'must_have',
    directLink: 'https://github.com',
    whyNeeded: 'Бесплатный, вечный и надежный хостинг с привязкой домена kabinetdoma.ru без абонентской платы.',
    actionGuide: 'В репозитории GitHub во вкладке Settings -> Pages укажите Custom domain: kabinetdoma.ru. A-записи уже прописаны на nic.ru!'
  },
  {
    id: 'step-self-employed',
    title: '8. Статус самозанятого и автоматическая маркировка ОРД',
    service: 'Мой Налог / ОРД',
    status: 'completed',
    priority: 'must_have',
    directLink: 'https://npd.nalog.ru',
    whyNeeded: 'Легальный вывод комиссионных на любую карту российского банка с уплатой 4–6% налога. При работе через Яндекс Дистрибуцию и AdvCake маркировка ЕРИР идет автоматически.',
    actionGuide: 'Все плашки и ERID-маркировка уже интегрированы в карточки товаров сайта.'
  }
];

export const SEO_KEYWORDS_MATRIX = [
  { keyword: 'стол с электроприводом для работы стоя', cluster: 'Электростолы', volumeYandex: 5600, comp: 'Средняя', intent: 'Транзакционный', targetArticleId: 'guide-2-standing-desk' },
  { keyword: 'эргономичное кресло для работы за компьютером', cluster: 'Кресла', volumeYandex: 7800, comp: 'Высокая', intent: 'Коммерческий', targetArticleId: 'guide-3-chairs-review' },
  { keyword: 'рабочее место в однушке с ребенком', cluster: 'Удаленка и дети', volumeYandex: 4200, comp: 'Низкая', intent: 'Информационный / Value', targetArticleId: 'guide-1-kids-flat' },
  { keyword: 'скринбар на монитор xiaomi', cluster: 'Освещение', volumeYandex: 4900, comp: 'Средняя', intent: 'Транзакционный', targetArticleId: 'guide-4-monitor-lightbar' },
  { keyword: 'кабель менеджмент под столом', cluster: 'Организация', volumeYandex: 6200, comp: 'Низкая', intent: 'Информационный / DIY', targetArticleId: 'guide-6-cable-management' },
  { keyword: 'микрофон с шумоподавлением для удаленной работы', cluster: 'Звук', volumeYandex: 3800, comp: 'Средняя', intent: 'Коммерческий', targetArticleId: 'guide-5-noise-cancelling-audio' },
  { keyword: 'кронштейн для монитора на стол', cluster: 'Аксессуары', volumeYandex: 5100, comp: 'Средняя', intent: 'Коммерческий', targetArticleId: 'guide-7-ergonomic-accessories' },
  { keyword: 'как работать на удаленке с ребенком', cluster: 'Тайм-менеджмент', volumeYandex: 4700, comp: 'Низкая', intent: 'Информационный / Value', targetArticleId: 'guide-8-traffic-light-method' }
];

/**
 * Helper to find article by ID, primary slug or any legacy slug aliases (for SEO redirect compatibility)
 */
export function findArticleBySlugOrId(articles: Article[], identifier: string | null | undefined): Article | undefined {
  if (!identifier) return undefined;
  const clean = identifier.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return articles.find(a => 
    a.id.toLowerCase() === clean || 
    (a.slug && a.slug.toLowerCase() === clean) ||
    (a.slugAliases && a.slugAliases.some(alias => alias.toLowerCase() === clean))
  );
}
