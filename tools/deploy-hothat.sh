#!/usr/bin/env bash
# Выкладка сайта на cPanel/hothat по SSH (T-090). Основной путь после переезда (T-073).
#
#   tools/deploy-hothat.sh          — собрать состав в _hothatcheck/stage, проверить, ничего не отправлять
#   tools/deploy-hothat.sh --push   — отправить rsync -az --delete в document root
#
# Переменные для --push:
#   HOTHAT_REMOTE  user@host:/home/<аккаунт>/kabinetdoma.ru/   — обязательно; путь должен
#                  заканчиваться на /kabinetdoma.ru/ иначе скрипт откажется: --delete снёс бы чужой сайт
#   HOTHAT_KEY     ключ SSH (по умолчанию .secrets/hothat_ed25519, если файла нет — обычный ssh)
#   HOTHAT_PORT    порт SSH (по умолчанию 22)
#
# Состав берётся только из tools/public-manifest.txt: docs/, tools/, app/, content/, *.md
# на сайт не попадают, а лишнее на сервере удаляется (--delete).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="$ROOT/_hothatcheck/stage"
PUSH=0
[ "${1:-}" = "--push" ] && PUSH=1

# Записи манифеста для нужного хостинга: общие + своя секция.
manifest_items() {
  awk -v h="$1" '
    /^#/ {
      if ($0 ~ /только cPanel/) sec = "cpanel"
      else if ($0 ~ /GitHub Pages/) sec = "pages"
      else if ($0 ~ /общие/) sec = "common"
      next
    }
    NF == 0 { next }
    sec == "common" || (sec == "cpanel" && h == "hothat") || (sec == "pages" && h == "pages") { print }
  ' "$ROOT/tools/public-manifest.txt"
}

echo "1/4  состав по манифесту"
ITEMS="$(manifest_items hothat)"
if [ -z "$ITEMS" ]; then
  echo "ОШИБКА: tools/public-manifest.txt пуст" >&2
  exit 1
fi

echo "2/4  собираю _hothatcheck/stage"
rm -rf "$STAGE"
mkdir -p "$STAGE"
shopt -s nullglob
for item in $ITEMS; do
  matches=( "$ROOT"/$item )
  if [ ${#matches[@]} -eq 0 ]; then
    echo "ОШИБКА: в манифесте есть $item, а в рабочей копии его нет" >&2
    exit 1
  fi
  for src in "${matches[@]}"; do
    cp -a "$src" "$STAGE/"
  done
done
shopt -u nullglob
# markdown-заметки и черновики внутрь публикуемых папок не уезжают никогда
find "$STAGE" -name '*.md' -type f -delete 2>/dev/null || true

echo "3/4  проверка состава"
for f in docs tools app content node_modules _prodcheck _prerender _hothatcheck .git \
         CNAME .nojekyll _redirects AGENTS.md README.md HANDOFF.md; do
  if [ -e "$STAGE/$f" ]; then
    echo "ОШИБКА: в публикации остался служебный путь $f" >&2
    exit 1
  fi
done
if [ -n "$(find "$STAGE" -name '*.md' -type f -print -quit)" ]; then
  echo "ОШИБКА: в публикации остались .md-файлы" >&2
  exit 1
fi
KD_HOSTING=hothat node "$ROOT/tools/verify-build.js" "$STAGE"

FILES="$(find "$STAGE" -type f | wc -l | tr -d ' ')"
SIZE="$(du -sh "$STAGE" | cut -f1 | tr -d ' ')"

echo "4/4  итог"
if [ "$PUSH" = "0" ]; then
  echo "проверено: файлов $FILES, объём $SIZE; ничего не отправлено"
  echo "чтобы выложить: HOTHAT_REMOTE=user@host:/home/<аккаунт>/kabinetdoma.ru/ tools/deploy-hothat.sh --push"
  exit 0
fi

: "${HOTHAT_REMOTE:?укажите HOTHAT_REMOTE=user@host:/home/<аккаунт>/kabinetdoma.ru/}"
case "$HOTHAT_REMOTE" in
  */kabinetdoma.ru/|*/kabinetdoma.ru) ;;
  *) echo "ОШИБКА: путь должен заканчиваться на /kabinetdoma.ru/ — иначе rsync --delete снесёт чужой сайт" >&2
     exit 1 ;;
esac

PORT="${HOTHAT_PORT:-22}"
SSH_CMD="ssh -p $PORT"
KEY="${HOTHAT_KEY:-$ROOT/.secrets/hothat_ed25519}"
if [ -f "$KEY" ]; then
  SSH_CMD="ssh -p $PORT -i $KEY"
else
  echo "     ключа $KEY нет — подключаюсь обычным ssh (спросит пароль)"
fi

rsync -az --delete -e "$SSH_CMD" "$STAGE/" "$HOTHAT_REMOTE"
echo "отправлено: файлов $FILES, объём $SIZE → $HOTHAT_REMOTE"
echo "проверка: curl -sI https://kabinetdoma.ru/ | head -1"
