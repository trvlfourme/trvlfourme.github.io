import React from 'react';
import { Sliders, Compass, CheckSquare, ShieldCheck, Activity } from 'lucide-react';

interface HeroProps {
  onOpenCalculator: () => void;
  onOpenBuilder: () => void;
  onOpenChecklist: () => void;
  onOpenTests?: () => void;
  articlesCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenCalculator,
  onOpenBuilder,
  onOpenChecklist,
  onOpenTests,
  articlesCount
}) => {
  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-3xl">
          
          {/* Subtle text kicker (zero-pill rule) */}
          <div className="text-xs uppercase tracking-wider font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <span>Кабинет Дома / KabinetDoma.ru</span>
            <span aria-hidden="true" className="text-stone-300">/</span>
            <span>Для удаленщиков и родителей</span>
            <span aria-hidden="true" className="text-stone-300">/</span>
            <span className="text-stone-500">РФ 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] mb-5">
            Кабинет Дома: обустройство тихого и здорового рабочего места в любой квартире.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-8">
            Честные гайды по эргономике столов и кресел, шумоизоляции созвонов и зонированию 
            1–2 комнатных квартир с детьми. Только проверенные решения с официальной гарантией и доставкой по России.
          </p>

          {/* Interactive Tools Quick Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCalculator}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-xs flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              Калькулятор высоты
            </button>

            {onOpenTests && (
              <button
                onClick={onOpenTests}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-purple-600" />
                Тесты и диагностика
              </button>
            )}

            <button
              onClick={onOpenBuilder}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-900 transition-all border border-stone-200 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Собрать сетап под бюджет
            </button>

            <button
              onClick={onOpenChecklist}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-all flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4 text-rose-500" />
              Чек-лист тишины с детьми
            </button>
          </div>

          {/* Trust badges & stats (zero-pill inline text) */}
          <div className="mt-8 pt-6 border-t border-stone-150 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500">
            <div className="flex items-center gap-1.5 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Маркировка рекламы по ФЗ-347 (ERID)</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div>Расчеты по ГОСТ 13025.3 и ISO 9241-5</div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div>{articlesCount} экспертных материалов в базе</div>
          </div>

        </div>
      </div>
    </section>
  );
};
