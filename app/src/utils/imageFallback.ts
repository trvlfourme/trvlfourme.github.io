// Realistic editorial AI-generated photographs (100% copyright-free, stored locally)
export const EDITORIAL_PHOTOS = [
  {
    id: 'work-life-balance',
    label: 'Баланс работы и жизни (вечер, закрытие ноутбука, чашка чая)',
    url: '/images/editorial/work-life-balance.jpg',
    category: 'balance',
    keywords: ['баланс', 'выгорание', 'отдых', 'вечер', 'стресс', 'психология', 'сон', 'жизнь', 'work-life']
  },
  {
    id: 'realistic-workspace-scandinavian',
    label: 'Скандинавский светлый домашний офис с живыми растениями',
    url: '/images/editorial/realistic-workspace-scandinavian.jpg',
    category: 'organization',
    keywords: ['скандинавский', 'рабочее место', 'домашний офис', 'уют', 'ноутбук', 'порядок', 'кабинет']
  },
  {
    id: 'standing-desk-health',
    label: 'Здоровая работа стоя за подъемным столом',
    url: '/images/editorial/standing-desk-health.jpg',
    category: 'furniture',
    keywords: ['стоя', 'подъемный', 'электропривод', 'осанка', 'динамика', 'здоровье', 'ergostol']
  },
  {
    id: 'headphones-focus',
    label: 'Глубокая концентрация в наушниках с шумоподавлением',
    url: '/images/editorial/headphones-focus.jpg',
    category: 'lighting-sound',
    keywords: ['фокус', 'концентрация', 'наушники', 'шумоподавление', 'anc', 'тишина', 'звук']
  },
  {
    id: 'compact-apartment-nook',
    label: 'Эргономичный рабочий уголок в компактной квартире-студии',
    url: '/images/editorial/compact-apartment-nook.jpg',
    category: 'organization',
    keywords: ['компактный', 'однушка', 'студия', 'малогабаритная', 'уголок', 'зонирование', 'полки']
  },
  {
    id: 'home-office-cozy',
    label: 'Уютный скандинавский домашний офис',
    url: '/images/editorial/home-office-cozy.jpg',
    category: 'furniture',
    keywords: ['стол', 'кресло', 'кабинет', 'подъемный', 'окно', 'комната']
  },
  {
    id: 'remote-travel-work',
    label: 'Удаленка в поездке и на террасе',
    url: '/images/editorial/remote-travel-work.jpg',
    category: 'other',
    keywords: ['поездка', 'путешествие', 'отпуск', 'дорога', 'ноутбук', 'номад', 'самолет', 'командировка']
  },
  {
    id: 'family-remote-work',
    label: 'Удаленная работа дома с ребенком',
    url: '/images/editorial/family-remote-work.jpg',
    category: 'with-kids',
    keywords: ['дети', 'ребенок', 'семья', 'однушка', 'зонирование', 'тишина']
  },
  {
    id: 'ergonomic-chair-desk',
    label: 'Эргономичное кресло и монитор на кронштейне',
    url: '/images/editorial/ergonomic-chair-desk.jpg',
    category: 'ergonomics',
    keywords: ['кресло', 'эргономика', 'спина', 'осанка', 'кронштейн', 'газлифт']
  },
  {
    id: 'budget-clean-desk',
    label: 'Аккуратный бюджетный уголок с ноутбуком',
    url: '/images/editorial/budget-clean-desk.jpg',
    category: 'organization',
    keywords: ['бюджет', 'с нуля', 'подставка', 'эконом', 'порядок', 'лайфхак']
  },
  {
    id: 'screenbar-evening-light',
    label: 'Вечернее рабочее место с мягким светом скринбара',
    url: '/images/editorial/screenbar-evening-light.jpg',
    category: 'lighting-sound',
    keywords: ['свет', 'скринбар', 'лампа', 'вечер', 'глаза', 'освещение']
  },
  {
    id: 'audio-podcasting-desk',
    label: 'Микрофон на пантографе и студийные наушники',
    url: '/images/editorial/audio-podcasting-desk.jpg',
    category: 'lighting-sound',
    keywords: ['микрофон', 'звук', 'наушники', 'созвон', 'шумоподавление', 'акустика']
  }
];

