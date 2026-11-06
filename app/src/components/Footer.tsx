import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { NavTab } from '../types';

interface FooterProps {
  onNav: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNav }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Editorial */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center flex-shrink-0">
                <img src="/logo.png" alt="Кабинет Дома" className="w-full h-full object-cover" />
              </div>
              Кабинет Дома (kabinetdoma.ru)
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Цифровой портал об эргономике рабочего места, мебели, тишине и фокусе в домашнем кабинете. 
              Создан для удаленных специалистов и работающих родителей в России.
            </p>
            <div className="pt-1 text-stone-400 text-xs space-y-1">
              <div>
                <button onClick={() => onNav('about')} className="hover:text-white transition-colors underline font-medium">
                  О проекте
                </button>
              </div>
              <div className="text-[11px] text-stone-400 pt-1">
                Вопросы и пожелания: <a href="mailto:info@kabinetdoma.ru" className="text-amber-400 hover:text-amber-300 transition-colors">info@kabinetdoma.ru</a>
              </div>
            </div>
          </div>

          {/* Tools & Calculators */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Инструменты
            </div>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button onClick={() => onNav('tests')} className="hover:text-white transition-colors flex items-center gap-1.5 text-stone-300 font-medium">
                  <span>Тесты и диагностика</span>
                  <span className="text-[9px] bg-purple-900/80 text-purple-200 px-1 py-0.5 rounded font-mono">4 теста</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNav('calculator')} className="hover:text-white transition-colors">
                  Калькулятор высоты стола и стула
                </button>
              </li>
              <li>
                <button onClick={() => onNav('builder')} className="hover:text-white transition-colors">
                  Конструктор рабочего комплекта
                </button>
              </li>
              <li>
                <button onClick={() => onNav('checklist')} className="hover:text-white transition-colors">
                  Чек-лист тишины с детьми
                </button>
              </li>
            </ul>
          </div>

          {/* Content & Topics */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Рубрики
            </div>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button onClick={() => onNav('articles')} className="hover:text-white transition-colors">
                  Удаленка с детьми
                </button>
              </li>
              <li>
                <button onClick={() => onNav('articles')} className="hover:text-white transition-colors">
                  Столы с электроприводом
                </button>
              </li>
              <li>
                <button onClick={() => onNav('articles')} className="hover:text-white transition-colors">
                  Эргономичные кресла
                </button>
              </li>
              <li>
                <button onClick={() => onNav('articles')} className="hover:text-white transition-colors">
                  Кабель-менеджмент и звук
                </button>
              </li>
            </ul>
          </div>

          {/* Legal and Compliance */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Правовая информация
            </div>
            <div className="text-[11px] text-stone-400 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Маркировка по ст. 18.1 ФЗ-347</span>
              </div>
              <p>
                Материалы содержат партнерские ссылки на проверенные маркетплейсы (Яндекс Маркет, Ozon, Wildberries). 
                Каждый рекламный материал снабжен токеном ERID от аккредитованного ОРД.
              </p>
              <div className="pt-1 flex flex-col gap-1">
                <button onClick={() => onNav('privacy')} className="text-left text-stone-400 hover:text-white transition-colors underline">
                  Политика конфиденциальности (152-ФЗ)
                </button>
                <button onClick={() => onNav('terms')} className="text-left text-stone-400 hover:text-white transition-colors underline">
                  Пользовательское соглашение
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 border-t border-stone-800 text-[11px] text-stone-500 space-y-2 leading-relaxed">
          <p>
            Дисклеймер: Информация на сайте KabinetDoma.ru носит рекомендательно-ознакомительный характер и не является 
            медицинской консультацией или публичной офертой (ст. 437 ГК РФ). При наличии хронических заболеваний 
            опорно-двигательного аппарата проконсультируйтесь с профильным врачом-ортопедом или неврологом.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-stone-400">
            <div className="flex items-center gap-2">
              <span>© 2026 Кабинет Дома (kabinetdoma.ru). Все права защищены.</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span>Создано для комфортной работы дома</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
