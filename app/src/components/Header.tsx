import React from 'react';
import { 
  Sliders, 
  CheckSquare, 
  BookOpen, 
  ShoppingBag, 
  Settings, 
  Search, 
  Menu, 
  X,
  Compass,
  Info,
  Mail,
  Activity
} from 'lucide-react';
import { Category, NavTab } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectArticle: (articleId: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSelectArticle
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
    onSelectArticle(null);
    setMobileMenuOpen(false);
  };

  // Ссылки должны быть настоящими <a href>: по кнопкам робот не обходит разделы (T-194).
  // Переход внутри приложения остаётся без перезагрузки, кроме `/articles/`: это отдельная
  // статическая страница-хаб, её грузит браузер.
  const navLink = (tab: NavTab, href: string) => ({
    href,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      handleNav(tab);
    },
  });

  const desktopClass = (tab: NavTab) =>
    `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 no-underline ${
      activeTab === tab ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
    }`;

  const mobileClass = (tab: NavTab, extra = '') =>
    `w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 no-underline ${extra} ${
      activeTab === tab ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); handleNav('articles'); }}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0 no-underline"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Кабинет Дома" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                Кабинет Дома
                <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">.ru</span>
              </div>
              <p className="text-xs text-stone-700 hidden sm:block">Домашний офис, мебель и тишина</p>
            </div>
          </a>

          {/* Search bar */}
          <div className="hidden md:flex items-center relative flex-1 max-w-xs lg:max-w-sm">
            <Search className="w-4 h-4 text-stone-700 absolute left-3 pointer-events-none" />
            <input 
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'articles') {
                  setActiveTab('articles');
                }
              }}
              placeholder="Поиск гайдов, столов, кресел..."
              aria-label="Поиск по статьям"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-stone-100 hover:bg-stone-150 focus:bg-white border border-transparent focus:border-amber-400 rounded-lg outline-none transition-all placeholder:text-stone-700"
            />
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-stone-700">
            <a
              href="/articles/"
              className={desktopClass('articles')}
            >
              <BookOpen className="w-4 h-4" />
              Гайды
            </a>

            <a
              {...navLink('tests', '/tests/')}
              className={desktopClass('tests')}
            >
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Тесты</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">4</span>
            </a>

            <a
              {...navLink('calculator', '/calculator/')}
              className={desktopClass('calculator')}
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              Калькулятор
            </a>

            <a
              {...navLink('builder', '/builder/')}
              className={desktopClass('builder')}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Конструктор
            </a>

            <a
              {...navLink('checklist', '/checklist/')}
              className={desktopClass('checklist')}
            >
              <CheckSquare className="w-4 h-4 text-rose-600" />
              Чек-лист
            </a>

            <a
              {...navLink('catalog', '/catalog/')}
              className={desktopClass('catalog')}
            >
              <ShoppingBag className="w-4 h-4 text-stone-600" />
              Каталог
            </a>

            <a
              {...navLink('about', '/about/')}
              className={desktopClass('about')}
            >
              <Info className="w-4 h-4 text-stone-500" />
              О проекте
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Меню навигации"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-stone-200 space-y-1">
            <div className="mb-2 px-1">
              <input 
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по статьям и материалам..."
                aria-label="Поиск по статьям"
                className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg outline-none"
              />
            </div>
            <a
              href="/articles/"
              className={mobileClass('articles')}
            >
              <BookOpen className="w-4 h-4" />
              Гайды и статьи
            </a>
            <a
              {...navLink('tests', '/tests/')}
              className={mobileClass('tests', 'justify-between')}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Тесты и диагностика
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">4 теста</span>
            </a>
            <a
              {...navLink('calculator', '/calculator/')}
              className={mobileClass('calculator')}
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              Калькулятор высоты стола и стула
            </a>
            <a
              {...navLink('builder', '/builder/')}
              className={mobileClass('builder')}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Конструктор сетапа
            </a>
            <a
              {...navLink('checklist', '/checklist/')}
              className={mobileClass('checklist')}
            >
              <CheckSquare className="w-4 h-4 text-rose-600" />
              Чек-лист фокуса с детьми
            </a>
            <a
              {...navLink('catalog', '/catalog/')}
              className={mobileClass('catalog')}
            >
              <ShoppingBag className="w-4 h-4 text-stone-600" />
              Каталог товаров
            </a>
            <a
              {...navLink('about', '/about/')}
              className={mobileClass('about')}
            >
              <Info className="w-4 h-4 text-stone-500" />
              О проекте
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
