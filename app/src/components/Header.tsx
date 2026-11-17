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
            <button 
              onClick={() => handleNav('articles')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'articles' ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Гайды
            </button>

            <button 
              onClick={() => handleNav('tests')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'tests' ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Тесты</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">4</span>
            </button>

            <button 
              onClick={() => handleNav('calculator')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'calculator' ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              Калькулятор
            </button>

            <button 
              onClick={() => handleNav('builder')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'builder' ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Конструктор
            </button>

            <button 
              onClick={() => handleNav('checklist')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'checklist' ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-rose-600" />
              Чек-лист
            </button>

            <button 
              onClick={() => handleNav('catalog')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'catalog' ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-stone-600" />
              Каталог
            </button>

            <button 
              onClick={() => handleNav('about')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'about' ? 'text-stone-950 bg-stone-100 font-semibold' : 'hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Info className="w-4 h-4 text-stone-500" />
              О проекте
            </button>
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
            <button 
              onClick={() => handleNav('articles')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                activeTab === 'articles' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Гайды и статьи
            </button>
            <button 
              onClick={() => handleNav('tests')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                activeTab === 'tests' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Тесты и диагностика
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">4 теста</span>
            </button>
            <button 
              onClick={() => handleNav('calculator')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                activeTab === 'calculator' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              Калькулятор высоты стола и стула
            </button>
            <button 
              onClick={() => handleNav('builder')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                activeTab === 'builder' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Конструктор сетапа
            </button>
            <button 
              onClick={() => handleNav('checklist')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                activeTab === 'checklist' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-rose-600" />
              Чек-лист фокуса с детьми
            </button>
            <button 
              onClick={() => handleNav('catalog')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                activeTab === 'catalog' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-stone-600" />
              Каталог товаров
            </button>
            <button 
              onClick={() => handleNav('about')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                activeTab === 'about' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-700'
              }`}
            >
              <Info className="w-4 h-4 text-stone-500" />
              О проекте
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

