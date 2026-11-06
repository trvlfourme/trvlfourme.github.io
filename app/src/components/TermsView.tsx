import React from 'react';
import { BookOpen } from 'lucide-react';
import { NavTab } from '../types';

interface TermsViewProps {
  onNav: (tab: NavTab) => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onNav }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <button onClick={() => onNav('articles')} className="hover:text-stone-900 transition-colors">Главная</button>
        <span>/</span>
        <span className="text-stone-900 font-medium">Пользовательское соглашение</span>
      </nav>

      {/* Header */}
      <div className="border-b border-stone-200 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-900 text-xs font-semibold mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          Правила использования сайта
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
          Пользовательское соглашение
        </h1>
        <p className="text-xs text-stone-500">
          Действующая редакция | Сайт KabinetDoma.ru
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed">
        
        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">1. Статус материалов</h2>
          <p>
            Материалы, опубликованные на сайте KabinetDoma.ru (включая статьи, руководства, расчетные формулы калькулятора высоты стола и стула, 
            конструктор рабочего комплекта), носят исключительно информационно-просветительский характер.
          </p>
          <p>
            Сайт не оказывает медицинских услуг и не осуществляет постановку медицинских диагнозов. При болях в позвоночнике, шее, 
            туннельном синдроме запястья или хронических заболеваниях опорно-двигательного аппарата настоятельно рекомендуется обращаться к дипломированным медицинским специалистам.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">2. Интеллектуальная собственность</h2>
          <p>
            Текстовые статьи, методология расчетов, дизайн и графические элементы интерфейса портала являются объектами авторского права. 
            Цитирование материалов допускается строго с указанием активной гиперссылки на первоисточник на домене <strong>https://kabinetdoma.ru/</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">3. Отказ от публичной оферты</h2>
          <p>
            Никакие цены, скидки и описания товаров, приведенные в каталоге и обзорах, не являются публичной офертой, определяемой положениями Статьи 437 Гражданского кодекса РФ. 
            Актуальные цены, наличие и условия доставки регулируются исключительно правилами торговых площадок (маркетплейсов и интернет-магазинов) на момент оформления заказа.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">4. Обратная связь</h2>
          <p>
            По всем юридическим вопросам и претензиям правообладателей просьба обращаться по официальному электронному адресу: <a href="mailto:info@kabinetdoma.ru" className="text-amber-700 underline font-medium">info@kabinetdoma.ru</a>.
          </p>
        </section>

      </div>

    </div>
  );
};
