// Цели Яндекс.Метрики, которые нельзя получить URL-целями:
// — открытие страницы-инструмента (калькулятор, конструктор, тесты, чек-лист);
// — клик по партнёрской ссылке с rel="sponsored" или на маркетплейс.
// Цели с такими именами должны быть заведены в интерфейсе Метрики (тип «JavaScript-событие»).
// Скрипт ничего не блокирует и не меняет поведение ссылок: только отправляет событие.
(function () {
  var ID = 113423664;
  var TOOLS = { calculator: 1, builder: 1, tests: 1, checklist: 1 };

  function goal(name, params) {
    try {
      if (typeof window.ym === 'function') window.ym(ID, 'reachGoal', name, params || {});
    } catch (e) {
      /* счётчик не загрузился — молча пропускаем */
    }
  }

  function pageTool() {
    var m = location.pathname.match(/^\/(calculator|builder|tests|checklist)(\/|$)/);
    return m ? m[1] : '';
  }

  function partner(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var rel = a.getAttribute('rel') || '';
    var abs;
    try {
      abs = new URL(a.getAttribute('href'), location.href);
    } catch (err) {
      return;
    }
    if (abs.origin === location.origin) return;
    var marketplace = /(^|\.)(market\.yandex\.ru|wildberries\.ru|ozon\.ru|admitad\.com)$/.test(abs.hostname);
    if (!marketplace && !/\bsponsored\b/.test(rel)) return;
    goal('partner_click', { platform: abs.hostname, from: location.pathname });
  }

  document.addEventListener('click', partner, true);
  document.addEventListener('DOMContentLoaded', function () {
    var tool = pageTool();
    if (tool) goal('tool_view', { tool: tool });
  });
})();
