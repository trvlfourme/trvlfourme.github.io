import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { NavTab } from '../types';

interface FooterProps {
  onNav: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNav }) => {
  // Настоящие <a href>, а не кнопки: по кнопкам робот не видит внутренних ссылок (T-194).
  // Переход внутри приложения — без перезагрузки; `/articles/` — отдельная статическая
  // страница-хаб, её грузит браузер.
  const navLink = (tab: NavTab, href: string) => ({
    href,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onNav(tab);
    },
  });

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Editorial */}
          <div className="space-y-3 md:col-span-1">
            <a href="/" className="flex items-center gap-2 text-white font-bold text-base no-underline hover:text-amber-300 transition-colors">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center flex-shrink-0">
                <img src="/logo.png" alt="Кабинет Дома" className="w-full h-full object-cover" />
              </div>
              Кабинет Дома (kabinetdoma.ru)
            </a>
            <p className="text-stone-400 leading-relaxed text-xs">
              Цифровой портал об эргономике рабочего места, мебели, тишине и фокусе в домашнем кабинете. 
              Создан для удаленных специалистов и работающих родителей в России.
            </p>
            <div className="pt-1 text-stone-400 text-xs space-y-1">
              <div>
                <a {...navLink('about', '/about/')} className="hover:text-white transition-colors underline font-medium">
                  О проекте
                </a>
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
                <a {...navLink('tests', '/tests/')} className="hover:text-white transition-colors flex items-center gap-1.5 text-stone-300 font-medium no-underline">
                  <span>Тесты и диагностика</span>
                  <span className="text-[9px] bg-purple-900/80 text-purple-200 px-1 py-0.5 rounded font-mono">4 теста</span>
                </a>
              </li>
              <li>
                <a {...navLink('calculator', '/calculator/')} className="hover:text-white transition-colors no-underline">
                  Калькулятор высоты стола и стула
                </a>
              </li>
              <li>
                <a {...navLink('builder', '/builder/')} className="hover:text-white transition-colors no-underline">
                  Конструктор рабочего комплекта
                </a>
              </li>
              <li>
                <a {...navLink('checklist', '/checklist/')} className="hover:text-white transition-colors no-underline">
                  Чек-лист тишины с детьми
                </a>
              </li>
              <li>
                <a href="/tables/" className="hover:text-white transition-colors no-underline">
                  Таблицы высоты стола и стула
                </a>
              </li>
              <li>
                <a {...navLink('catalog', '/catalog/')} className="hover:text-white transition-colors no-underline">
                  Каталог товаров
                </a>
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
                <a href="/articles/" className="hover:text-white transition-colors no-underline">
                  Все гайды и статьи
                </a>
              </li>
              <li>
                <a href="/articles/" className="hover:text-white transition-colors no-underline">
                  Удаленка с детьми
                </a>
              </li>
              <li>
                <a href="/articles/" className="hover:text-white transition-colors no-underline">
                  Столы с электроприводом
                </a>
              </li>
              <li>
                <a href="/articles/" className="hover:text-white transition-colors no-underline">
                  Эргономичные кресла
                </a>
              </li>
              <li>
                <a href="/articles/" className="hover:text-white transition-colors no-underline">
                  Кабель-менеджмент и звук
                </a>
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
                <span>Маркировка по ст. 18.1 ФЗ «О рекламе»</span>
              </div>
              <p>
                Материалы содержат партнерские ссылки на маркетплейсы (Яндекс Маркет, Ozon, Wildberries). 
                Рекламные материалы маркируются токенами erid; сведения о креативах в ЕРИР передает ОРД «Яндекс».
              </p>
              <div className="pt-1 flex flex-col gap-1">
                <a {...navLink('privacy', '/privacy/')} className="text-left text-stone-400 hover:text-white transition-colors underline no-underline hover:no-underline">
                  Политика конфиденциальности (152-ФЗ)
                </a>
                <a {...navLink('terms', '/terms/')} className="text-left text-stone-400 hover:text-white transition-colors underline no-underline hover:no-underline">
                  Пользовательское соглашение
                </a>
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
