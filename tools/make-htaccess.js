// .htaccess для cPanel (T-090): 301 из _redirects плюс служебный блок.
// Запуск: node tools/make-htaccess.js          — записать .htaccess
//         node tools/make-htaccess.js --check  — только сверить, ничего не писать
//
// На GitHub Pages файл инертен и не публикуется (секция «только cPanel»
// в tools/public-manifest.txt): там редиректы работают страницами-заглушками.
// Руками .htaccess не правят: источник правил — _redirects.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const target = path.join(root, '.htaccess');
const check = process.argv.includes('--check');
const problems = [];

// 1. Правила из _redirects: строки вида "<откуда> <куда> 301", комментарии с #.
const rules = [];
for (const raw of fs.readFileSync(path.join(root, '_redirects'), 'utf8').split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const m = line.match(/^(\/\S*)\s+(\/\S*)\s+(\d{3})$/);
  if (!m) {
    problems.push(`_redirects: не разобрать строку «${line}»`);
    continue;
  }
  const from = m[1];
  const to = m[2];
  if (m[3] !== '301') problems.push(`_redirects: ${from} — код ${m[3]}, на cPanel переносим только 301`);
  if (rules.some((r) => r.from === from)) problems.push(`_redirects: ${from} указан дважды`);
  if (rules.some((r) => r.from === to)) problems.push(`_redirects: ${to} — цель одного правила и источник другого (цепочка редиректов)`);
  const rel = to.replace(/^\//, '');
  const file = rel === '' ? 'index.html' : rel.endsWith('/') ? `${rel}index.html` : rel;
  if (!fs.existsSync(path.join(root, file))) problems.push(`_redirects: ${from} → ${to} — цели нет на диске (${file})`);
  rules.push({ from, to });
}

// Путь из _redirects → шаблон RewriteRule: в .htaccess ведущий слэш уже срезан,
// хвостовой слэш необязателен — так одно правило ловит и «/article/slug», и «/article/slug/».
function pattern(from) {
  return from.replace(/^\/|\/$/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 2. Служебный блок. Порядок важен: сначала www → apex (он же закрывает http для www одним
// 301), потом http → https для основного имени — так не бывает цепочки из двух редиректов.
const out = [
  '# Сгенерировано tools/make-htaccess.js из _redirects. Руками не править:',
  '# правьте _redirects и запускайте node tools/make-htaccess.js (T-090).',
  '#',
  '# cPanel/Apache: реальные 301 вместо страниц-заглушек, один редирект на https,',
  '# www → apex с сохранением пути, кэш, заголовки безопасности, gzip.',
  '# Требует AllowOverride FileInfo (обычно включён на shared-хостинге).',
  '',
  'Options -Indexes',
  'DirectoryIndex index.html',
  'AddDefaultCharset UTF-8',
  'ErrorDocument 404 /404.html',
  '',
  '<IfModule mod_rewrite.c>',
  '  RewriteEngine On',
  '',
  '  # www → apex: один 301 сразу на https, без промежуточного https://www',
  '  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]',
  '  RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]',
  '',
  '  # http → https для основного имени',
  '  RewriteCond %{HTTPS} !=on',
  '  RewriteCond %{HTTP:X-Forwarded-Proto} !https',
  '  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]',
  '',
  `  # Старые адреса статей: ${rules.length} правил из _redirects.`,
  '  # Через mod_rewrite, а не Redirect 301: на hothat (LiteSpeed) блок mod_alias',
  '  # отрабатывает не на всех воркерах, и часть старых адресов отдавала',
  '  # страницу-заглушку с кодом 200 вместо 301 (T-157).',
];
for (const r of rules) out.push(`  RewriteRule ^${pattern(r.from)}/?$ ${r.to} [R=301,L]`);
out.push(
  '</IfModule>',
  '',
  '# Сжатие: на cPanel без него страницы уезжают в сеть как есть.',
  '<IfModule mod_deflate.c>',
  '  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/xml',
  '  AddOutputFilterByType DEFLATE application/javascript application/json image/svg+xml',
  '</IfModule>',
  '',
  '# Кэш. Имена файлов не хешируются, поэтому у assets короткий срок, а не год:',
  '# иначе после выкладки браузер держит старый бандл.',
  '<IfModule mod_expires.c>',
  '  ExpiresActive On',
  '  ExpiresByType text/html "access plus 0 seconds"',
  '  ExpiresByType application/xml "access plus 1 hours"',
  '  ExpiresByType text/plain "access plus 1 hours"',
  '  ExpiresByType text/css "access plus 1 hours"',
  '  ExpiresByType application/javascript "access plus 1 hours"',
  '  ExpiresByType image/jpeg "access plus 7 days"',
  '  ExpiresByType image/png "access plus 7 days"',
  '  ExpiresByType image/svg+xml "access plus 7 days"',
  '  ExpiresByType image/webp "access plus 7 days"',
  '</IfModule>',
  '',
  '# Заголовки, которые на GitHub Pages задавались только meta-тегами.',
  '<IfModule mod_headers.c>',
  '  Header always set X-Content-Type-Options "nosniff"',
  '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
  '  Header always set X-Frame-Options "SAMEORIGIN"',
  '</IfModule>',
  '',
  '# HSTS — только через сутки нормальной работы, раскомментировать строку ниже',
  '# (docs/migration-hothat.md, шаг 4). Раньше нельзя: ошибка с сертификатом',
  '# запомнится браузером на год.',
  '# Header always set Strict-Transport-Security "max-age=31536000"',
  ''
);
const text = out.join('\n');

// 3. Запись или сверка.
if (check) {
  if (!fs.existsSync(target)) {
    problems.push('нет .htaccess — запустите node tools/make-htaccess.js');
  } else if (fs.readFileSync(target, 'utf8') !== text) {
    problems.push('.htaccess расходится с _redirects — запустите node tools/make-htaccess.js');
  }
} else {
  fs.writeFileSync(target, text, 'utf8');
}

for (const p of problems) console.log('  ✗ ' + p);
if (problems.length) process.exit(1);
console.log(
  check
    ? `проверено: .htaccess соответствует _redirects, правил ${rules.length}, служебный блок на месте`
    : `правил: ${rules.length}; .htaccess обновлён`
);
