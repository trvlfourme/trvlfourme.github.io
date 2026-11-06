import React from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Calendar, 
  ExternalLink, 
  Check, 
  X, 
  HelpCircle,
  Share2,
  Bookmark,
  Sliders,
  Sparkles,
  Activity,
  Tag
} from 'lucide-react';
import { Article, ProductItem } from '../types';
import { CATEGORIES, getTagsForArticle } from '../data/contentData';
import { PRODUCTS_CATALOG } from '../data/products';
import { disclosureFor, priceText, OfferLinks } from './ProductOffers';
import { handleImageError } from '../utils/imageFallback';
import { MarkdownRenderer } from './MarkdownRenderer';
import { HERO_SIZES, imageSrcSet } from '../utils/images';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onOpenCalculator: () => void;
  onOpenTests?: () => void;
  onSelectTag?: (tag: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  onBack,
  onOpenCalculator,
  onOpenTests,
  onSelectTag
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const categoryLabel = CATEGORIES.find(c => c.id === article.category)?.label || 'Гайд';
  const tags = article.tags && article.tags.length > 0 ? article.tags : getTagsForArticle(article);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getProduct = (id: string): ProductItem | undefined => {
    return PRODUCTS_CATALOG.find(p => p.id === id);
  };

  // Dynamic SEO metadata & Schema.org JSON-LD
  React.useEffect(() => {
    const prevTitle = document.title;
    const articleTitle = article.seo?.metaTitle || `${article.title} — Кабинет Дома`;
    document.title = articleTitle;

    const setMeta = (nameOrProp: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${nameOrProp}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameOrProp, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const description = article.seo?.metaDescription || article.excerpt;
    const canonicalUrl = `https://kabinetdoma.ru/article/${article.slug || article.id}`;
    const heroImageUrl = article.heroImage ? (article.heroImage.startsWith('http') ? article.heroImage : `https://kabinetdoma.ru${article.heroImage}`) : undefined;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', articleTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', 'article');
    if (heroImageUrl) {
      setMeta('property', 'og:image', heroImageUrl);
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevCanonical = canonical?.href || 'https://kabinetdoma.ru';
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const scriptId = 'article-structured-data';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': description,
      'image': heroImageUrl ? [heroImageUrl] : undefined,
      'datePublished': article.publishedAt,
      'dateModified': article.updatedAt,
      'author': {
        '@type': 'Person',
        'name': article.author.name,
        'jobTitle': article.author.role
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Кабинет Дома',
        'url': 'https://kabinetdoma.ru',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://kabinetdoma.ru/logo.png'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': canonicalUrl
      }
    });

    return () => {
      document.title = prevTitle;
      setMeta('name', 'description', 'Экспертный портал об обустройстве домашнего кабинета в квартире: подъемные столы, ортопедические кресла, зонирование с детьми, свет, звук и калькулятор эргономики.');
      setMeta('property', 'og:title', 'Кабинет Дома (KabinetDoma.ru) – Всё для идеального рабочего места');
      setMeta('property', 'og:description', 'Экспертные гайды, калькулятор высоты стола и стула, конструктор тихого рабочего места для удаленщиков и родителей.');
      setMeta('property', 'og:url', 'https://kabinetdoma.ru');
      setMeta('property', 'og:type', 'website');
      if (canonical) canonical.href = prevCanonical;
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [article]);

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад ко всем материалам
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? 'Ссылка скопирована' : 'Поделиться'}
          </button>
        </div>
      </div>

      {/* Main Grid: Content + Sticky TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Article Body (8 cols) */}
        <div className="lg:col-span-8">
          
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-3">
              <span className="text-amber-700 font-semibold">{categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {article.publishedAt}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTimeMin} мин чтения
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views} просмотров
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight leading-[1.2] mb-4">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal mb-4">
              {article.subtitle}
            </p>

            {/* Tags badges (Multiple tags) */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-6">
                <span className="text-xs text-stone-400 flex items-center gap-1 mr-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Тэги:</span>
                </span>
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag?.(tag)}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 transition-colors cursor-pointer"
                    title={`Показать все материалы с тэгом #${tag}`}
                  >
                    <span className="text-amber-600 font-bold">#</span>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Author Card & AI Notice */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                <img 
                  src={article.author.avatar} 
                  alt={article.author.name}
                  onError={handleImageError}
                  className="w-10 h-10 rounded-full object-cover border border-stone-300" 
                />
                <div>
                  <div className="font-bold text-stone-900 text-sm">{article.author.name}</div>
                  <div>{article.author.role}</div>
                </div>
              </div>

              {(article.isAiGenerated || article.generatedBy === 'gemini') && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                  <span className="p-1 rounded-md bg-amber-200/80 text-amber-900 flex-shrink-0 mt-0.5 font-bold">ИИ</span>
                  <div>
                    <span className="font-semibold text-stone-900">Сгенерировано с использованием ИИ: </span>
                    {article.aiVerificationNotice || 'Структура и фактологический материал подготовлены с использованием нейросетевых моделей Gemini и адаптированы экспертами «Кабинет Дома» по нормативам эргономики 2026.'}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Hero Image */}
          <div className="aspect-16/9 rounded-2xl overflow-hidden mb-10 bg-stone-100 border border-stone-200 shadow-xs">
            <img 
              src={article.heroImage} 
              srcSet={imageSrcSet(article.heroImage)}
              sizes={HERO_SIZES}
              alt={article.title}
              onError={handleImageError}
              className="w-full h-full object-cover" 
              fetchPriority="high"
            />
          </div>

          {/* Mobile TOC */}
          <div className="lg:hidden mb-8 p-4 bg-stone-100 rounded-xl border border-stone-200">
            <div className="font-bold text-sm text-stone-900 mb-2 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-600" />
              Оглавление статьи
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700">
              {article.tableOfContents.map((toc) => (
                <li key={toc.id}>
                  <a href={`#${toc.id}`} className="hover:text-amber-700 hover:underline transition-colors">
                    {toc.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections Body */}
          <div className="space-y-10 text-stone-800 leading-relaxed text-sm sm:text-base">
            {article.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mb-4">
                  {section.title.replace(/^#{1,6}\s*/, '')}
                </h2>

                <MarkdownRenderer content={section.content} />

                {/* Highlight callout if present */}
                {section.highlightBox && (
                  <div className={`mt-5 p-4 rounded-xl border text-sm ${
                    section.highlightBox.type === 'warning' 
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  }`}>
                    <div className="font-bold text-xs uppercase tracking-wide mb-1">
                      {section.highlightBox.title}
                    </div>
                    <div>{section.highlightBox.text}</div>
                  </div>
                )}

                {/* Section Specific Products */}
                {section.productIds && section.productIds.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {section.productIds.map((prodId) => {
                      const prod = getProduct(prodId);
                      if (!prod) return null;
                      return (
                        <div 
                          key={prod.id} 
                          className="bg-stone-50 rounded-xl border border-stone-200 p-4 sm:p-5 hover:border-amber-400 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row gap-4">
                            <img 
                              src={prod.imageUrl} 
                              alt={prod.name} 
                              className="w-full sm:w-36 h-36 object-cover rounded-lg bg-white border border-stone-200 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <h4 className="font-bold text-base text-stone-900">{prod.name}</h4>
                                <div className="text-right">
                                  <div className="text-base font-extrabold text-stone-900">
                                    {priceText(prod) || 'Цена в каталоге'}
                                  </div>
                                  <div className="text-[10px] text-stone-700">на маркетплейсах</div>
                                </div>
                              </div>
                              <p className="text-xs text-stone-600 mb-3">{prod.shortDesc}</p>

                              {/* Pros & Cons */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
                                <div className="space-y-1">
                                  {prod.pros.slice(0, 2).map((pro, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 text-emerald-800">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <span>{pro}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-1">
                                  {prod.cons.slice(0, 2).map((con, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 text-rose-800">
                                      <X className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                                      <span>{con}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Магазины и маркировка рекламы — из офферов каталога */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
                                <OfferLinks productId={prod.id} />
                                <div className="text-[10px] text-stone-700 font-mono">
                                  {disclosureFor(prod.id)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Interactive Calculator Promotion within the article */}
          <div className="my-10 p-6 bg-gradient-to-br from-amber-500/10 via-stone-50 to-stone-100 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide font-bold text-amber-800 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Интерактивный инструмент
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">
                Рассчитайте точную высоту стола и монитора под ваш рост
              </h3>
              <p className="text-xs text-stone-600">
                По стандарту ГОСТ 13025.3 с учетом высоты подошвы обуви и угла сгибания в локтях.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={onOpenCalculator}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-all flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                Калькулятор ГОСТ
              </button>
              {onOpenTests && (
                <button
                  onClick={onOpenTests}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-900 hover:bg-purple-800 text-white transition-all flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4 text-purple-300" />
                  Пройти тест сетапа
                </button>
              )}
            </div>
          </div>

'          {/* Подборку каталога на статической странице рисует assets/kd-catalog-render.js
              по data/catalog.js: второй блок здесь дал бы дубли товаров. */}

          {/* Conclusion */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 mb-10">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Резюме эксперта</h3>
            <MarkdownRenderer content={article.conclusion} />
          </div>

          {/* FAQ Schema Accordion */}
          {article.faqList && article.faqList.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                Часто задаваемые вопросы (FAQ)
              </h3>
              <div className="space-y-3">
                {article.faqList.map((faq, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-stone-200">
                    <h4 className="font-bold text-sm text-stone-900 mb-1.5">{faq.question}</h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Back Button */}
          <div className="pt-6 border-t border-stone-200">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться ко всем гайдам
            </button>
          </div>

        </div>

        {/* Right Column: Sticky Table of Contents (4 cols) */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            
            {/* TOC Card */}
            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-xs uppercase tracking-wider font-bold text-stone-700 mb-3 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-600" />
                Оглавление
              </div>

              <nav className="space-y-2 text-xs">
                {article.tableOfContents.map((toc) => (
                  <a
                    key={toc.id}
                    href={`#${toc.id}`}
                    className="block text-stone-600 hover:text-stone-900 hover:font-semibold transition-all py-1 border-l-2 border-stone-200 pl-3 hover:border-amber-600"
                  >
                    {toc.label}
                  </a>
                ))}
              </nav>

              <div className="mt-5 pt-4 border-t border-stone-150 text-[11px] text-stone-700">
                Время чтения: <span className="font-semibold text-stone-700">{article.readTimeMin} минут</span>
              </div>
            </div>

            {/* Quick Helper Widget */}
            <div className="p-5 bg-stone-900 text-white rounded-2xl">
              <h4 className="font-bold text-sm mb-1.5 text-amber-400">Нужен совет по обустройству?</h4>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Воспользуйтесь нашим интерактивным калькулятором для точного подбора высоты стола и кресла.
              </p>
              <button
                onClick={onOpenCalculator}
                className="w-full py-2 px-3 text-xs font-semibold bg-white text-stone-900 rounded-lg hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                Рассчитать под свой рост
              </button>
            </div>

          </div>
        </aside>

      </div>
    </article>
  );
};
