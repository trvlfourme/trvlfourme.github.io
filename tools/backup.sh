#!/usr/bin/env bash
# Бэкап сайта: архив рабочей ветки + проверка, что из него всё восстанавливается.
#
#   tools/backup.sh            — сделать архив и проверить восстановление
#   tools/backup.sh --check    — только проверить последний архив, не создавая новый
#
# Архив кладётся в .backup/ (папка в .gitignore, в git и на прод не попадает;
# рабочая копия синхронизируется в OneDrive, поэтому копий минимум две: GitHub и диск).
# В архив попадает только то, что в git: страницы, data/, tools/, docs/, app/ без
# node_modules и dist. Проверка восстановления — распаковка в .backup/restore-<время>,
# `node --check assets/index.js` и сверка количества файлов с деревом ветки.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${BRANCH:-main}"
DIR="$ROOT/.backup"
STAMP="$(date +%Y-%m-%d-%H%M)"
CHECK_ONLY=0
[ "${1:-}" = "--check" ] && CHECK_ONLY=1

mkdir -p "$DIR"

if [ "$CHECK_ONLY" -eq 1 ]; then
  ZIP="$(ls -1t "$DIR"/kabinetdoma-*.zip 2>/dev/null | head -1 || true)"
  if [ -z "$ZIP" ]; then
    echo "нет ни одного архива в .backup/ — сначала запустите tools/backup.sh" >&2
    exit 1
  fi
  echo "проверяю последний архив: $(basename "$ZIP")"
else
  ZIP="$DIR/kabinetdoma-$STAMP.zip"
  echo "1/3  архивирую ветку $BRANCH → .backup/$(basename "$ZIP")"
  git -C "$ROOT" archive --format=zip --prefix="kabinetdoma/" -o "$ZIP" "$BRANCH"
  echo "     размер: $(du -h "$ZIP" | cut -f1)"
fi

STAGE="$DIR/restore-$STAMP"
rm -rf "$STAGE"
mkdir -p "$STAGE"

echo "2/3  распаковываю в чистую папку"
unzip -q "$ZIP" -d "$STAGE"
RESTORED="$STAGE/kabinetdoma"

EXPECTED="$(git -C "$ROOT" ls-tree -r "$BRANCH" --name-only | wc -l | tr -d ' ')"
ACTUAL="$(find "$RESTORED" -type f | wc -l | tr -d ' ')"
echo "     файлов в ветке: $EXPECTED, распаковано: $ACTUAL"
if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "ОШИБКА: в архиве $ACTUAL файлов вместо $EXPECTED" >&2
  exit 1
fi

echo "3/3  проверяю восстановленную копию"
node --check "$RESTORED/assets/index.js"
node "$RESTORED/tools/apply-articles.js" --check
for f in index.html articles/index.html sitemap.xml robots.txt 404.html _redirects data/catalog.js app/package.json; do
  [ -f "$RESTORED/$f" ] || { echo "ОШИБКА: в архиве нет $f" >&2; exit 1; }
done
echo "     ключевые файлы на месте: index.html, хаб, sitemap, robots, 404, редиректы, каталог, app/"

rm -rf "$STAGE"
echo "готово: бэкап $(basename "$ZIP") проверен восстановлением на чистой папке"
