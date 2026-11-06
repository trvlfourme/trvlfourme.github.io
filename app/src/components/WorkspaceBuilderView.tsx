import React, { useState } from 'react';
import { 
  Compass, 
  Check, 
  ExternalLink, 
  Copy, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SETUP_PRESETS } from '../data/contentData';
import { PRODUCTS_CATALOG } from '../data/products';
import { ProductItem } from '../types';
import { buildPartnerUrl, getLegalDisclosure } from '../utils/affiliate';

export const WorkspaceBuilderView: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SETUP_PRESETS[0].id);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    SETUP_PRESETS[0].includedProductIds
  );
  const [copiedLinks, setCopiedLinks] = useState(false);

  const activePreset = SETUP_PRESETS.find(p => p.id === selectedPresetId) || SETUP_PRESETS[0];

  const handleSelectPreset = (presetId: string) => {
    const preset = SETUP_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setSelectedProductIds([...preset.includedProductIds]);
    }
  };

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const selectedProducts: ProductItem[] = selectedProductIds
    .map(id => PRODUCTS_CATALOG.find(p => p.id === id))
    .filter((p): p is ProductItem => p !== undefined);

  const totalPrice = selectedProducts.reduce((sum, item) => sum + item.priceRub, 0);

  // Available add-ons not in current selection
  const remainingProducts = PRODUCTS_CATALOG.filter(p => !selectedProductIds.includes(p.id));

  const copyCartToClipboard = () => {
    const textLines = [
      `🛒 Готовый сетап рабочего места Home4Work:`,
      `Общий бюджет: ${totalPrice.toLocaleString('ru-RU')} ₽\n`,
      ...selectedProducts.map((p, i) => `${i + 1}. ${p.name} — ${p.priceRub.toLocaleString('ru-RU')} ₽ (${buildPartnerUrl(p, 'yandex')})`),
      `\nСобрано на https://home4work.ru`
    ];

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textLines.join('\n'));
      setCopiedLinks(true);
      setTimeout(() => setCopiedLinks(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          Конструктор сетапа & калькулятор бюджета
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
          Соберите идеальное рабочее место под ваши задачи и бюджет
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Выберите готовый сбалансированный шаблон или настройте каждый элемент вручную. 
          Все позиции проверены на совместимость, наличие на российских маркетплейсах и честную цену.
        </p>
      </div>

      {/* Preset Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {SETUP_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900 ring-offset-2' 
                  : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                    isSelected ? 'text-amber-400' : 'text-stone-500'
                  }`}>
                    {preset.targetAudience}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base sm:text-lg mb-2">{preset.title}</h3>
                <p className={`text-xs leading-relaxed mb-4 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                  {preset.description}
                </p>
              </div>

              <div className={`pt-3 border-t text-xs font-medium flex items-center justify-between ${
                isSelected ? 'border-stone-800 text-stone-400' : 'border-stone-150 text-stone-500'
              }`}>
                <span>{preset.includedProductIds.length} предметов</span>
                <span className={`font-bold font-mono text-sm ${isSelected ? 'text-amber-400' : 'text-stone-900'}`}>
                  ~{preset.budgetRub.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace Configurator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Selected Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Элементы в вашем наборе ({selectedProducts.length})
            </h3>
            <span className="text-xs text-stone-500">
              Вы можете удалять или добавлять компоненты
            </span>
          </div>

          {selectedProducts.length === 0 ? (
            <div className="p-8 text-center bg-stone-100 rounded-2xl text-stone-500 text-sm">
              Ваш комплект пуст. Добавьте элементы из списка ниже.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedProducts.map((prod) => (
                <div 
                  key={prod.id}
                  className="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="w-14 h-14 object-cover rounded-lg bg-stone-50 border border-stone-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-stone-900 truncate">{prod.name}</div>
                      <div className="text-xs text-stone-500 line-clamp-1">{prod.shortDesc}</div>
                      <div className="text-[10px] text-stone-700 font-mono mt-0.5">{getLegalDisclosure(prod)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-right">
                      <div className="font-bold text-sm sm:text-base text-stone-900 font-mono">
                        от {prod.priceRub.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="flex items-center gap-2 justify-end pt-0.5">
                        <a 
                          href={buildPartnerUrl(prod, 'yandex')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-stone-900 hover:text-stone-700 inline-flex items-center gap-0.5"
                        >
                          Я.Маркет
                          <ExternalLink className="w-2.5 h-2.5 text-amber-500" />
                        </a>
                        <a 
                          href={buildPartnerUrl(prod, 'ozon')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5"
                        >
                          Ozon
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleProduct(prod.id)}
                      title="Убрать из набора"
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add-ons from Catalog */}
          {remainingProducts.length > 0 && (
            <div className="pt-6">
              <h4 className="text-xs uppercase font-bold text-stone-500 tracking-wider mb-3">
                Рекомендуем добавить в комплект:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {remainingProducts.slice(0, 4).map((addon) => (
                  <div 
                    key={addon.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-stone-900 truncate">{addon.name}</div>
                      <div className="text-xs text-stone-500 font-mono">
                        +{addon.priceRub.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <button
                      onClick={() => toggleProduct(addon.id)}
                      className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors flex-shrink-0"
                      title="Добавить в сетап"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Total Cost & Actions Summary (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-1">
                Итоговый бюджет комплекта
              </div>
              <div className="text-3xl sm:text-4xl font-black text-stone-900 font-mono">
                {totalPrice.toLocaleString('ru-RU')} <span className="text-lg font-sans font-normal text-stone-500">₽</span>
              </div>
            </div>

            {/* Key Benefit Banner */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Главная ценность набора: </span>
                {activePreset.keyBenefit}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={copyCartToClipboard}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-amber-400" />
                {copiedLinks ? 'Список со ссылками скопирован!' : 'Скопировать список со ссылками'}
              </button>

              <div className="text-center">
                <span className="text-xs text-stone-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Все ссылки проверены на наличие в РФ и гарантию
                </span>
              </div>
            </div>

            {/* Delivery & Warranty perks in Russia */}
            <div className="pt-4 border-t border-stone-150 space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span>Доставка по РФ:</span>
                <span className="font-semibold text-stone-900">От 1 до 4 дней (Яндекс/Ozon)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Официальная гарантия:</span>
                <span className="font-semibold text-stone-900">До 5–10 лет на каркасы</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Оплата:</span>
                <span className="font-semibold text-stone-900">Карты МИР, СБП, сплиты/рассрочка</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
