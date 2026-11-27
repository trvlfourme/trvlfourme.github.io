import { Article } from '../types';

// Соседние статьи для блока «Читайте также» выбираются только по данным, без ручных
// списков (T-195): сначала та же категория, затем пересечение тем, при равенстве —
// у кого меньше входящих, затем порядок статей в data/articles. После выбора ссылки
// выравниваются (T-196): если у
// статьи меньше трёх входящих от соседей, одна ссылка с переполненной статьи
// переносится на неё — берётся пара с наименьшим ущербом для релевантности. Так у
// каждой статьи остаётся не меньше пяти входящих вместе с карточками главной и хаба.
const relevance = (current: Article, candidate: Article) =>
  (candidate.category === current.category ? 1 : 0) * 1000 +
  (candidate.tags || []).filter((t) => (current.tags || []).includes(t)).length;

export function buildRelatedMap(all: Article[], limit = 3): Map<string, Article[]> {
  const target = Math.min(limit, Math.max(0, all.length - 1));
  const order = new Map(all.map((a, i) => [a.id, i]));
  const incoming = new Map(all.map((a) => [a.id, 0]));
  const picks = new Map<string, Article[]>();

  for (const current of all) {
    const chosen = all
      .filter((a) => a.id !== current.id)
      .sort(
        (x, y) =>
          relevance(current, y) - relevance(current, x) ||
          (incoming.get(x.id) || 0) - (incoming.get(y.id) || 0) ||
          (order.get(x.id) || 0) - (order.get(y.id) || 0),
      )
      .slice(0, target);
    picks.set(current.id, chosen);
    for (const c of chosen) incoming.set(c.id, (incoming.get(c.id) || 0) + 1);
  }

  for (let guard = 0; guard < all.length * all.length; guard++) {
    const need = all
      .filter((a) => (incoming.get(a.id) || 0) < target)
      .sort(
        (x, y) =>
          (incoming.get(x.id) || 0) - (incoming.get(y.id) || 0) ||
          (order.get(x.id) || 0) - (order.get(y.id) || 0),
      )[0];
    if (!need) break;

    let best: { donor: Article; slot: number; out: Article; gain: number } | null = null;
    for (const donor of all) {
      if (donor.id === need.id) continue;
      const list = picks.get(donor.id) || [];
      if (list.some((a) => a.id === need.id)) continue;
      for (let slot = 0; slot < list.length; slot++) {
        const out = list[slot];
        if ((incoming.get(out.id) || 0) <= target) continue;
        const gain = relevance(donor, need) - relevance(donor, out);
        if (!best || gain > best.gain) best = { donor, slot, out, gain };
      }
    }
    if (!best) break;

    const list = picks.get(best.donor.id) || [];
    list[best.slot] = need;
    picks.set(best.donor.id, list);
    incoming.set(best.out.id, (incoming.get(best.out.id) || 0) - 1);
    incoming.set(need.id, (incoming.get(need.id) || 0) + 1);
  }

  return picks;
}
