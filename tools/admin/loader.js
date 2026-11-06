// Загружает админские скрипты только тому, кому они нужны.
// Раньше kd-admin-catalog.js (13,6 КБ gzip) и kd-admin-links.js (3,8 КБ gzip)
// подключались на каждой странице обычными тегами: два лишних запроса и вес
// у всех посетителей. Теперь теги одни, а сами скрипты приходят:
//   — сразу, если адрес содержит ?admin=1 или сессия админа уже открыта;
//   — по Ctrl+Shift+A, как и раньше.
// Скрипты сами дожидаются DOM (проверяют readyState), поэтому поздняя загрузка безопасна.
(function () {
  var FILES = ['/assets/kd-admin-catalog.js', '/assets/kd-admin-links.js'];
  var started = false;

  function load() {
    if (started) return;
    started = true;
    for (var i = 0; i < FILES.length; i++) {
      var s = document.createElement('script');
      s.src = FILES[i];
      s.defer = true;
      document.head.appendChild(s);
    }
  }

  function wanted() {
    if (/[?&]admin=1(?:&|$)/.test(location.search)) return true;
    try {
      if (sessionStorage.getItem('kd_admin_auth') === 'true') return true;
    } catch (e) {
      /* приватный режим — просто не грузим заранее */
    }
    return false;
  }

  document.addEventListener(
    'keydown',
    function (e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) load();
    },
    true
  );

  if (wanted()) load();
})();
