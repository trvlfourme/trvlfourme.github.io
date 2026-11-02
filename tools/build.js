// Единая сборка сайта: пререндер → метаданные и разметка → редиректы → sitemap → проверка.
// Раньше шаги запускали вручную, и повторный prerender затирал работу seo-fix.js:
// описания снова обрезались с «…», а sitemap расходился с canonical.
// Запуск: node tools/build.js [--only=slug] [--skip-prerender]
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stage = path.join(root, '_prerender');
const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '';
const skipPrerender = args.includes('--skip-prerender');
const PORT = Number(process.env.PORT || 8099);

function step(name, file, extraEnv) {
  console.log(`\n=== ${name} ===`);
  const res = spawnSync(process.execPath, [path.join(__dirname, file)], {
    cwd: root,
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv || {}),
  });
  if (res.status !== 0) {
    console.error(`шаг провален: ${file}`);
    process.exit(res.status || 1);
  }
}

function waitForServer(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      http
        .get(url, (res) => {
          res.resume();
          if (res.statusCode && res.statusCode < 500) resolve();
          else retry(left);
        })
        .on('error', () => retry(left));
    };
    const retry = (left) => {
      if (left <= 0) reject(new Error(`сервер не поднялся: ${url}`));
      else setTimeout(() => attempt(left - 1), 500);
    };
    attempt(tries);
  });
}

function copyStaged(from, to) {
  let copied = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dst, { recursive: true });
      copied += copyStaged(src, dst);
    } else {
      fs.copyFileSync(src, dst);
      copied++;
    }
  }
  return copied;
}

(async () => {
  step('тексты статей', 'apply-articles.js');

  if (!skipPrerender) {
    console.log(`\n=== локальный сервер :${PORT} ===`);
    const server = spawn(process.execPath, [path.join(__dirname, 'server.js'), String(PORT)], {
      cwd: root,
      stdio: 'ignore',
    });
    try {
      await waitForServer(`http://127.0.0.1:${PORT}/`);
      step('пререндер', 'prerender.js', { PORT: String(PORT), ...(only ? { ONLY: only } : {}) });
      if (!only) {
        const copied = copyStaged(stage, root);
        console.log(`страниц перенесено в сайт: ${copied}`);
      } else {
        console.log('частичная сборка: файлы из _prerender в сайт не переносятся');
      }
    } finally {
      server.kill();
    }
  }

  step('метаданные и разметка', 'seo-fix.js');
  step('локальные картинки, размеры, lazy', 'optimize-html-images.js');
  step('редиректы', 'make-redirects.js');
  step('трекер целей', 'inject-tracker.js');
  step('sitemap', 'sitemap.js');
  step('проверка', 'verify-build.js');
  console.log('\nсборка завершена');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
