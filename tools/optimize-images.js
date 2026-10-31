// Пережатие иллюстраций на месте: имена файлов не меняются, ссылки в бандле остаются валидными.
// Оригиналы складываются в tools/_originals для отката.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'images', 'editorial');
const backup = path.join(__dirname, '_originals');
fs.mkdirSync(backup, { recursive: true });

function keep(name) {
  const src = path.join(root, name);
  const bkp = path.join(backup, path.basename(name));
  if (!fs.existsSync(bkp)) fs.copyFileSync(src, bkp);
  return bkp;
}

(async () => {
  let before = 0;
  let after = 0;
  for (const name of fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f))) {
    const file = path.join(dir, name);
    const size = fs.statSync(file).size;
    before += size;
    const bkp = keep(path.join('images', 'editorial', name));
    const meta = await sharp(bkp).metadata();
    const buf = await sharp(bkp)
      .resize({ width: Math.min(meta.width || 1400, 1400), withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' })
      .toBuffer();
    if (buf.length < size) fs.writeFileSync(file, buf);
    const now = fs.statSync(file).size;
    after += now;
    console.log(
      `${name}  ${meta.width}x${meta.height}  ${Math.round(size / 1024)}KB -> ${Math.round(now / 1024)}KB`
    );
  }

  const logoBkp = keep('logo.png');
  const logoStat = fs.statSync(path.join(root, 'logo.png')).size;
  const logoBuf = await sharp(logoBkp)
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  fs.writeFileSync(path.join(root, 'logo.png'), logoBuf);
  console.log(`logo.png  ${Math.round(logoStat / 1024)}KB -> ${Math.round(logoBuf.length / 1024)}KB`);

  console.log(
    `\nиллюстрации: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB ` +
      `(экономия ${Math.round((1 - after / before) * 100)}%)`
  );
})();
