import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { ErgonomicsCalculatorView } from './components/ErgonomicsCalculatorView';
import { WorkspaceBuilderView } from './components/WorkspaceBuilderView';
import { ParentChecklistView } from './components/ParentChecklistView';
import { AboutView } from './components/AboutView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { TermsView } from './components/TermsView';
import { InteractiveDiagnosticView } from './components/InteractiveDiagnosticView';
import { Footer } from './components/Footer';
import { ARTICLES_DATA, CATEGORIES, getTagsForArticle, POPULAR_TAGS, findArticleBySlugOrId } from './data/contentData';
import { Article, Category, NavTab } from './types';
import { Sliders, Compass, BookOpen, Layers, Activity, Tag, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('articles');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Статьи приходят из data/ через site.generated.ts: локальных копий больше нет.
  const articlesList: Article[] = ARTICLES_DATA;

  // Initialize and sync route with browser URL / redirect from 404.html
  useEffect(() => {
    const resolveAndApplyRoute = (fullPathOrQuery: string) => {
      const [pathPart, queryPart] = fullPathOrQuery.split('?');
      const cleanPath = (pathPart || '').split('#')[0].replace(/^\/+|\/+$/g, '').toLowerCase();

      // 1. Check article paths: article/slug or article/id
      if (cleanPath.startsWith('article/')) {
        const slugOrId = cleanPath.replace(/^article\//, '');
        const found = findArticleBySlugOrId(articlesList, slugOrId);
        if (found) {
          setSelectedArticleId(found.id);
          setActiveTab('articles');
          return;
        }
      }

      // 2. Check known static section routes
      if (cleanPath === 'calculator') { setActiveTab('calculator'); setSelectedArticleId(null); return; }
      if (cleanPath === 'builder') { setActiveTab('builder'); setSelectedArticleId(null); return; }
      if (cleanPath === 'checklist') { setActiveTab('checklist'); setSelectedArticleId(null); return; }
      if (cleanPath === 'catalog') { setActiveTab('articles'); setSelectedArticleId(null); return; }
      if (cleanPath === 'tests' || cleanPath === 'diagnostic' || cleanPath === 'quiz') { setActiveTab('tests'); setSelectedArticleId(null); return; }
      if (cleanPath === 'about' || cleanPath === 'contacts') { setActiveTab('about'); setSelectedArticleId(null); return; }
      if (cleanPath === 'privacy') { setActiveTab('privacy'); setSelectedArticleId(null); return; }
      if (cleanPath === 'terms') { setActiveTab('terms'); setSelectedArticleId(null); return; }
      if (cleanPath === 'articles') { setActiveTab('articles'); setSelectedArticleId(null); return; }
      // 3. Check query parameters: ?article= or ?tab= or ?kd_redirect=
      const searchStr = queryPart !== undefined ? queryPart : window.location.search.replace(/^\?/, '');
      const params = new URLSearchParams(searchStr);

      const redirectParam = params.get('kd_redirect');
      if (redirectParam) {
        window.history.replaceState({}, '', redirectParam);
        resolveAndApplyRoute(redirectParam);
        return;
      }

      const articleParam = params.get('article');
      if (articleParam) {
        const found = findArticleBySlugOrId(articlesList, articleParam);
        if (found) {
          setSelectedArticleId(found.id);
          setActiveTab('articles');
          return;
        }
      }

      const tabParam = params.get('tab') as NavTab | null;
      if (tabParam && ['articles', 'calculator', 'builder', 'checklist', 'tests', 'about', 'privacy', 'terms'].includes(tabParam)) {
        setActiveTab(tabParam);
        setSelectedArticleId(null);
      }
    };

    // Check redirect stored by 404.html for GitHub Pages SPA
    const redirected = sessionStorage.getItem('kd_redirect_path');
    if (redirected) {
      sessionStorage.removeItem('kd_redirect_path');
      window.history.replaceState({}, '', redirected);
      resolveAndApplyRoute(redirected);
    } else {
      resolveAndApplyRoute(window.location.pathname + window.location.search);
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      resolveAndApplyRoute(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [articlesList]);

  // Dynamic tag counts across all articles
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articlesList.forEach(a => {
      const tags = getTagsForArticle(a);
      tags.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [articlesList]);

  // Available tags sorted by count desc, then alphabetically
  const availableTags = useMemo(() => {
    const list = Object.keys(tagCounts);
    return list.sort((a, b) => (tagCounts[b] - tagCounts[a]) || a.localeCompare(b));
  }, [tagCounts]);

  // Filtered articles (by tag and search query)
  const filteredArticles = useMemo(() => {
    return articlesList.filter(article => {
      const articleTags = getTagsForArticle(article);
      const matchesTag = selectedTag === 'all' || articleTags.includes(selectedTag);
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.seo.primaryKeyword.toLowerCase().includes(q) ||
        articleTags.some(t => t.toLowerCase().includes(q)) ||
        article.sections.some((s: { content: string }) => s.content.toLowerCase().includes(q));
      return matchesTag && matchesCategory && matchesSearch;
    });
  }, [articlesList, selectedTag, selectedCategory, searchQuery]);

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
    setSelectedArticleId(null);
    setActiveTab('articles');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTag(prev => prev === tag ? 'all' : tag);
  };

  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return articlesList.find(a => a.id === selectedArticleId) || null;
  }, [articlesList, selectedArticleId]);

  const handleSelectArticle = (id: string | null) => {
    setSelectedArticleId(id);
    if (id) {
      const art = findArticleBySlugOrId(articlesList, id);
      const targetSlug = art?.slug || id;
      window.history.pushState({}, '', `/article/${targetSlug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState({}, '', activeTab === 'articles' ? '/' : `/${activeTab}`);
    }
  };

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedArticleId(null);
    const targetUrl = tab === 'articles' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      
      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNav}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectArticle={handleSelectArticle}
      />

      {/* Main Body Router */}
      <main className="flex-1">
        {activeTab === 'articles' && (
          <>
            {selectedArticle ? (
              <ArticleView
                article={selectedArticle}
                onBack={() => handleSelectArticle(null)}
                onOpenCalculator={() => handleNav('calculator')}
                onOpenTests={() => handleNav('tests')}
                onSelectTag={handleSelectTag}
              />
            ) : (
              <div>
                {/* Hero only shown on main feed without search query */}
                {!searchQuery && (
                  <Hero
                    onOpenCalculator={() => handleNav('calculator')}
                    onOpenBuilder={() => handleNav('builder')}
                    onOpenChecklist={() => handleNav('checklist')}
                    onOpenTests={() => handleNav('tests')}
                    articlesCount={articlesList.length}
                  />
                )}

                {/* Articles Feed */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  
                  {/* Tag Filter bar */}
                  <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2 flex-wrap">
                          {searchQuery ? (
                            <span>Результаты поиска: «{searchQuery}»</span>
                          ) : selectedTag !== 'all' ? (
                            <>
                              <span>Материалы по тэгу</span>
                              <span className="text-amber-800 font-mono">#{selectedTag}</span>
                            </>
                          ) : (
                            <span>Экспертные гайды и обзоры</span>
                          )}
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-500 mt-1">
                          {selectedTag !== 'all' 
                            ? `Найдено материалов: ${filteredArticles.length}. Кликните на выбранный тэг для сброса.`
                            : 'Без воды, с разбором эргономики, маркировкой рекламы и готовыми решениями'}
                        </p>
                      </div>

                      {selectedTag !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSelectedTag('all')}
                          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Сбросить тэг (#{selectedTag})</span>
                        </button>
                      )}
                    </div>

                    {/* Tag Filter Buttons (Functional filter buttons) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setSelectedTag('all')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                          selectedTag === 'all'
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        <span>Все темы</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          selectedTag === 'all' ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {articlesList.length}
                        </span>
                      </button>

                      {availableTags.map(tag => {
                        const count = tagCounts[tag] || 0;
                        const isSelected = selectedTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(tag)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-600 text-white shadow-xs font-bold'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            <span>#{tag}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                              isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-200 text-stone-600'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Articles Grid */}
                  {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {filteredArticles.map(article => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onSelect={handleSelectArticle}
                          onSelectTag={handleSelectTag}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                      <p className="text-stone-500 text-sm mb-3">По вашему запросу статей не найдено.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedTag('all');
                        }}
                        className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer"
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  )}

                  {/* Value-First Interactive Promos below articles */}
                  <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="text-xs uppercase font-bold text-purple-800 tracking-wider mb-2 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-purple-600" />
                          Интерактив 2026
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2">
                          Тесты и диагностика удаленки
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                          4 увлекательных теста: аудит мебели и осанки, готовность к 100% удаленке по психотипу, 
                          индекс сенсорного выгорания и калькулятор сэкономленных часов жизни.
                        </p>
                      </div>
                      <button
                        onClick={() => handleNav('tests')}
                        className="self-start px-4 py-2 text-xs font-semibold bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition-colors"
                      >
                        Пройти тесты (4 шт.) →
                      </button>
                    </div>

                    <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="text-xs uppercase font-bold text-amber-800 tracking-wider mb-2 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-amber-600" />
                          ГОСТ 13025.3
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2">
                          Персональная высота стола за 10 сек
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                          Введите свой рост и толщину подошвы обуви — калькулятор моментально рассчитает высоту 
                          столешницы для работы сидя и стоя, уровень верхнего края экрана и подставку для ног.
                        </p>
                      </div>
                      <button
                        onClick={() => handleNav('calculator')}
                        className="self-start px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
                      >
                        Рассчитать высоту стола →
                      </button>
                    </div>

                    <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="text-xs uppercase font-bold text-emerald-800 tracking-wider mb-2 flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-emerald-600" />
                          Setup Builder
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2">
                          Соберите комплект под бюджет
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                          Готовые сбалансированные сетапы: «Удаленный родитель (Тишина и фокус)», «Здоровая спина 360°» 
                          и «Старт до 35 000 ₽» со сравнением цен и прямой покупкой на российских маркетплейсах.
                        </p>
                      </div>
                      <button
                        onClick={() => handleNav('builder')}
                        className="self-start px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
                      >
                        Собрать свой сетап →
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'tests' && (
          <InteractiveDiagnosticView onNav={handleNav} />
        )}

        {activeTab === 'calculator' && (
          <ErgonomicsCalculatorView
            onOpenBuilder={() => handleNav('builder')}
          />
        )}

        {activeTab === 'builder' && (
          <WorkspaceBuilderView />
        )}

        {activeTab === 'checklist' && (
          <ParentChecklistView />
        )}

        {activeTab === 'about' && (
          <AboutView onNav={handleNav} />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicyView onNav={handleNav} />
        )}

        {activeTab === 'terms' && (
          <TermsView onNav={handleNav} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNav={handleNav}
      />

    </div>
  );
}