// Local resilient vector SVG diagrams (for technical schemes and fallbacks)
export const LOCAL_FALLBACKS = {
  hero: '/images/editorial/realistic-workspace-scandinavian.jpg',
  room: '/images/room-planning.svg',
  chair: '/images/editorial/ergonomic-chair-desk.jpg',
  desk: '/images/editorial/standing-desk-health.jpg',
  balance: '/images/editorial/work-life-balance.jpg',
  focus: '/images/editorial/headphones-focus.jpg',
  light: '/images/editorial/screenbar-evening-light.jpg',
  kids: '/images/editorial/family-remote-work.jpg',
  budget: '/images/editorial/budget-clean-desk.jpg',
  travel: '/images/editorial/remote-travel-work.jpg',
  audio: '/images/editorial/audio-podcasting-desk.jpg',
  cable: '/images/cable-management.svg',
  monitor: '/images/monitor-arms.svg',
  acoustic: '/images/acoustic-panels.svg',
  footrest: '/images/footrest-ergonomics.svg',
};

export const FALLBACK_IMAGE_DATA_URI = `/images/editorial/realistic-workspace-scandinavian.jpg`;

export const getCategoryFallbackImage = (category?: string, title?: string): string => {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // 1. Work-Life Balance & Psychology (HIGHEST PRIORITY: Never classify as travel!)
  if (
    c === 'balance' ||
    t.includes('баланс') ||
    t.includes('выгоран') ||
    t.includes('отдых') ||
    t.includes('стресс') ||
    t.includes('психолог') ||
    t.includes('личн') ||
    t.includes('границ') ||
    t.includes('сон') ||
    t.includes('work-life') ||
    t.includes('устал')
  ) {
    return '/images/editorial/work-life-balance.jpg';
  }

  // 2. Travel / Trips (ONLY IF EXPLICIT TRAVEL KEYWORDS IN TITLE OR CATEGORY)
  if (
    c === 'travel' ||
    t.includes('поездк') ||
    t.includes('путешеств') ||
    t.includes('отпуск') ||
    t.includes('дорог') ||
    t.includes('командировк') ||
    t.includes('номад') ||
    t.includes('самолет') ||
    t.includes('отел')
  ) {
    return '/images/editorial/remote-travel-work.jpg';
  }

  // 3. Kids / Family
  if (c === 'with-kids' || t.includes('дет') || t.includes('светофор') || t.includes('семь') || t.includes('малыш')) {
    return '/images/editorial/family-remote-work.jpg';
  }

  // 4. Focus, Noise & Headphones
  if (t.includes('фокус') || t.includes('шум') || t.includes('наушник') || t.includes('концентрац') || t.includes('тишин')) {
    return '/images/editorial/headphones-focus.jpg';
  }

  // 5. Standing Desks & Sit-Stand Dynamics
  if (t.includes('стоя') || t.includes('подъемн') || t.includes('электростол') || t.includes('ergostol') || t.includes('динамик')) {
    return '/images/editorial/standing-desk-health.jpg';
  }

  // 6. Audio & Microphones
  if (t.includes('микрофон') || t.includes('гарнитур') || t.includes('созвон') || t.includes('звук') || t.includes('enc') || t.includes('подкаст')) {
    return '/images/editorial/audio-podcasting-desk.jpg';
  }

  // 7. Lighting & Screenbars
  if (t.includes('свет') || t.includes('скринбар') || t.includes('ламп') || t.includes('вечер') || c === 'lighting-sound') {
    return '/images/editorial/screenbar-evening-light.jpg';
  }

  // 8. Compact studio apartments & Small rooms
  if (t.includes('малогабарит') || t.includes('студи') || t.includes('однушк') || t.includes('уголок') || t.includes('зонирован')) {
    return '/images/editorial/compact-apartment-nook.jpg';
  }

  // 9. Budget Workspace
  if (t.includes('бюджет') || t.includes('нуля') || t.includes('лайфхак') || t.includes('эконом') || t.includes('15 000')) {
    return '/images/editorial/budget-clean-desk.jpg';
  }

  // 10. Chairs & Posture
  if (t.includes('кресл') || t.includes('спин') || t.includes('поясниц') || t.includes('осанк') || c === 'ergonomics') {
    return '/images/editorial/ergonomic-chair-desk.jpg';
  }

  // 11. General Furniture
  if (t.includes('стол') || c === 'furniture') {
    return '/images/editorial/home-office-cozy.jpg';
  }

  return '/images/editorial/realistic-workspace-scandinavian.jpg';
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  const alt = target.alt || '';
  const fallback = getCategoryFallbackImage(undefined, alt);
  if (!target.src.endsWith(fallback.replace(/^\.\//, ''))) {
    target.src = fallback;
  }
};

