import React from 'react';
import { ArrowUpRight, Clock, Sparkles, Tag } from 'lucide-react';
import { Article } from '../types';
import { CATEGORIES, getTagsForArticle } from '../data/contentData';
import { handleImageError } from '../utils/imageFallback';
import { CARD_SIZES, HERO_SIZES, imageSrcSet } from '../utils/images';

interface ArticleCardProps {
  article: Article;
  onSelect: (id: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect, onSelectTag }) => {
  const categoryLabel = CATEGORIES.find(c => c.id === article.category)?.label || 'Гайд';
  const isAi = article.isAiGenerated || article.generatedBy === 'gemini';
  const tags = article.tags && article.tags.length > 0 ? article.tags : getTagsForArticle(article);
  // Адрес со слэшем — как canonical и sitemap: без него каждый переход с хаба и главной
  // уходит в лишний 301 от GitHub Pages (T-154).
  const articleUrl = `/article/${article.slug || article.id}/`;

  const handleCardClick = (e: React.MouseEvent) => {
    // If not middle click or ctrl/cmd click, handle as SPA navigation
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      onSelect(article.id);
    }
  };

  return (
    <a 
      href={articleUrl}
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col h-full text-inherit no-underline"
    >
      {/* Cover image container */}
      <div className="relative aspect-16/9 overflow-hidden bg-stone-100">
        <img 
          src={article.heroImage} 
          srcSet={imageSrcSet(article.heroImage)}
          sizes={CARD_SIZES}
          alt={article.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors" />
        {isAi && (
          <div className="absolute top-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-stone-700/50">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>ИИ-ассистент</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Zero-pill discipline (clean text with typographic separators) */}
          <div className="flex items-center gap-2 text-xs text-stone-700 font-medium mb-2.5 flex-wrap">
            <span className="text-amber-800 font-semibold">{tags[0] ? `#${tags[0]}` : categoryLabel}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-700" />
              {article.readTimeMin} мин
            </span>
            {isAi && (
              <>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  Сгенерировано ИИ
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug group-hover:text-amber-800 transition-colors mb-2 line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {article.excerpt}
          </p>

          {/* Tags list (Multiple tags per article) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag?.(tag);
                  }}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200/80 transition-colors cursor-pointer"
                  title={`Показать все материалы с тэгом #${tag}`}
                >
                  <span className="text-stone-400">#</span>
                  <span>{tag}</span>
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-stone-400 font-medium">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info: Author & CTA */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <img 
              src={article.author.avatar} 
              alt={article.author.name}
              className="w-5 h-5 rounded-full object-cover" 
            />
            <span className="truncate max-w-[120px] sm:max-w-none">{article.author.name}</span>
          </div>

          <span className="text-stone-900 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Читать
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
          </span>
        </div>
      </div>
    </a>
  );
};
