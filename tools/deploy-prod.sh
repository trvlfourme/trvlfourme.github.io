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

# Состав публикации. На сайт уезжают только страницы и их ресурсы: всё остальное
# (docs/, tools/, content/, *.md, исходники, архивы) остаётся в репозитории и на сайт не попадает.
# Новый раздел сайта или файл в корне — добавьте сюда, иначе он не выложится (prune скажет об этом).
PUBLIC="index.html 404.html CNAME .nojekyll robots.txt sitemap.xml _redirects \
article articles about builder calculator catalog checklist privacy terms tests \
assets data images \
favicon.svg favicon-32.png apple-touch-icon.png logo.png logo-64.png logo-128.png og-image.jpg"

is_public() {
  local name="$1"
  case "$name" in
    google*.html|yandex*.html) return 0 ;;
  esac
  local item
  for item in $PUBLIC; do
    [ "$name" = "$item" ] && return 0
  done
  return 1
}

echo "3/5  оставляю только публикуемый состав"
DROPPED=""
while IFS= read -r entry; do
  name="$(basename "$entry")"
  if ! is_public "$name"; then
    DROPPED="$DROPPED $name"
    rm -rf "$entry"
  fi
done < <(find "$WORK" -mindepth 1 -maxdepth 1 ! -name .git | sort)
if [ -n "$DROPPED" ]; then
  echo "     не публикую:$DROPPED"
fi
# Внутри публикуемых каталогов не должно остаться markdown-заметок и черновиков.
find "$WORK" -name '*.md' -type f -delete 2>/dev/null || true

# Файлы, которые мы удалили у себя, но которые остались на проде: иначе шаг «сохранить
# файлы только прода» будет тащить их вечно. Verification-файлы поисковиков сюда не пишем.
for f in ${PROD_DELETE:-og-image.png assets/kd-admin-loader.js assets/kd-admin-catalog.js assets/kd-admin-links.js}; do
  if [ -e "$WORK/$f" ] && ! git -C "$ROOT" ls-tree -r main --name-only | grep -qx "$f"; then
    echo "     удаляю с прода: $f"
    rm -f "$WORK/$f"
  fi
done

echo "4/5  проверяю то, что уедет на прод"
for f in docs tools content AGENTS.md README.md HANDOFF.md PROMO-PLAN.md DEV-CHANGES.md \
         index.spa.html archive-info.json CNAME.md; do
  if [ -e "$WORK/$f" ]; then
    echo "ОШИБКА: в публикации остался служебный путь $f" >&2
    exit 1
  fi
done
if [ -n "$(find "$WORK" -name '*.md' -type f -print -quit)" ]; then
  echo "ОШИБКА: в публикации остались .md-файлы" >&2
  exit 1
fi
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
