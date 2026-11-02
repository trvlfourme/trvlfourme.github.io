// Замена внешних фото товаров в бандле на локальные иллюстрации.
// Бандл не пересобирается, поэтому правим только строки путей.
// Запуск: node tools/fix-bundle-images.js [--check]
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'assets', 'index.js');
const check = process.argv.includes('--check');
const IMG = {
  'ergostol-terra': '/images/standing-desk.svg',
  'sihoo-doro-c300': '/images/ergonomic-chair.svg',
  'xiaomi-lightbar': '/images/screenbar-light.svg',
  'benq-screenbar-halo': '/images/screenbar-light.svg',
  'jabra-evolve2-65': '/images/audio-microphones.svg',
  'fifine-k688': '/images/audio-microphones.svg',
  'onkron-g80': '/images/monitor-arms.svg',
  'cable-management-kit': '/images/cable-management.svg',
  'ugreen-gan-100w': '/images/workspace-hero.svg',
  'baseus-blade-powerbank': '/images/remote-travel.svg',
  'moft-laptop-stand': '/images/workspace-hero.svg',
  'travel-adapter-universal': '/images/remote-travel.svg',
  'chair-chairman-795': '/images/ergonomic-chair.svg',
  'desk-loft-wood-budget': '/images/budget-setup.svg',
  'desk-loctek-et114': '/images/standing-desk.svg',
  'lumbar-cushion-memory': '/images/ergonomic-chair.svg',
  'ergonomic-footrest-adjustable': '/images/footrest-ergonomics.svg',
  'laptop-stand-aluminum-folding': '/images/workspace-hero.svg',
  'mouse-delux-vertical': '/images/workspace-hero.svg',
  'mouse-logitech-mx-master-3s': '/images/workspace-hero.svg',
  'headphones-anker-space-one': '/images/audio-microphones.svg',
  'webcam-anker-powerconf-c200': '/images/audio-microphones.svg',
  'pomodoro-timer-cube': '/images/workspace-hero.svg',
  'acupressure-mat-pranamat': '/images/ergonomic-chair.svg',
};
const AVATAR = '/logo.png';
const AVATAR_SRC = 'https://images.unsplash.com/photo-1497366216548-37526070297c';

let src = fs.readFileSync(file, 'utf8');
const before = src;
let replaced = 0;

src = src.split(AVATAR_SRC).join(AVATAR);

// Идём по объектам офферов: последний {id:`...`} перед imageUrl определяет товар.
src = src.replace(/imageUrl:`https:\/\/images\.unsplash\.com\/photo-[0-9a-f-]+[^`]*`/g, (tag, offset, all) => {
  const before = all.slice(0, offset);
  const ids = [...before.matchAll(/\{id:`([a-z0-9-]+)`,name:`/g)];
  const id = ids.length ? ids[ids.length - 1][1] : '';
  const local = IMG[id];
  if (!local) {
    console.log('нет соответствия для оффера: ' + id);
    return tag;
  }
  replaced++;
  return 'imageUrl:`' + local + '`';
});

const left = (src.match(/images\.unsplash\.com/g) || []).length;
console.log(`фото товаров заменено: ${replaced}, осталось вхождений unsplash: ${left}`);
if (left > 0) {
  for (const m of src.matchAll(/https:\/\/images\.unsplash\.com\/photo-[0-9a-f-]+/g)) console.log('  осталось: ' + m[0]);
}
if (!check && src !== before) fs.writeFileSync(file, src, 'utf8');
