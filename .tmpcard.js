const fs = require('fs');
const files = process.argv.slice(2);
const KEYS = ['Габариты', 'Размеры', 'Вес', 'Цена', 'цена', 'Wi-Fi', 'WiFi', 'Картридж', 'картридж', 'СНПЧ', 'Ресурс', 'ресурс', 'Технология печати', 'Скорость', 'Разрешение', 'Формат', 'Гарантия', 'Тип'];
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  // ld+json blocks
  const ld = [...s.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  console.log('\n===== ' + f + '  ldjson blocks: ' + ld.length);
  for (const b of ld) {
    try {
      const j = JSON.parse(b.replace(/&quot;/g, '"'));
      const flat = JSON.stringify(j);
      console.log('ld:', flat.slice(0, 300));
    } catch (e) { /* ignore */ }
  }
  // visible text
  let t = s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
  t = t.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');
  const lines = t.split('\n').map(x => x.trim()).filter(x => x.length > 1);
  const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    for (const k of KEYS) {
      if (lines[i].includes(k) && !seen.has(i)) {
        seen.add(i);
        console.log(lines[i].slice(0, 120), '||', lines.slice(i + 1, i + 3).join(' / ').slice(0, 120));
        break;
      }
    }
  }
}
