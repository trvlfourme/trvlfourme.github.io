import React, { useMemo, useState } from 'react';
import { ShoppingBag, ArrowDownAZ, Info } from 'lucide-react';
import { PRODUCTS_CATALOG } from '../data/products';
import { SITE_PRODUCTS } from '../data/site.generated';
import { OfferLinks, disclosureFor } from './ProductOffers';

// Каталог — витрина того, что реально есть в data/catalog.js: у каждого товара хотя бы один
// оффер с партнёрской ссылкой. Цены не печатаем (price_mode в каталоге), «рейтингов» не выдумываем:
// карточка показывает категорию, бренд, короткое пояснение и кнопки магазинов с маркировкой.

const CATEGORY_LABELS: Record<string, string> = {
  chair: 'Кресла',
  desk: 'Столы',
  lighting: 'Свет',
  audio: 'Звук и микрофоны',
  accessory: 'Аксессуары',
  'kids-zone': 'Детская зона',
  organization: 'Порядок и хранение',
  wellness: 'Здоровье',
};

interface CatalogEntry {
  id: string;
  name: string;
  brand: string;
  category: string;
  summary: string;
  hasErid: boolean;
}

const ENTRIES: CatalogEntry[] = PRODUCTS_CATALOG.map((product) => {
  const site = SITE_PRODUCTS.find((p) => p.id === product.id);
  const raw = String(site?.category || product.category || '').trim();
  const label = CATEGORY_LABELS[raw] || raw || 'Разное';
  return {
    id: product.id,
    name: product.name,
    brand: product.brand || '',
    category: label,
    summary: product.shortDesc || site?.summary || '',
    hasErid: Boolean(disclosureFor(product.id)),
  };
})
  // Без оффера карточке нечего предложить: такие товары в витрину не попадают.
  .filter((entry) => SITE_PRODUCTS.find((p) => p.id === entry.id)?.offers?.length)
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

const CATEGORIES = ['Все', ...Array.from(new Set(ENTRIES.map((e) => e.category))).sort((a, b) => a.localeCompare(b, 'ru'))];

const byName = (a: CatalogEntry, b: CatalogEntry) => a.name.localeCompare(b.name, 'ru');

export const CatalogView: React.FC = () => {
  const [category, setCategory] = useState('Все');
  const [sortDesc, setSortDesc] = useState(false);

  const items = useMemo(() => {
    const filtered = category === 'Все' ? ENTRIES : ENTRIES.filter((e) => e.category === category);
    return sortDesc ? [...filtered].sort(byName).reverse() : [...filtered].sort(byName);
  }, [category, sortDesc]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" />
          Каталог · {ENTRIES.length} товаров
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
          Товары, которые мы разбираем в статьях
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl">
          Здесь собраны позиции из гайдов и подборок «Кабинета Дома»: кресла и столы, свет и звук,
          кронштейны и мелочи для порядка на столе. Цены и наличие меняются каждый день, поэтому мы
          их не печатаем — откройте карточку магазина и сверьте условия у продавца.
        </p>
      </header>

      {/* Фильтры по категории и порядок сортировки */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-200">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((label) => {
            const active = label === category;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setCategory(label)}
                aria-pressed={active}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setSortDesc((v) => !v)}
          className="self-start lg:self-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:border-stone-400 transition-colors cursor-pointer"
        >
          <ArrowDownAZ className="w-4 h-4" />
          По названию: {sortDesc ? 'Я → А' : 'А → Я'}
        </button>
      </div>

      <p className="text-xs text-stone-500 mb-6">
        Показано {items.length} из {ENTRIES.length}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((entry) => (
          <article
            key={entry.id}
            className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 mb-2">
                {entry.category}
              </div>
              <h2 className="text-base font-bold text-stone-900 leading-snug mb-1">{entry.name}</h2>
              {entry.brand && <div className="text-xs text-stone-500 mb-3">{entry.brand}</div>}
              {entry.summary && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4 line-clamp-4">
                  {entry.summary}
                </p>
              )}
            </div>

            <div>
              <OfferLinks productId={entry.id} className="flex items-center flex-wrap gap-2 mb-2" />
              {entry.hasErid && (
                <p className="text-[10px] text-stone-500 leading-snug">
                  <span className="font-semibold text-stone-600">Реклама.</span> {disclosureFor(entry.id)}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-10 text-center bg-white rounded-xl border border-stone-200">
          <p className="text-sm text-stone-600">В этой категории пока нет товаров.</p>
        </div>
      )}

      <aside className="mt-10 flex items-start gap-2 text-xs text-stone-600 bg-stone-100 border border-stone-200 rounded-xl p-5">
        <Info className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Ссылки на магазины — партнёрские: если вы купите товар, сайт может получить комиссию, цена
          для вас от этого не меняется. Маркировка «Реклама» с erid и рекламодателем стоит у каждой
          такой кнопки. Состав каталога и характеристики сверяйте в карточке продавца.
        </p>
      </aside>
    </div>
  );
};
