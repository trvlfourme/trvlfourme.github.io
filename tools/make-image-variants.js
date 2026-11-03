// Варианты картинок для srcset: 320/640 px у иллюстраций и уменьшенный логотип.
// Нужен sharp (в проект не входит, ставится разово): npm i sharp --no-save
// Запуск: node tools/make-image-variants.js
const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('нужен sharp: npm i sharp --no-save (в корне репозитория)');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'images', 'editorial');
const JPEG = { quality: 76, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' };

(async () => {
  let made = 0;
  let skipped = 0;
  for (const name of fs.readdirSync(dir).filter((f) => /^[a-z0-9-]+\.jpg$/i.test(f))) {
    const src = path.join(dir, name);
    const base = name.replace(/\.jpg$/i, '');
    for (const w of [320, 640]) {
      const out = path.join(dir, `${base}-${w}.jpg`);
      if (fs.existsSync(out)) { skipped += 1; continue; }
      await sharp(src).resize({ width: w, withoutEnlargement: true }).jpeg(JPEG).toFile(out);
      made += 1;
    }
  }
  for (const w of [64, 128]) {
    const out = path.join(root, `logo-${w}.png`);
    if (fs.existsSync(out)) { skipped += 1; continue; }
    await sharp(path.join(root, 'logo.png')).resize({ width: w }).png({ compressionLevel: 9 }).toFile(out);
    made += 1;
  }
  console.log(`вариантов создано: ${made}, уже были: ${skipped}`);
})();
