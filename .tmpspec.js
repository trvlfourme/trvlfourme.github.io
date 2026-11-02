const fs = require('fs');
const raw = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [...raw.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
for (const b of blocks) {
  try {
    const j = JSON.parse(b.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    if (j['@type'] === 'Product') {
      console.log('NAME:', j.name);
      console.log('BRAND:', j.brand);
      console.log('OFFERS:', JSON.stringify(j.offers).slice(0, 400));
      console.log('AGG:', JSON.stringify(j.aggregateRating || {}).slice(0, 160));
      console.log('DESC:', (j.description || '').slice(0, 260));
    }
  } catch (e) { console.log('ld fail', e.message); }
}
const un = raw.split('\\"').join('"');
const re = /"name":"([^"]{1,80})","value":"([^"]{1,400})"/g;
let m, seen = new Set();
while ((m = re.exec(un))) {
  const k = m[1] + ' = ' + m[2];
  if (!seen.has(k)) { seen.add(k); console.log(k); }
}
