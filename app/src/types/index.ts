export type Category = 
  | 'all'
  | 'balance'
  | 'ergonomics'
  | 'with-kids'
  | 'furniture'
  | 'lighting-sound'
  | 'organization'
  | 'productivity'
  | 'travel'
  | 'other';

export interface CategoryInfo {
  id: Category;
  label: string;
  description: string;
  count: number;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: 'chair' | 'desk' | 'lighting' | 'audio' | 'accessory' | 'kids-zone' | 'organization' | 'wellness';
  shortDesc: string;
  fullDesc: string;
  priceRub: number;
  priceMode?: 'hidden' | 'note';
  priceNote?: string;
  rating: number; // 1-5
  reviewsCount: number;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  imageUrl: string;
  // Партнёрские ссылки и erid приходят из каталога сайта (data/catalog.js),
  // в редакционных текстах их не держим.
  admitadUrl?: string;
  gdeSlonUrl?: string;
  yandexMarketUrl?: string;
  bestMerchant?: string;
  erid?: string;
  ordAdvertiser?: string; // e.g. "ООО «Яндекс», ИНН 7736207543"
}

export interface ArticleSection {
  id: string;
  title: string;
  content: string; // Markdown or rich text
  highlightBox?: {
    type: 'tip' | 'warning' | 'expert' | 'calc-embed';
    title: string;
    text: string;
  };
  productIds?: string[];
}

export interface Article {
  id: string;
  slug: string;
  slugAliases?: string[];
  title: string;
  subtitle: string;
  excerpt: string;
  category: Category;
  tags?: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  updatedAt: string;
  readTimeMin: number;
  heroImage: string;
  tableOfContents: { id: string; label: string }[];
  sections: ArticleSection[];
  featuredProductIds: string[];
  conclusion: string;
  faqList: { question: string; answer: string }[];
  generatedBy?: 'gemini' | 'grounded-engine';
  isAiGenerated?: boolean;
  aiVerificationNotice?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    yandexWordstatSearches: number;
  };
}

export interface ErgonomicsProfile {
  heightCm: number;
  postureMode: 'sit' | 'stand' | 'hybrid';
  shoeSoleCm: number;
  monitorDiagonalInch: number;
  hasNeckPain: boolean;
  hasLowerBackPain: boolean;
}

export interface CalculatedErgonomics {
  seatHeightCm: number;
  deskSitHeightCm: number;
  deskStandHeightCm: number;
  monitorTopEdgeHeightCm: number;
  eyeToScreenDistanceCm: number;
  armrestHeightCm: number;
  footrestNeeded: boolean;
  idealAngleElbows: string;
  recommendations: string[];
}

export interface SetupPreset {
  id: string;
  title: string;
  targetAudience: string;
  budgetRub: number;
  description: string;
  includedProductIds: string[];
  keyBenefit: string;
}

export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  category: 'morning' | 'focus-call' | 'kids-boundary' | 'evening';
  completed: boolean;
  importance: 'critical' | 'high' | 'medium';
  proTip?: string;
}


export interface LaunchChecklistItem {
  id: string;
  title: string;
  service: string;
  status: 'completed' | 'in_progress' | 'pending';
  priority: 'must_have' | 'recommended' | 'optional';
  directLink: string;
  actionGuide: string;
  whyNeeded: string;
}

export type NavTab = 
  | 'articles' 
  | 'calculator' 
  | 'builder' 
  | 'checklist' 
  | 'tests'
  | 'about'
  | 'privacy'
  | 'terms';

