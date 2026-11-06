// Локальный запуск редакторской панели. На сайте этот файл не подключается:
// публичная сборка ссылок на админку не содержит (см. tools/admin/README.md).
//
// Как пользоваться: открыть локальную копию сайта (`node tools/server.js`, адрес из лога),
// затем в консоли браузера выполнить одну строку:
//   var s=document.createElement('script');s.src='/tools/admin/loader.js';document.head.appendChild(s);
// После этого админка работает как раньше: Ctrl+Shift+A открывает панель.
(function () {
  var LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!LOOPBACK) {
    console.warn('Админка доступна только на локальной копии сайта: ' + location.hostname);
    return;
  }
  var FILES = ['/tools/admin/catalog.js', '/tools/admin/links.js'];
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

  document.addEventListener(
    'keydown',
    function (e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) load();
    },
    true
  );
  load();
})();
