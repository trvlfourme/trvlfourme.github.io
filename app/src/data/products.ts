// Каталог приложения = каталог сайта (цены, офферы, erid) + редакционные тексты.
// Источник правды по товарам — data/catalog.js: чего там нет, того нет и в сборке.
import { ProductItem } from '../types';
import { PRODUCTS_EDITORIAL } from './contentData';
import { SITE_PRODUCTS, SiteProduct } from './site.generated';

const STORE_FIELD: Record<string, keyof ProductItem> = {
  yandex: 'yandexMarketUrl',
  wb: 'wbUrl',
  admitad: 'admitadUrl',
  gdeslon: 'gdeSlonUrl',
};

const STORE_LABEL: Record<string, string> = {
  yandex: 'Яндекс Маркет',
  wb: 'Wildberries',
  admitad: 'Admitad',
  gdeslon: 'ГдеСлон',
  ozon: 'Ozon',
};

function toProductItem(site: SiteProduct): ProductItem {
  const editorial = PRODUCTS_EDITORIAL.find((p) => p.id === site.id);
  const links: Partial<Record<keyof ProductItem, string>> = {};
  let erid = '';
  let ordAdvertiser = '';
  let bestMerchant = '';

  for (const offer of site.offers) {
    // erid берём только у карточки рекламодателя: у поискового оффера его нет по правилам сайта.
    if (offer.kind === 'card' && offer.erid && !erid) {
      erid = offer.erid;
      ordAdvertiser = offer.advertiser;
    }
    const field = STORE_FIELD[offer.store];
    if (field && !links[field]) {
      links[field] = offer.url;
      if (!bestMerchant) bestMerchant = STORE_LABEL[offer.store] || offer.store;
    }
  }

  // Прямые ссылки из data/product-links.js (если для магазина оффера нет).
  if (site.links.yandex && !links.yandexMarketUrl) links.yandexMarketUrl = site.links.yandex;
  if (site.links.wb && !links.wbUrl) links.wbUrl = site.links.wb;

  return {
    id: site.id,
    name: site.name,
    brand: site.brand || editorial?.brand || '',
    category: (site.category || editorial?.category || 'accessory') as ProductItem['category'],
    shortDesc: editorial?.shortDesc || '',
    fullDesc: editorial?.fullDesc || '',
    priceRub: site.priceRub || editorial?.priceRub || 0,
    priceMode: site.priceMode,
    priceNote: site.priceNote,
    rating: editorial?.rating || 0,
    reviewsCount: editorial?.reviewsCount || 0,
    pros: editorial?.pros || [],
    cons: editorial?.cons || [],
    specs: editorial?.specs || {},
    imageUrl: editorial?.imageUrl || '',
    bestMerchant: bestMerchant || editorial?.bestMerchant || '',
    erid,
    ordAdvertiser,
    ...links,
  } as ProductItem;
}

export const PRODUCTS_CATALOG: ProductItem[] = SITE_PRODUCTS.map(toProductItem);
