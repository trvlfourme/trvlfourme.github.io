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
    fullDesc: 'Один из самых надежных регулируемых столов на российском рынке. Два тихих мотора плавно поднимают до 120 кг со скоростью 38 мм/с. Столешница из березовой фанеры или ЛДСП Egger устойчива к царапинам и прогибу.',
    priceRub: 38900,
    rating: 4.9,
    reviewsCount: 312,
    pros: ['Два мотора и плавный ход без вибраций', 'Память высоты на 4 пресета', 'Гарантия 5 лет в РФ', 'Широкий диапазон 62–128 см (подходит и детям, и высоким взрослым)'],
    cons: ['Тяжелая рама (более 28 кг)', 'Сборка требует шуруповерта'],
    specs: {
      'Грузоподъемность': '120 кг',
      'Диапазон высоты': '62–128 см',
      'Скорость подъема': '38 мм/сек',
      'Уровень шума': '< 45 дБ',
      'Гарантия': '5 лет'
    },
    imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=стол+с+электроприводом+Ergostol+Terra',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=стол+с+электроприводом+Ergostol+Terra',
    ozonUrl: 'https://www.ozon.ru/search/?text=Стол+с+электроприводом+Ergostol+Terra&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=стол+с+электроприводом+Ergostol',
    erid: '2VtzquvX8fP',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'metta-samurai-s3',
    name: 'Metta Samurai S-3.05 (Сетка)',
    brand: 'Метта',
    category: 'chair',
    shortDesc: 'Сетчатое эргономичное кресло с раздельной синхромеханикой и поддержкой поясницы',
    fullDesc: 'Легендарное кресло уфимского завода Метта. Стальной цельнолитой каркас с 10-летней гарантией. Сетка из сверхпрочной арамидной нити не провисает годами и обеспечивает отличную вентиляцию спины даже летом.',
    priceRub: 24900,
    rating: 4.8,
    reviewsCount: 840,
    pros: ['Сверхпрочный стальной каркас', 'Дышащая сетка (спина не потеет летом)', 'Синхромеханика Multiblock со смещенной осью качания', 'Регулируемый по высоте и глубине поясничный валик'],
    cons: ['Жестковато для любителей мягких кожаных кресел', 'Подлокотники 2D (нет регулировки угла поворота в базовой версии)'],
    specs: {
      'Макс. нагрузка': '120 кг',
      'Материал обивки': 'Сетка Kevlar / Арамид',
      'Механизм': 'Multiblock со смещением оси',
      'Крестовина': 'Литой хромированный металл'
    },
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'ВсеИнструменты / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=кресло+Метта+Самурай+S-3',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=кресло+Метта+Самурай+S-3',
    ozonUrl: 'https://www.ozon.ru/search/?text=Кресло+Метта+Самурай+S-3&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Метта+Самурай+S-3',
    erid: '2VtzquwY9aK',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'sihoo-doro-c300',
    name: 'SIHOO Doro C300 Ergonomic Chair',
    brand: 'SIHOO',
    category: 'chair',
    shortDesc: 'Динамическая поясничная опора с системой автоподстройки угла наклона тела',
    fullDesc: 'Флагман среднего ценового сегмента. Поясничный блок плавно следует за естественными микродвижениями позвоночника. Подлокотники 3D с мягким полиуретаном разгружают плечи при наборе текста.',
    priceRub: 34500,
    rating: 4.9,
    reviewsCount: 420,
    pros: ['Подвижная 3D-поддержка поясницы под любой наклон', 'Мягкие 3D-подлокотники с широким диапазоном настроек', 'Широкий подголовник для расслабления шейного отдела'],
    cons: ['Пластиковая крестовина (но армированная нейлоном)', 'Цена в РФ колеблется из-за курса'],
    specs: {
      'Макс. нагрузка': '135 кг',
      'Механизм': 'Синхронный со слайдером сиденья',
      'Газлифт': 'Class 4 (TUV сертифицирован)'
    },
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Алиэкспресс РФ',
    admitadUrl: 'https://market.yandex.ru/search?text=эргономичное+кресло+SIHOO+Doro+C300',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=эргономичное+кресло+SIHOO+Doro+C300',
    ozonUrl: 'https://www.ozon.ru/search/?text=SIHOO+Doro+C300&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=SIHOO+Doro+C300',
    erid: '2VtzqumN5xB',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'xiaomi-lightbar',
    name: 'Xiaomi Mi Computer Monitor Light Bar (1S)',
    brand: 'Xiaomi',
    category: 'lighting',
    shortDesc: 'Асимметричный скринбар на монитор с беспроводным пультом управления',
    fullDesc: 'Идеальное освещение рабочей зоны без бликов на экране монитора и без слепящего прямого света в глаза. Беспроводной пульт-шайба позволяет регулировать яркость и цветовую температуру (2700K–6500K) одним движением пальца.',
    priceRub: 4290,
    rating: 4.95,
    reviewsCount: 1850,
    pros: ['Асимметричная оптика (нулевые блики на матрице экрана)', 'Удобный беспроводной поворотный пульт', 'CRI > 90 (естественная передача цветов)', 'Не занимает место на столе'],
    cons: ['Питание по USB-C (нужен порт 5V/1A или блочок)', 'Крепление слабо подходит для очень толстых или изогнутых мониторов > 1500R'],
    specs: {
      'Индекс цветопередачи': 'Ra95',
      'Цветовая температура': '2700K–6500K',
      'Мощность': '5 Вт (USB Type-C)',
      'Управление': 'Беспроводная 2.4 GHz шайба'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=Xiaomi+Monitor+Light+Bar+1S+скринбар',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=Xiaomi+Monitor+Light+Bar+1S+скринбар',
    ozonUrl: 'https://www.ozon.ru/search/?text=Xiaomi+Mi+Computer+Monitor+Light+Bar&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Xiaomi+Monitor+Light+Bar',
    erid: '2VtzqukJ8vP',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'benq-screenbar-halo',
    name: 'BenQ ScreenBar Halo',
    brand: 'BenQ',
    category: 'lighting',
    shortDesc: 'Премиум скринбар с тыловой подсветкой стены для защиты зрения в темноте',
    fullDesc: 'Золотой стандарт освещения рабочего стола. Помимо мощного переднего луча с запатентованным оптическим фильтром, имеет задний светильник для равномерного освещения фоновой стены, что снижает контрастную нагрузку на сетчатку глаза на 60%.',
    priceRub: 19800,
    rating: 4.98,
    reviewsCount: 210,
    pros: ['Тыловая фоновая подсветка стены (Ambient light)', 'Интеллектуальный авто-датчик освещенности', 'Идеально садится на изогнутые мониторы', 'Сенсорный беспроводной пульт'],
    cons: ['Высокая цена', 'Требует мощного питания (USB 5V/1.5A)'],
    specs: {
      'Освещенность': '1000 люкс в центре',
      'CRI': '> 95',
      'Совместимость': 'Плоские и изогнутые экраны 1000R-1800R'
    },
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Ситилинк',
    admitadUrl: 'https://market.yandex.ru/search?text=BenQ+ScreenBar+Halo',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=BenQ+ScreenBar+Halo',
    ozonUrl: 'https://www.ozon.ru/search/?text=BenQ+ScreenBar+Halo&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=BenQ+ScreenBar',
    erid: '2VtzqurB4bY',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'jabra-evolve2-65',
    name: 'Jabra Evolve2 65 Flex (ENC микрофон)',
    brand: 'Jabra',
    category: 'audio',
    shortDesc: 'Беспроводная бизнес-гарнитура со складной штангой и шумоподавлением микрофона уровня студии',
    fullDesc: 'Спасение для созвонов в квартире с детьми. Штанга с тремя цифровыми MEMS-микрофонами отсекает плач ребенка, пылесос и шум посуды на расстоянии уже 1 метра от вас. Собеседники в Zoom или Телемосте слышат только ваш чистый голос.',
    priceRub: 23500,
    rating: 4.88,
    reviewsCount: 390,
    pros: ['Абсолютное подавление фоновых бытовых шумов', 'Индикатор занятости Busylight (ребенок видит красный огонек)', 'Складная компактная конструкция', 'До 32 часов работы от одного заряда'],
    cons: ['Накладная посадка (может давить при ношении более 4 часов подряд)', 'Пассивное шумоподавление динамиков среднее'],
    specs: {
      'Тип микрофона': '3 цифровых MEMS с чипсетом ENC',
      'Автономность': '32 часа',
      'Связь': 'Bluetooth 5.2 + USB-адаптер Jabra Link 380',
      'Индикатор занятости': 'Красный круговой LED светодиод'
    },
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ситилинк / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=Jabra+Evolve2+65+гарнитура',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=Jabra+Evolve2+65+гарнитура',
    ozonUrl: 'https://www.ozon.ru/search/?text=Jabra+Evolve2+65&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Jabra+Evolve2+65',
    erid: '2VtzqupL3kQ',
    ordAdvertiser: 'ООО «Ситилинк», ИНН 7718979307'
  },
  {
    id: 'fifine-k688',
    name: 'Fifine K688 (Динамический XLR/USB микрофон)',
    brand: 'Fifine',
    category: 'audio',
    shortDesc: 'Динамический кардиоидный микрофон: ловит только голос и игнорирует эхо комнаты',
    fullDesc: 'В отличие от конденсаторных микрофонов, которые ловят шум за три комнаты, динамический капсюль K688 захватывает звук в радиусе 10–15 см. Двойное подключение USB и XLR позволяет начать сразу с ноутбуком, а позже подключить аудиокарту.',
    priceRub: 6490,
    rating: 4.92,
    reviewsCount: 1120,
    pros: ['Динамический капсюль (не ловит эхо голой комнаты и шум соседей)', 'Сенсорная кнопка глушения Mute со светодиодом', 'Выход на наушники с прямым мониторингом без задержки', 'Металлический корпус и паук-амортизатор в комплекте'],
    cons: ['Нужно говорить близко к микрофону (до 15 см)', 'Требуется пантограф на край стола'],
    specs: {
      'Тип капсюля': 'Динамический кардиоидный',
      'Интерфейсы': 'USB Type-C + XLR',
      'Частотный диапазон': '70 Гц – 15 000 Гц',
      'Кнопка глушения': 'Сенсорная на верхней крышке'
    },
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / WB',
    admitadUrl: 'https://market.yandex.ru/search?text=Fifine+K688+микрофон',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=Fifine+K688+микрофон',
    ozonUrl: 'https://www.ozon.ru/search/?text=Fifine+K688&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Fifine+K688',
    erid: '2VtzqucD1mZ',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'onkron-g80',
    name: 'Кронштейн для монитора ONKRON G80 (газлифт)',
    brand: 'ONKRON',
    category: 'accessory',
    shortDesc: 'Надежный настольный газлифт-кронштейн для экранов 13–32 дюйма весом до 8 кг',
    fullDesc: 'Освобождает до 40% полезной площади стола. Позволяет выставить верхнюю кромку монитора строго на уровень глаз, предотвращая наклон головы вперед и снимая до 15 кг статической нагрузки с шейных позвонков.',
    priceRub: 3290,
    rating: 4.94,
    reviewsCount: 2640,
    pros: ['Мягкий газлифт для регулировки одним пальцем', 'Встроенный скрытый кабель-канал', 'Два типа крепления: струбцина к краю или через отверстие в столе', 'VESA 75x75 и 100x100'],
    cons: ['Требуется отрегулировать жесткость пружины под вес экрана'],
    specs: {
      'Диагональ экрана': '13–32 дюйма',
      'Нагрузка': '2–8 кг',
      'Стандарты VESA': '75x75, 100x100 мм',
      'Вращение (Pivot)': '360° (портретный режим)'
    },
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'ВсеИнструменты / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=ONKRON+G80+кронштейн+для+монитора',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=ONKRON+G80+кронштейн+для+монитора',
    ozonUrl: 'https://www.ozon.ru/search/?text=ONKRON+G80&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=ONKRON+G80',
    erid: '2VtzquvF8tK',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'cable-management-kit',
    name: 'Подвесной лоток кабель-менеджмента под стол',
    brand: 'ErgoSteel',
    category: 'organization',
    shortDesc: 'Металлический корзинный лоток на струбцинах (без сверления столешницы)',
    fullDesc: 'Решает главную проблему висящих проводов. Струбцины надежно фиксируются за 2 минуты без повреждения мебели. Внутрь свободно помещается удлинитель на 6–8 розеток и массивные блоки питания ноутбуков и мониторов.',
    priceRub: 1850,
    rating: 4.86,
    reviewsCount: 540,
    pros: ['Установка без сверления (мягкие накладки на струбцинах)', 'Вместительный (длина 40 см, глубина 12 см)', 'Вентилируемая решетка (блоки питания не перегреваются)'],
    cons: ['Не подходит к столам с глубокой царгой толще 5 см'],
    specs: {
      'Размеры': '40 x 12 x 15 см',
      'Толщина столешницы': 'до 50 мм',
      'Материал': 'Углеродистая сталь с порошковой покраской'
    },
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Wildberries / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=кабель+канал+под+стол+сетка+органайзер',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=кабель+канал+под+стол+сетка+органайзер',
    wbUrl: 'https://www.wildberries.ru/search?query=кабель+канал+под+стол',
    ozonUrl: 'https://www.ozon.ru/search/?text=Лоток+для+кабель+менеджмента+под+стол&from_global=true',
    erid: '2VtzquwQ4zR',
    ordAdvertiser: 'ООО «Вайлдберриз», ИНН 7721546864'
  },
  {
    id: 'ugreen-gan-100w',
    name: 'GaN-зарядка Ugreen Nexode 100W (4 порта USB-C / USB-A)',
    brand: 'Ugreen',
    category: 'accessory',
    shortDesc: 'Универсальный ультракомпактный блок питания для ноутбука, смартфона и наушников в дорогу',
    fullDesc: 'Заменяет собой сразу 4 громоздких адаптера питания. Поддерживает протоколы Power Delivery 3.0 и Quick Charge 4+, позволяя одновременно быстро заряжать рабочий ноутбук на 65–100 Вт, телефон и пауэрбанк от одной розетки в отеле, поезде или аэропорту.',
    priceRub: 4890,
    rating: 4.9,
    reviewsCount: 640,
    pros: ['Выдает честные 100 Вт на один порт для мощных ноутбуков', 'Компактные размеры на основе нитрида галлия (GaN)', 'Защита от перегрева и скачков напряжения в зарубежных сетях'],
    cons: ['При подключении второго кабеля кратковременно перезагружает порты на 1 секунду'],
    specs: {
      'Мощность': 'до 100 Вт',
      'Порты': '3x USB-C + 1x USB-A',
      'Технология': 'GaN Fast',
      'Вес': '235 г'
    },
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=ugreen+nexode+100w+gan',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=ugreen+nexode+100w+gan',
    ozonUrl: 'https://www.ozon.ru/search/?text=ugreen+nexode+100w+gan&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=ugreen+100w+gan',
    erid: '2VtzquvX8fP',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'baseus-blade-powerbank',
    name: 'Тонкий пауэрбанк для ноутбука Baseus Blade 100W (20 000 мАч)',
    brand: 'Baseus',
    category: 'accessory',
    shortDesc: 'Плоский аккумулятор толщиной 18 мм для автономной работы с ноутбуком в поездках и кафе',
    fullDesc: 'Уникальный плоский форм-фактор позволяет носить пауэрбанк в одном кармане с ноутбуком. Выдает ток до 100 Вт через USB-C, продлевая время работы ноутбука на 4–6 дополнительных часов в условиях отсутствия розеток или внезапного отключения света.',
    priceRub: 6490,
    rating: 4.8,
    reviewsCount: 420,
    pros: ['Помещается в плоскую сумку для ноутбука', 'Информативный дисплей с процентом заряда и временем работы', 'Разрешен к провозу в ручной клади самолетов (74 Вт·ч)'],
    cons: ['Глянцевый дисплей может собирать микроцарапины без чехла'],
    specs: {
      'Емкость': '20 000 мАч (74 Вт·ч)',
      'Выходная мощность': 'до 100 Вт (Power Delivery)',
      'Толщина': '18 мм',
      'Быстрая зарядка': 'QC 4.0, PD 3.0'
    },
    imageUrl: 'https://images.unsplash.com/photo-1609592424368-c115712e09b5?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=baseus+blade+100w+powerbank',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=baseus+blade+100w+powerbank',
    ozonUrl: 'https://www.ozon.ru/search/?text=baseus+blade+100w+powerbank&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=baseus+blade+100w',
    erid: '2VtzquvX8fP',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'moft-laptop-stand',
    name: 'Складная невидимая подставка для ноутбука MOFT Adhesive Stand',
    brand: 'MOFT',
    category: 'accessory',
    shortDesc: 'Ультратонкая (3 мм) складная подставка на дно ноутбука с углами 15° и 25°',
    fullDesc: 'Идеальное решение для мобильной работы. Наклеивается на нижнюю крышку ноутбука, практически не добавляет веса (всего 85 г) и раскладывается одним движением пальца. Приподнимает экран на 5–8 см, спасая шейный отдел позвоночника при работе за низкими журнальными столиками в гостиницах, поездах и кафе.',
    priceRub: 2490,
    rating: 4.88,
    reviewsCount: 780,
    pros: ['Толщина всего 3 мм — ноутбук легко помещается в обычный чехол', 'Два удобных угла наклона: 15° (печать текста) и 25° (просмотр созвонов)', 'Многоразовый клеевой слой — не оставляет следов на алюминии', 'Выдерживает нагрузку до 8 кг'],
    cons: ['Не подходит к ноутбукам с вентиляционными решетками прямо по центру дна'],
    specs: {
      'Толщина': '3 мм',
      'Вес': '85 г',
      'Углы наклона': '15° и 25°',
      'Материал': 'Стекловолокно и премиальная экокожа'
    },
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=подставка+для+ноутбука+moft',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=подставка+для+ноутбука+moft',
    ozonUrl: 'https://www.ozon.ru/search/?text=moft+подставка+для+ноутбука&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=moft+подставка',
    erid: '2VtzquvX8fP',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'travel-adapter-universal',
    name: 'Универсальный дорожный адаптер с розетками всего мира + USB-C PD 35W',
    brand: 'Lencent',
    category: 'accessory',
    shortDesc: 'Сетевой адаптер с выдвижными вилками UK / US / EU / AU и портами для быстрой зарядки',
    fullDesc: 'Незаменимый гаджет для поездок по России и за рубеж. Оснащен встроенным механизмом выдвижения вилок под стандарты Великобритании, США, стран Азии и Европы. Защищен самовосстанавливающимся предохранителем на 10А от скачков напряжения в ветхих электросетях.',
    priceRub: 1990,
    rating: 4.92,
    reviewsCount: 950,
    pros: ['Работает более чем в 150 странах мира', 'Встроенный порт USB-C Power Delivery 35W для смартфона и планшета', 'Автоматический предохранитель с защитой от детей', 'Компактный кубический корпус'],
    cons: ['Не преобразует напряжение 110В в 220В (нужна поддержка техникой 100-240V)'],
    specs: {
      'Поддерживаемые типы': 'US, UK, EU, AU (Типы A, C, G, I)',
      'Максимальная мощность': 'до 2500 Вт при 250В',
      'Порты': '2x USB-C + 2x USB-A + универсальная розетка'
    },
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=универсальный+дорожный+адаптер+переходник',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=универсальный+дорожный+адаптер+переходник',
    ozonUrl: 'https://www.ozon.ru/search/?text=дорожный+адаптер+переходник&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=дорожный+адаптер+переходник',
    erid: '2VtzquvX8fP',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'chair-budget-burokrat',
    name: 'Бюрократ KB-8 (Сетка, поясничный упор)',
    brand: 'Бюрократ',
    category: 'chair',
    shortDesc: 'Бюджетное эргономичное кресло с дышащей спинкой и анатомическим поясничным валиком',
    fullDesc: 'Идеальный вариант при ограниченном бюджете до 7 000 ₽. Сетка обеспечивает циркуляцию воздуха, а регулируемый по высоте поясничный валик надежно удерживает нижний отдел спины, предотвращая сутулость. Оснащено механизмом качания с регулировкой под вес.',
    priceRub: 6890,
    rating: 4.75,
    reviewsCount: 1420,
    pros: ['Доступная цена до 7 000 ₽', 'Дышащая акриловая сетка', 'Регулируемый валик под поясницу', 'Плавный газлифт 3 класса'],
    cons: ['Пластиковая крестовина (нагрузка до 120 кг)', 'Фиксированные подлокотники без регулировки высоты'],
    specs: {
      'Макс. нагрузка': '120 кг',
      'Материал': 'Сетка + износостойкая ткань',
      'Механизм': 'Топ-ган с фиксацией в рабочем положении',
      'Высота сиденья': '46–56 см'
    },
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=кресло+Бюрократ+KB-8',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=кресло+Бюрократ+KB-8',
    ozonUrl: 'https://www.ozon.ru/search/?text=Бюрократ+KB-8&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Бюрократ+KB-8',
    erid: '2VtzquvKB8B',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'chair-chairman-795',
    name: 'Chairman 795 Ergo (Хром, синхромеханика)',
    brand: 'Chairman',
    category: 'chair',
    shortDesc: 'Оптимальный средний класс: хромированное пятилучие и синхронный механизм отклонения 1:2',
    fullDesc: 'Золотая середина для ежедневной работы по 8–10 часов. Стальное пятилучие выдерживает до 130 кг. Синхромеханика разгружает мышцы бедер при откидывании, сохраняя стопы на полу.',
    priceRub: 13900,
    rating: 4.82,
    reviewsCount: 680,
    pros: ['Синхромеханика 1:2 с фиксацией в 3 положениях', 'Хромированный цельный металл крестовины', 'Плотный формованный ППУ сиденья не просиживается'],
    cons: ['Подголовник не регулируется по вылету вперед'],
    specs: {
      'Макс. нагрузка': '130 кг',
      'Крестовина': 'Хромированная сталь',
      'Механизм': 'Синхронный со смещенной осью',
      'Гарантия': '2 года'
    },
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=кресло+Chairman+795',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=кресло+Chairman+795',
    ozonUrl: 'https://www.ozon.ru/search/?text=Chairman+795&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Chairman+795',
    erid: '2VtzquvCH79',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'chair-ergohuman-plus',
    name: 'Ergohuman Plus Elite (Алюминий, 5D адаптация)',
    brand: 'Comfort Workspace',
    category: 'chair',
    shortDesc: 'Премиальное ортопедическое кресло из литого алюминия с динамической поддержкой 24/7',
    fullDesc: 'Вершина современной эргономики. Цельнолитой полированный алюминиевый каркас, эластомерная сетка со сбалансированным натяжением в 7 зонах тела и синхромеханика с плавной кинематикой качания.',
    priceRub: 68500,
    rating: 4.96,
    reviewsCount: 190,
    pros: ['Полностью литой монокок из полированного алюминия', 'Автоматически адаптирующийся поясничный блок', '5D подлокотники под смартфон, клавиатуру и планшет', 'Срок службы более 12 лет'],
    cons: ['Премиальная цена', 'Вес конструкции более 30 кг'],
    specs: {
      'Макс. нагрузка': '150 кг',
      'Каркас': 'Литой авиационный алюминий',
      'Сетка': 'Matrex Elastomer USA',
      'Гарантия': '5 лет в РФ'
    },
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Салоны Эргономики',
    admitadUrl: 'https://market.yandex.ru/search?text=кресло+Ergohuman+Plus+Elite',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=кресло+Ergohuman+Plus+Elite',
    ozonUrl: 'https://www.ozon.ru/search/?text=Ergohuman+Plus+Elite&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Ergohuman+Plus',
    erid: '2VtzquvEH88',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'desk-loft-wood-budget',
    name: 'Письменный стол Hoff Loft Wood 120х60',
    brand: 'Hoff Loft',
    category: 'desk',
    shortDesc: 'Прочный базовый стол на стальном замкнутом металлокаркасе со столешницей 22 мм',
    fullDesc: 'Отличное решение для стартового домашнего офиса. Сварной профиль 40х20 мм обеспечивает монолитную устойчивость без шатания при интенсивном наборе текста. Порошковая окраска устойчива к сколам.',
    priceRub: 5990,
    rating: 4.8,
    reviewsCount: 890,
    pros: ['Жесткий металлический каркас без раскачки', 'Столешница 22 мм с антискольной кромкой 2 мм', 'Легкая сборка за 15 минут'],
    cons: ['Фиксированная стандартная высота 75 см (требуется подставка для ног при росте < 175 см)'],
    specs: {
      'Размеры': '120 x 60 x 75 см',
      'Толщина столешницы': '22 мм',
      'Каркас': 'Сталь 40х20 мм с порошковым покрытием',
      'Макс. нагрузка': '90 кг'
    },
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Hoff',
    admitadUrl: 'https://market.yandex.ru/search?text=стол+письменный+лофт+120х60',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=стол+письменный+лофт+120х60',
    ozonUrl: 'https://www.ozon.ru/search/?text=стол+письменный+лофт+120+60&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=стол+лофт+120+60',
    erid: '2VtzquvHL12',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'desk-loctek-et114',
    name: 'Подъемный стол Loctek / Eureka Basic (1 мотор, память)',
    brand: 'Loctek',
    category: 'desk',
    shortDesc: 'Доступный стол с электроподъемом, дисплеем высоты и 4 пресетами памяти',
    fullDesc: 'Самый доступный способ внедрить смену поз «сидя-стоя» в свой рабочий график. Тихий одномоторный привод поднимает до 70 кг со скоростью 25 мм/с. Пульт с индикацией миллиметров и памятью под любимые уровни.',
    priceRub: 21900,
    rating: 4.84,
    reviewsCount: 510,
    pros: ['Электроподъем по цене обычного офисного стола', 'Память на 4 кнопки (сидя, стоя, для ребенка)', 'Плавный старт и защита от перегрузки'],
    cons: ['Один мотор (скорость подъема чуть ниже двухмоторных)', 'Грузоподъемность 70 кг (достаточно для 2 мониторов и ПК)'],
    specs: {
      'Диапазон высоты': '71–119 см',
      'Грузоподъемность': '70 кг',
      'Столешница': '120 x 60 см в комплекте',
      'Уровень шума': '< 50 дБ'
    },
    imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=подъемный+стол+Loctek+электропривод',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=подъемный+стол+Loctek+электропривод',
    ozonUrl: 'https://www.ozon.ru/search/?text=подъемный+стол+Loctek&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=подъемный+стол+Loctek',
    erid: '2VtzquvLT14',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'lumbar-cushion-memory',
    name: 'Анатомическая подушка под поясницу с эффектом памяти (Memory Foam)',
    brand: 'ErgoSpine',
    category: 'accessory',
    shortDesc: 'Мгновенно превращает обычный жесткий стул в ортопедическое место за 1 490 ₽',
    fullDesc: 'Лучший бюджетный лайфхак против боли в пояснице. Высокоплотная пена Memory Foam заполняет анатомический прогиб (лордоз L1-L5), не позволяя тазу сползать вперед. Два эластичных ремня с защелками надежно крепят подушку к любому офисному или кухонному стулу.',
    priceRub: 1490,
    rating: 4.9,
    reviewsCount: 3890,
    pros: ['Эффективное снятие боли в пояснице всего за 1 490 ₽', 'Эффект памяти Memory Foam без усадки со временем', 'Дышащий чехол 3D-сетка на молнии (легко стирать)', 'Подходит для дома, офиса и автокресла'],
    cons: ['Первые 2 дня требует привыкания к правильному прогибу спины'],
    specs: {
      'Наполнитель': '100% пенополиуретан с эффектом памяти',
      'Чехол': 'Съемный «дышащая сетка»',
      'Крепление': '2 регулируемых ремня с фастексами',
      'Размеры': '42 x 38 x 12 см'
    },
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Wildberries / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=подушка+под+поясницу+ортопедическая+memory+foam',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=подушка+под+поясницу+ортопедическая+memory+foam',
    ozonUrl: 'https://www.ozon.ru/search/?text=подушка+под+поясницу+ортопедическая+память&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=подушка+под+поясницу+ортопедическая',
    erid: '2VtzquvMF90',
    ordAdvertiser: 'ООО «Вайлдберриз», ИНН 7721546864'
  },
  {
    id: 'ergonomic-footrest-adjustable',
    name: 'Анатомическая подставка для ног с массажной поверхностью',
    brand: 'ErgoFeet Pro',
    category: 'accessory',
    shortDesc: 'Снимает застой крови и сдавливание подколенных сосудов при стандартной высоте стола',
    fullDesc: 'Обязательный аксессуар для людей ростом до 175 см, работающих за стандартными столами 75 см. Позволяет поднять кресло на нужную высоту подлокотников, сохраняя надежную опору стоп под физиологическим углом 15–20 градусов.',
    priceRub: 1890,
    rating: 4.88,
    reviewsCount: 2150,
    pros: ['Свободная регулировка угла наклона от 0 до 30 градусов', 'Массажные ролики в центре для стимуляции кровообращения', 'Прорезиненные ножки не скользят по ламинату и плитке'],
    cons: ['Пластиковый корпус (не вставать полным весом)'],
    specs: {
      'Угол наклона': '0°–30° (плавающий механизм качания)',
      'Размер платформы': '45 x 34 см',
      'Материал': 'Ударопрочный ABS-пластик с резиновыми вставками'
    },
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=подставка+для+ног+ортопедическая+офисная',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=подставка+для+ног+ортопедическая+офисная',
    ozonUrl: 'https://www.ozon.ru/search/?text=подставка+для+ног+офисная+массажная&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=подставка+для+ног+офисная',
    erid: '2VtzquvFR89',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'laptop-stand-aluminum-folding',
    name: 'Алюминиевая складная подставка для ноутбука Ugreen / Baseus',
    brand: 'Ugreen',
    category: 'accessory',
    shortDesc: 'Поднимает дисплей ноутбука на уровень глаз (6 углов) и складывается в узкий чехол',
    fullDesc: 'Разгружает шейный отдел позвоночника, устраняя привычку «смотреть вниз в экран ноутбука». 6 уровней высоты позволяют точно совместить экран с горизонтом зрения. Открытый алюминиевый каркас работает как пассивный радиатор, охлаждая ноутбук на 8–10 градусов.',
    priceRub: 1690,
    rating: 4.93,
    reviewsCount: 4120,
    pros: ['Литой анодированный алюминий с силиконовыми накладками', '6 ступеней регулировки угла (15°–45°)', 'Складывается в узкий брусок шириной 4 см (чехол в комплекте)', 'Выдерживает тяжелые ноутбуки до 17.3 дюймов'],
    cons: ['Для комфортной печати требует внешнюю клавиатуру'],
    specs: {
      'Материал': 'Алюминиевый сплав + антискользящий силикон',
      'Совместимость': 'Ноутбуки и планшеты от 10 до 17.3 дюймов',
      'Вес': '240 г'
    },
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=подставка+для+ноутбука+алюминиевая+складная',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=подставка+для+ноутбука+алюминиевая+складная',
    ozonUrl: 'https://www.ozon.ru/search/?text=подставка+для+ноутбука+алюминиевая+складная&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=подставка+для+ноутбука+алюминиевая',
    erid: '2VtzquvLS69',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'mouse-delux-vertical',
    name: 'Вертикальная беспроводная мышь Delux M618DB',
    brand: 'Delux',
    category: 'accessory',
    shortDesc: 'Естественный хват «рукопожатие» 57° — защита кисти от туннельного синдрома запястья',
    fullDesc: 'В отличие от плоских мышек, скручивающих кости предплечья, анатомический наклон 57 градусов держит руку в физиологически расслабленном положении. Бесшумные кнопки Silent Switch не раздражают домочадцев и коллег во время звонков.',
    priceRub: 1990,
    rating: 4.86,
    reviewsCount: 1650,
    pros: ['Эргономичный угол 57° снимает напряжение сухожилий кисти', 'Тихий клик (Silent micro-switches)', 'Двойное подключение: Bluetooth 5.0 + радиоканал 2.4G', 'Встроенный аккумулятор (зарядка по Type-C)'],
    cons: ['Первые 3–4 дня требуется привыкание к боковому хвату'],
    specs: {
      'DPI': '800 / 1200 / 1600 / 2400',
      'Интерфейс': 'Bluetooth 5.0 / 2.4 GHz USB / проводной Type-C',
      'Аккумулятор': '500 мАч (до 30 дней автономности)'
    },
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=вертикальная+мышь+Delux+M618DB',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=вертикальная+мышь+Delux+M618DB',
    ozonUrl: 'https://www.ozon.ru/search/?text=вертикальная+мышь+Delux+M618DB&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Delux+M618DB',
    erid: '2VtzquvVM19',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'mouse-logitech-mx-master-3s',
    name: 'Logitech MX Master 3S (Бесшумная, MagSpeed)',
    brand: 'Logitech',
    category: 'accessory',
    shortDesc: 'Флагманская мышь для профессионалов: бесшумные клики, колесо 1000 строк/сек и боковой скролл',
    fullDesc: 'Эталон эргономики для программистов, дизайнеров и аналитиков. Электромагнитное колесо MagSpeed прокручивает 1000 строк кода или таблицы за 1 секунду. Боковое колесико для горизонтального скролла в Excel и монтажных программах. Сенсор 8000 DPI работает даже на стеклянном столе.',
    priceRub: 10900,
    rating: 4.97,
    reviewsCount: 2980,
    pros: ['Сверхтихие клики Quiet Clicks (на 90% тише предшественника)', 'Электромагнитная прокрутка MagSpeed SmartShift', 'Сенсор Darkfield 8000 DPI работает на любой поверхности', 'Подключение к 3 устройствам с технологией Flow (копирование между Mac и Windows)'],
    cons: ['Рассчитана строго под правую руку', 'Вес 141 г (не для киберспорта)'],
    specs: {
      'Сенсор': 'Darkfield 8000 DPI (шаг 50 DPI)',
      'Колесо': 'MagSpeed электромагнитное',
      'Автономность': 'До 70 дней на одном заряде',
      'Зарядка': 'USB-C быстрая (1 минута дает 3 часа)'
    },
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Ситилинк',
    admitadUrl: 'https://market.yandex.ru/search?text=Logitech+MX+Master+3S+мышь',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=Logitech+MX+Master+3S+мышь',
    ozonUrl: 'https://www.ozon.ru/search/?text=Logitech+MX+Master+3S&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Logitech+MX+Master+3S',
    erid: '2VtzquvMX3S',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'headphones-anker-space-one',
    name: 'Anker Soundcore Space One (Активное шумоподавление ANC)',
    brand: 'Anker',
    category: 'audio',
    shortDesc: 'Беспроводные полноразмерные наушники с 2-кратным подавлением человеческого голоса',
    fullDesc: 'Спасение для работы в квартире с шумными детьми, домашними животными или соседями с перфоратором. Улучшенная система активного шумоподавления нацелена именно на средние частоты — голос и бытовой шум. Мягкие амбушюры с эффектом памяти не давят на дужки очков.',
    priceRub: 7490,
    rating: 4.89,
    reviewsCount: 1340,
    pros: ['Адаптивное активное шумоподавление (ANC)', 'До 55 часов работы (40 часов с включенным ANC)', 'Поддержка кодека высокой четкости LDAC', 'Режим прозрачности активируется прикосновением ладони'],
    cons: ['Микрофон в ветреную погоду на улице передает шумы (для дома идеален)'],
    specs: {
      'Тип': 'Полноразмерные закрытые',
      'Шумоподавление': 'Адаптивный гибридный ANC',
      'Автономность': '55 ч / 40 ч с ANC',
      'Связь': 'Bluetooth 5.3 + AUX 3.5 мм'
    },
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=Anker+Soundcore+Space+One',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=Anker+Soundcore+Space+One',
    ozonUrl: 'https://www.ozon.ru/search/?text=Anker+Soundcore+Space+One&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Anker+Space+One',
    erid: '2VtzquvAS01',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'webcam-anker-powerconf-c200',
    name: 'Веб-камера Anker PowerConf C200 2K (Физическая шторка)',
    brand: 'Anker',
    category: 'audio',
    shortDesc: '2K QHD веб-камера с физической шторкой приватности и направленными микрофонами с ИИ',
    fullDesc: 'Встроенные камеры большинства ноутбуков дают зернистую блеклую картинку 720p. Камера Anker C200 обеспечивает кристально четкое изображение 2K (2560x1440) даже при слабом освещении комнаты. Встроенная физическая механическая шторка гарантирует 100% приватность вне созвонов.',
    priceRub: 5890,
    rating: 4.91,
    reviewsCount: 820,
    pros: ['Четкое разрешение 2K QHD с естественной цветопередачей', 'Физическая сдвижная шторка объектива', 'Двойные стереомикрофоны с алгоритмом подавления эха', 'Регулируемый угол обзора: 65°, 78° или 95°'],
    cons: ['Нет автофокуса (фокус фиксированный, оптимизирован под дистанцию 40–120 см)'],
    specs: {
      'Разрешение': '2K (2560 x 1440) @ 30 fps',
      'Угол обзора': '65° / 78° / 95°',
      'Микрофоны': '2 направленных стерео с шумоподавлением',
      'Крепление': 'Универсальное на монитор + штативная резьба 1/4"'
    },
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=веб-камера+Anker+PowerConf+C200',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=веб-камера+Anker+PowerConf+C200',
    ozonUrl: 'https://www.ozon.ru/search/?text=Anker+PowerConf+C200&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=Anker+PowerConf+C200',
    erid: '2VtzquvAC20',
    ordAdvertiser: 'ООО «Яндекс», ИНН 7736207543'
  },
  {
    id: 'pomodoro-timer-cube',
    name: 'Физический Pomodoro-таймер TickTime Cube',
    brand: 'TickTime',
    category: 'accessory',
    shortDesc: 'Шестигранный гравитационный таймер для спринтов глубокой концентрации без отвлечения на смартфон',
    fullDesc: 'Главная проблема телефонных таймеров — каждый раз при взгляде на экран мозг цепляется за всплывшие уведомления. Гравитационный куб TickTime переворачивается нужной гранью (5, 10, 25, 50 минут) и моментально начинает отсчет. Бесшумный виброрежим и мягкая подсветка.',
    priceRub: 2890,
    rating: 4.93,
    reviewsCount: 420,
    pros: ['Мгновенный старт переворачиванием грани', 'Исключает контакт со смартфоном во время работы', 'Бесшумный виброрежим для тихих созвонов', 'Магнитный корпус крепится к ножке стола'],
    cons: ['Фиксированные пресеты минут на гранях'],
    specs: {
      'Пресеты': '3, 5, 10, 15, 25, 30 минут',
      'Оповещение': 'Звук / Вибрация / Светодиод',
      'Зарядка': 'USB-C (до 3 месяцев от одной зарядки)'
    },
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Ozon / Яндекс Маркет',
    admitadUrl: 'https://market.yandex.ru/search?text=TickTime+cube+таймер',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=TickTime+cube+таймер',
    ozonUrl: 'https://www.ozon.ru/search/?text=TickTime+cube&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=TickTime+cube',
    erid: '2VtzquvTC01',
    ordAdvertiser: 'ООО «Интернет Решения», ИНН 7704217370'
  },
  {
    id: 'acupressure-mat-pranamat',
    name: 'Игольчатый акупунктурный коврик для спины и шеи',
    brand: 'Bradex / Pranamat',
    category: 'accessory',
    shortDesc: 'Медицинский акупрессурный мат для вечернего снятия компрессии и мышечных спазмов поясницы',
    fullDesc: '15 минут лежания на игольчатом мате после 8-часового рабочего дня вызывают мощный прилив капиллярного кровообращения, выработку эндорфинов и полное расслабление глубоких паравертебральных мышц спины.',
    priceRub: 2390,
    rating: 4.88,
    reviewsCount: 1650,
    pros: ['Быстро снимает ощущение затекшей спины', 'Льняной гипоаллергенный чехол и кокосовая койра', 'Компактно сворачивается в рулон'],
    cons: ['Первые 2 минуты легкое покалывание до наступления приятного тепла'],
    specs: {
      'Размер': '72 x 42 см',
      'Наполнитель': 'Кокосовое волокно',
      'Элементы': 'Медицинский гипоаллергенный пластик HIPS'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    bestMerchant: 'Яндекс Маркет / Ozon',
    admitadUrl: 'https://market.yandex.ru/search?text=акупунктурный+коврик+для+спины',
    yandexMarketUrl: 'https://market.yandex.ru/search?text=акупунктурный+коврик+для+спины',
    ozonUrl: 'https://www.ozon.ru/search/?text=акупунктурный+коврик+для+спины&from_global=true',
    wbUrl: 'https://www.wildberries.ru/search?query=акупунктурный+коврик',
    erid: '2VtzquvAM02',
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
