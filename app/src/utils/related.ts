import { Article } from '../types';

// Соседние статьи для блока «Читайте также» выбираются только по данным, без ручных
// списков (T-195): статьи идут кольцом, сгруппированные по категориям (внутри группы —
// порядок из data/articles), и каждая ссылается на три следующие. Так у каждой статьи
// ровно три входящие ссылки от соседей, и периферийных страниц не остаётся (T-196).
export function buildRelatedMap(all: Article[], limit = 3): Map<string, Article[]> {
  const byCategory = new Map<string, Article[]>();
  for (const a of all) {
    const group = byCategory.get(a.category);
    if (group) group.push(a);
    else byCategory.set(a.category, [a]);
  }
  const ring = [...byCategory.values()].flat();
  const n = ring.length;
  const result = new Map<string, Article[]>();

  ring.forEach((a, i) => {
    const neighbours: Article[] = [];
    for (let k = 1; k <= Math.min(limit, n - 1); k++) {
      neighbours.push(ring[(i + k) % n]);
    }
    result.set(a.id, neighbours);
  });

  return result;
}
