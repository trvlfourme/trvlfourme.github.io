import React from 'react';
import { ShieldCheck, Award, Users, BookOpen, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { NavTab } from '../types';

interface AboutViewProps {
  onNav: (tab: NavTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNav }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <button onClick={() => onNav('articles')} className="hover:text-stone-900 transition-colors">Главная</button>
        <span>/</span>
        <span className="text-stone-900 font-medium">О проекте</span>
      </nav>

      {/* Header */}
      <div className="border-b border-stone-200 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-4">
          <Award className="w-3.5 h-3.5" />
          Экспертное медиа об эргономике
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-4">
          О проекте «Кабинет Дома» (KabinetDoma.ru)
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed max-w-3xl">
          Независимый портал, созданный для удаленных специалистов, родителей и фрилансеров в России. 
          Мы помогаем обустроить здоровое, тихое и высокопродуктивное рабочее место в условиях стандартной квартиры.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-stone-900 text-base mb-2">Доказательная эргономика</h2>
          <p className="text-stone-600 text-xs leading-relaxed">
            Все расчеты высоты столов и кресел базируются на стандартах ГОСТ 21889-76, ISO 9241-5 и рекомендациях ассоциаций эргономики. Никаких домыслов — только антропометрия.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-stone-900 text-base mb-2">Реальность квартир в РФ</h2>
          <p className="text-stone-600 text-xs leading-relaxed">
            Мы не пишем о кабинетах в загородных виллах на 50 м². Наши гайды адаптированы под спальни, утепленные балконы, кухни и однушки, где за стенкой играют дети.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-stone-900 text-base mb-2">Честные обзоры и тесты</h2>
          <p className="text-stone-600 text-xs leading-relaxed">
            Разбираем плюсы и минусы популярных в РФ брендов столов (Ergostol, Monotable), кресел (Метта, SIHOO) и аксессуаров. Указываем честные недостатки до покупки.
          </p>
        </div>
      </div>

      {/* Editorial Team */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          Редакционная коллегия и стандарты проверки
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="border border-stone-200 rounded-2xl p-6 bg-white flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex-shrink-0 flex items-center justify-center font-bold text-base">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Редакционный совет портала</h3>
              <p className="text-xs text-amber-700 font-medium mb-2">Рабочая группа по доказательной эргономике</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Коллектив авторов и технических специалистов с практическим опытом удаленной работы от 5 лет. Мы тестируем формулы расчетов, проверяем соответствие мебели российским антропометрическим стандартам и готовим объективные сравнения.
              </p>
            </div>
          </div>

          <div className="border border-stone-200 rounded-2xl p-6 bg-white flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex-shrink-0 flex items-center justify-center font-bold text-base">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Стандарты факт-чекинга</h3>
              <p className="text-xs text-emerald-700 font-medium mb-2">ГОСТ 21889-76, ГОСТ 13025.3, ISO 9241</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Каждый материал проходит трехэтапную верификацию: расчет кинематических углов в суставах, проверку технических паспортов моторов и газлифтов, а также аудит честных отзывов покупателей на российских маркетплейсах.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Standards & Transparency */}
      <div className="bg-stone-900 text-stone-200 rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">
          Прозрачность и соблюдение законов РФ
        </h2>
        <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Маркировка рекламы:</strong> В соответствии со статьей 18.1 Федерального закона № 347-ФЗ «О рекламе» все партнерские материалы и ссылки на маркетплейсы содержат идентификаторы рекламы (ERID) и передаются в Единый реестр интернет-рекламы (ЕРИР).
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Защита персональных данных:</strong> Мы соблюдаем Федеральный закон № 152-ФЗ «О персональных данных». Сайт не собирает избыточных данных пользователей и использует аналитику строго для оценки посещаемости.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Независимость:</strong> Торговые марки, упоминаемые в обзорах, принадлежат их законным правообладателям. Публикации отражают редакционную оценку экспертов портала.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
        <div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">Вопросы и пожелания по проекту?</h3>
          <p className="text-xs text-stone-600">Напишите нам на электронную почту редакции.</p>
        </div>
        <a 
          href="mailto:info@kabinetdoma.ru" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex-shrink-0"
        >
          <Mail className="w-4 h-4 text-amber-400" />
          info@kabinetdoma.ru
        </a>
      </div>

    </div>
  );
};
