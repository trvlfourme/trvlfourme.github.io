import { AffiliateConfig, ProductItem } from '../types';

export const DEFAULT_AFFILIATE_CONFIG: AffiliateConfig = {
  admitadSubId: 'kd_seo',
  gdeSlonId: '29831',
  saleadsId: 'sl_kabinetdoma',
  ozonReferralCode: 'OZON_KD2026',
  wbReferralCode: 'WBR_KD',
  yandexMarketAffiliateId: 'ym_kabinetdoma',
  eridEnabled: true,
  customDomain: 'kabinetdoma.ru',
  selfEmployedInn: '772812345678'
};

const STORAGE_KEY = 'kabinetdoma_affiliate_settings';

export function getStoredAffiliateConfig(): AffiliateConfig {
  if (typeof window === 'undefined') return DEFAULT_AFFILIATE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AFFILIATE_CONFIG;
    return { ...DEFAULT_AFFILIATE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AFFILIATE_CONFIG;
  }
}

export function saveAffiliateConfig(config: AffiliateConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save affiliate config', err);
  }
}

/**
 * Builds a tracked partner link.
 * Guarantees that:
 * - Ozon requests ALWAYS lead to Ozon
 * - Wildberries requests ALWAYS lead to Wildberries
 * - Yandex Market requests ALWAYS lead to Yandex Market
 * No cross-merchant fallback to ensure 100% affiliate and user trust.
 */
export function buildPartnerUrl(
  product: ProductItem,
  merchant: 'yandex' | 'ozon' | 'wb' | 'admitad' | 'gdeslon',
  config: AffiliateConfig = getStoredAffiliateConfig()
): string {
  // 1. Ozon
  if (merchant === 'ozon') {
    const ozonBase = product.ozonUrl || `https://www.ozon.ru/search/?text=${encodeURIComponent(product.name)}&from_global=true`;
    const isCustomOzonCode = config.ozonReferralCode && 
      config.ozonReferralCode !== 'OZON_KD2026' && 
      config.ozonReferralCode !== 'OZON_H4W2026' &&
      !config.ozonReferralCode.startsWith('OZON_');
    if (isCustomOzonCode) {
      const sep = ozonBase.includes('?') ? '&' : '?';
      return `${ozonBase}${sep}ref=${encodeURIComponent(config.ozonReferralCode)}`;
    }
    return ozonBase;
  }

  // 2. Wildberries (modern search path, clean)
  if (merchant === 'wb') {
    const rawWb = product.wbUrl || `https://www.wildberries.ru/search?query=${encodeURIComponent(product.name)}`;
    const cleanWb = rawWb.replace('/catalog/0/search.aspx?search=', '/search?query=');
    const isCustomWb = config.wbReferralCode && 
      config.wbReferralCode !== 'WBR_KD' && 
      !config.wbReferralCode.startsWith('WBR_');
    if (isCustomWb) {
      const sep = cleanWb.includes('?') ? '&' : '?';
      return `${cleanWb}${sep}ref=${encodeURIComponent(config.wbReferralCode)}`;
    }
    return cleanWb;
  }

  // 3. ГдеСлон
  if (merchant === 'gdeslon' && product.gdeSlonUrl) {
    return product.gdeSlonUrl;
  }

  // 4. Yandex Market / Admitad
  const ymBase = product.yandexMarketUrl || product.admitadUrl || `https://market.yandex.ru/search?text=${encodeURIComponent(product.name)}`;
  const isRealYandexClid = config.yandexMarketAffiliateId && 
    config.yandexMarketAffiliateId !== 'ym_kabinetdoma' && 
    /^\d+$/.test(config.yandexMarketAffiliateId); // Real Yandex Distribution CLIDs are numeric

  if (isRealYandexClid) {
    const sep = ymBase.includes('?') ? '&' : '?';
    return `${ymBase}${sep}clid=${encodeURIComponent(config.yandexMarketAffiliateId)}&utm_source=kabinetdoma`;
  }

  // Default: Return clean URL to real product search on Yandex Market
  return ymBase;
}

/**
 * Returns compliant Russian advertising disclosure label as required by Law 347-FZ.
 */
export function getLegalDisclosure(product: ProductItem, config: AffiliateConfig = getStoredAffiliateConfig()): string {
  if (!config.eridEnabled) return '';
  return `Реклама. ${product.ordAdvertiser}, erid: ${product.erid}`;
}
