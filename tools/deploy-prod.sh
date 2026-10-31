#!/usr/bin/env bash
# Выкладка текущей ветки main на прод (репозиторий mail4startups-creator/home4work).
#
#   tools/deploy-prod.sh          — подготовить и проверить, ничего не отправляя
#   tools/deploy-prod.sh --push   — подготовить, проверить и отправить на прод
#
# Скрипт не перезаписывает историю прода: он добавляет один обычный коммит поверх
# прод-ветки. Файлы, которые есть на проде и которых нет у нас (например,
# подтверждение Google Search Console), сохраняются автоматически.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROD_REPO="${PROD_REPO:-https://github.com/mail4startups-creator/home4work.git}"
PROD_BRANCH="${PROD_BRANCH:-main}"
WORK="$ROOT/_prodcheck/prod-clone"
PUSH=0
[ "${1:-}" = "--push" ] && PUSH=1

echo "1/5  забираю прод-репозиторий"
if [ -d "$WORK/.git" ]; then
  git -C "$WORK" fetch -q origin "$PROD_BRANCH"
  git -C "$WORK" checkout -q -B "$PROD_BRANCH" "origin/$PROD_BRANCH"
  git -C "$WORK" reset -q --hard "origin/$PROD_BRANCH"
else
  rm -rf "$WORK"
  git clone -q --branch "$PROD_BRANCH" "$PROD_REPO" "$WORK"
fi

# в свежем клоне нет подписи коммита — берём ту же, что в рабочем репозитории
if [ -z "$(git -C "$WORK" config user.email)" ]; then
  git -C "$WORK" config user.email "$(git -C "$ROOT" config user.email || echo dev@kabinetdoma.ru)"
  git -C "$WORK" config user.name "$(git -C "$ROOT" config user.name || echo kabinetdoma)"
fi

echo "2/5  запоминаю файлы, которые есть только на проде"
git -C "$WORK" ls-files | sort > "$ROOT/_prodcheck/prod-files.txt"
git -C "$ROOT" ls-tree -r main --name-only | sort > "$ROOT/_prodcheck/main-files.txt"
PROD_ONLY="$(comm -23 "$ROOT/_prodcheck/prod-files.txt" "$ROOT/_prodcheck/main-files.txt" || true)"
rm -rf "$ROOT/_prodcheck/keep"
if [ -n "$PROD_ONLY" ]; then
  echo "     сохраняю: $(echo "$PROD_ONLY" | tr '\n' ' ')"
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    mkdir -p "$ROOT/_prodcheck/keep/$(dirname "$f")"
    cp "$WORK/$f" "$ROOT/_prodcheck/keep/$f"
  done <<< "$PROD_ONLY"
fi

echo "3/5  заменяю дерево файлов на ветку main"
find "$WORK" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
git -C "$ROOT" archive main | tar -x -C "$WORK"
if [ -d "$ROOT/_prodcheck/keep" ]; then
  cp -r "$ROOT/_prodcheck/keep/." "$WORK/"
fi

echo "4/5  проверяю то, что уедет на прод"
node "$ROOT/tools/verify-build.js" "$WORK"

echo "5/5  итог"
git -C "$WORK" add -A
git -C "$WORK" status --short | head -20
CHANGED="$(git -C "$WORK" status --short | wc -l | tr -d ' ')"
if [ "$CHANGED" = "0" ]; then
  echo "изменений нет — прод уже совпадает с main"
  exit 0
fi

if [ "$PUSH" = "0" ]; then
  echo
  echo "проверка пройдена, изменено файлов: $CHANGED"
  echo "ничего не отправлено. Чтобы выложить: tools/deploy-prod.sh --push"
  exit 0
fi

git -C "$WORK" commit -q -F - <<'MSG'
Обновление сайта: статическая сборка, 26 страниц, meta-тег Mitgo/Admitad

Пререндеренные статьи и разделы вместо SPA-шелла, слой ссылок на товары,
подтверждение площадки Mitgo и редиректы со старых адресов статей.
MSG
git -C "$WORK" push -q origin "$PROD_BRANCH"
echo "отправлено: $(git -C "$WORK" log --oneline -1)"
echo "GitHub Pages собирает сайт 1–3 минуты, домен: https://kabinetdoma.ru"
