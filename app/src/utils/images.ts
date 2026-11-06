// Адаптивные картинки: те же варианты, что готовит tools/make-image-variants.js.
// Правило сайта: <имя>.jpg — 1376 px, <имя>-640.jpg и <имя>-320.jpg — мелкие кандидаты.
export function imageSrcSet(src: string | undefined): string | undefined {
  if (!src || !/^\/images\/editorial\/[a-z0-9-]+\.jpe?g$/i.test(src)) return undefined;
  const base = src.replace(/\.jpe?g$/i, '');
  const ext = src.slice(src.lastIndexOf('.'));
  return `${base}-320${ext} 320w, ${base}-640${ext} 640w, ${src} 1376w`;
}

// sizes под раскладку: на телефоне карточка во всю ширину, на десктопе — треть сетки.
export const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
export const HERO_SIZES = '(max-width: 768px) 100vw, 1024px';
