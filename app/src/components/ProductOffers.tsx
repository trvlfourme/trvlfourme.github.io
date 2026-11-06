import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SITE_PRODUCTS } from '../data/site.generated';

// Кнопки магазинов строятся только из офферов каталога: никаких своих URL,
// реферальных кодов и поисковых ссылок «на всякий случай». Нет оффера — нет кнопки.

const STORE_LABEL: Record<string, string> = {
  yandex: 'Я.Маркет',
  wb: 'WB',
  admitad: 'Купить',
  gdeslon: 'Купить',
};

export function offersFor(productId: string) {
  return SITE_PRODUCTS.find((p) => p.id === productId)?.offers ?? [];
}

// Цена печатается только при price_mode: "note" — и только как ориентир.
// При "hidden" в сборке цены не появляются вообще.
export function priceText(product: { priceMode?: 'hidden' | 'note'; priceRub?: number }): string {
  if (product.priceMode !== 'note' || !product.priceRub) return '';
  return `ориентир ${product.priceRub.toLocaleString('ru-RU')} ₽`;
}

export function firstOfferUrl(productId: string): string {
  return offersFor(productId).find((o) => o.url)?.url ?? '';
}

/** Строка маркировки рекламы: erid и рекламодатель есть только у карточки. */
export function disclosureFor(productId: string): string {
  const offer = offersFor(productId).find((o) => o.kind === 'card' && o.erid);
  if (!offer) return '';
  return offer.advertiser ? `erid: ${offer.erid} · ${offer.advertiser}` : `erid: ${offer.erid}`;
}

interface OfferLinksProps {
  productId: string;
  className?: string;
  linkClassName?: string;
}

export const OfferLinks: React.FC<OfferLinksProps> = ({ productId, className, linkClassName }) => {
  const offers = offersFor(productId).filter((o) => o.url);
  if (offers.length === 0) return null;

  return (
    <div className={className ?? 'flex items-center flex-wrap gap-2'}>
      {offers.map((offer, i) => (
        <a
          key={`${offer.store}-${i}`}
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={
            linkClassName ??
            'px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors inline-flex items-center gap-1.5'
          }
        >
          {offer.label || STORE_LABEL[offer.store] || 'Купить'}
          <ExternalLink className="w-3 h-3 text-amber-400" />
        </a>
      ))}
    </div>
  );
};
