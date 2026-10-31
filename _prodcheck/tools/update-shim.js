// Обновляет скрипт-шину маршрута во всех пререндеренных страницах статей.
// Восстановление чистого URL откладывается до события load, иначе приложение
// успевает прочитать адрес уже без параметра ?article= и показывает главную.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf8'));

const shim = (id) => `<script>
    (function () {
      var m = /^\\/article\\/[a-z0-9-]+\\/?$/.exec(location.pathname);
      if (!m) return;
      var pretty = location.pathname + location.hash;
      try { history.replaceState(null, '', '/?article=${id}'); } catch (e) {}
      function restore() {
        try { history.replaceState(null, '', pretty); } catch (e) {}
      }
      if (document.readyState === 'complete') setTimeout(restore, 80);
      else window.addEventListener('load', function () { setTimeout(restore, 80); });
    })();
    </script>`;

const pattern =
  /<script>\s*\(function \(\) \{[\s\S]*?replaceState\(null, '', '\/\?article=[^']*'\)[\s\S]*?<\/script>/;

let updated = 0;
for (const a of articles) {
  const file = path.join(root, 'article', a.slug, 'index.html');
  if (!fs.existsSync(file)) {
    console.log('нет файла: ' + a.slug);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (!pattern.test(html)) {
    console.log('шина не найдена: ' + a.slug);
    continue;
  }
  fs.writeFileSync(file, html.replace(pattern, shim(a.id)), 'utf8');
  updated++;
}
console.log(`обновлено: ${updated}/${articles.length}`);
