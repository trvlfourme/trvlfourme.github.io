import React, { useState } from 'react';
import { 
  Sliders, 
  AlertCircle, 
  ExternalLink, 
  Zap, 
  Activity,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { ErgonomicsProfile } from '../types';
import { calculateErgonomics } from '../utils/ergonomics';
import { PRODUCTS_CATALOG } from '../data/products';
import { disclosureFor, priceText, OfferLinks } from './ProductOffers';

interface ErgonomicsCalculatorViewProps {
  onSelectProduct?: (productId: string) => void;
  onOpenBuilder?: () => void;
}

export const ErgonomicsCalculatorView: React.FC<ErgonomicsCalculatorViewProps> = ({
  onOpenBuilder
}) => {
  const [profile, setProfile] = useState<ErgonomicsProfile>({
    heightCm: 178,
    postureMode: 'hybrid',
    shoeSoleCm: 2,
    monitorDiagonalInch: 27,
    hasNeckPain: true,
    hasLowerBackPain: false
  });

  const calculated = calculateErgonomics(profile);

  const recommendedDesk = PRODUCTS_CATALOG.find(p => p.id === 'ergostol-terra')!;
  const recommendedChair = PRODUCTS_CATALOG.find(p => p.id === 'metta-samurai-s3')!;
  const recommendedArm = PRODUCTS_CATALOG.find(p => p.id === 'onkron-g80')!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title & Introduction */}
      <div className="max-w-3xl mb-10">
        <div className="text-xs uppercase tracking-wider font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Научный расчет по стандартам ГОСТ 13025.3 & ISO 9241-5
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
          Калькулятор эргономики стола, стула и монитора под рост
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Стандартная офисная мебель в магазинах рассчитана на усредненного мужчину ростом 175 см. 
          Если ваш рост отличается хотя бы на 5 см, мышцы шеи и поясницы получают постоянную спастическую нагрузку. 
          Укажите свои параметры для получения точных настроек в сантиметрах.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 border-b border-stone-150 pb-3">
            <Sliders className="w-4 h-4 text-amber-600" />
            Ваши параметры
          </h3>

          {/* Height Slider */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="height-slider" className="font-semibold text-stone-700">Рост без обуви:</label>
              <span className="font-mono text-lg font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {profile.heightCm} см
              </span>
            </div>
            <input 
              id="height-slider"
              type="range"
              min={145}
              max={205}
              step={1}
              value={profile.heightCm}
              aria-label="Рост без обуви в сантиметрах"
              onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-700 mt-1 font-mono">
              <span>145 см</span>
              <span>175 см (стандарт)</span>
              <span>205 см</span>
            </div>
          </div>

          {/* Shoe Sole Thickness */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="shoe-sole-input" className="text-stone-700 font-medium">Толщина подошвы тапочек/обуви:</label>
              <span className="font-mono text-sm font-semibold text-stone-800">{profile.shoeSoleCm} см</span>
            </div>
            <input 
              id="shoe-sole-input"
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={profile.shoeSoleCm}
              aria-label="Толщина подошвы тапочек или обуви в сантиметрах"
              onChange={(e) => setProfile({ ...profile, shoeSoleCm: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Monitor Diagonal */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="monitor-diagonal-input" className="text-stone-700 font-medium">Диагональ монитора:</label>
              <span className="font-mono text-sm font-semibold text-stone-800">{profile.monitorDiagonalInch}″</span>
            </div>
            <input 
              id="monitor-diagonal-input"
              type="range"
              min={13}
              max={49}
              step={1}
              value={profile.monitorDiagonalInch}
              aria-label="Диагональ экрана монитора в дюймах"
              onChange={(e) => setProfile({ ...profile, monitorDiagonalInch: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block mb-2">
              Формат работы
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sit', label: 'Только сидя' },
                { id: 'stand', label: 'Только стоя' },
                { id: 'hybrid', label: 'Чередование 40/20' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setProfile({ ...profile, postureMode: mode.id as any })}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                    profile.postureMode === mode.id
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms check */}
          <div className="space-y-2 pt-2 border-t border-stone-150">
            <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Зоны дискомфорта
            </div>
            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
              <input 
                type="checkbox"
                checked={profile.hasNeckPain}
                onChange={(e) => setProfile({ ...profile, hasNeckPain: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>Беспокоят боли или зажимы в шее / между лопаток</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
              <input 
                type="checkbox"
                checked={profile.hasLowerBackPain}
                onChange={(e) => setProfile({ ...profile, hasLowerBackPain: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>Беспокоит поясница после 3+ часов сидения</span>
            </label>
          </div>

        </div>

        {/* Results & Visual Schematic Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Numbers Grid */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <h3 className="font-bold text-base text-stone-900 mb-4 flex items-center justify-between">
              <span>Идеальные габариты для роста {profile.heightCm} см</span>
              <span className="text-xs font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Погрешность ±1.5 см
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500 mb-1">Высота сиденья кресла</div>
                <div className="text-2xl font-black text-stone-900 font-mono">
                  {calculated.seatHeightCm} <span className="text-sm font-sans font-normal text-stone-500">см</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">От пола до верха подушки</div>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                <div className="text-xs text-amber-900 font-medium mb-1">Высота стола (сидя)</div>
                <div className="text-2xl font-black text-amber-900 font-mono">
                  {calculated.deskSitHeightCm} <span className="text-sm font-sans font-normal text-amber-700">см</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1">
                  {calculated.deskSitHeightCm < 74 ? 'Ниже стандарта (75 см)' : 'Около стандарта'}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <div className="text-xs text-emerald-900 font-medium mb-1">Высота стола (стоя)</div>
                <div className="text-2xl font-black text-emerald-900 font-mono">
                  {calculated.deskStandHeightCm} <span className="text-sm font-sans font-normal text-emerald-700">см</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1">Для работы стоя</div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500 mb-1">Верхняя грань монитора</div>
                <div className="text-2xl font-black text-stone-900 font-mono">
                  {calculated.monitorTopEdgeHeightCm} <span className="text-sm font-sans font-normal text-stone-500">см</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">От уровня пола</div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500 mb-1">Дистанция до глаз</div>
                <div className="text-2xl font-black text-stone-900 font-mono">
                  {calculated.eyeToScreenDistanceCm} <span className="text-sm font-sans font-normal text-stone-500">см</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Длина вытянутой руки</div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500 mb-1">Угол в локтях</div>
                <div className="text-xl font-black text-stone-900 font-mono">
                  {calculated.idealAngleElbows}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Предплечья на столе</div>
              </div>

            </div>

            {/* Standard Desk Warning if height is short */}
            {calculated.footrestNeeded && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Внимание: </span>
                  Обычные столы в РФ высотой 75 см будут вам высоки на {75 - calculated.deskSitHeightCm} см. 
                  Если у вас не регулируемый по высоте стол, поднимите кресло до уровня стола и 
                  <span className="font-semibold underline ml-1">обязательно используйте подставку для ног</span>, 
                  иначе ноги будут висеть, вызывая отек вен.
                </div>
              </div>
            )}
          </div>

          {/* Recommendations box */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <h4 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              Персональные рекомендации ортопеда
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-stone-700">
              {calculated.recommendations.map((rec, i) => (
                <div key={i} className="p-2.5 bg-stone-50 rounded-lg border border-stone-150">
                  {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Targeted Product Picks for these dimensions */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-stone-900">
                Оборудование, точно закрывающее эти диапазоны
              </h4>
              {onOpenBuilder && (
                <button
                  onClick={onOpenBuilder}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  Собрать полный комплект
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {[recommendedDesk, recommendedChair, recommendedArm].map(prod => (
                <div key={prod.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 object-cover rounded-lg bg-white border border-stone-200" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-stone-900">{prod.name}</div>
                      <div className="text-[11px] text-stone-500">{prod.shortDesc}</div>
                      <div className="text-[10px] text-stone-700 font-mono mt-0.5">{disclosureFor(prod.id)}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {priceText(prod) && (
                      <div className="font-bold text-xs sm:text-sm text-stone-900">{priceText(prod)}</div>
                    )}
                    <OfferLinks
                      productId={prod.id}
                      className="mt-1 flex items-center gap-1.5 justify-end"
                      linkClassName="inline-flex items-center gap-0.5 text-[11px] font-semibold text-stone-900 hover:text-stone-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
