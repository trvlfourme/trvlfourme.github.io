// Единый разбор дат статей. В data/articles встречаются два формата: ISO
// («2026-11-03») и по-русски («03 ноября 2026»). Для сортировки, sitemap и schema
// нужен ISO, поэтому разбор живёт в одном месте.
const MONTHS = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
};

const pad = (n) => String(n).padStart(2, '0');

// Возвращает 'YYYY-MM-DD' или '' — если формат незнакомый.
function toISO(raw) {
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return '';
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;
  const ru = s.match(/^(\d{1,2})\s+([а-яё]+)\s+(\d{4})$/i);
  if (ru) {
    const m = MONTHS[ru[2].toLowerCase()];
    if (m) return `${ru[3]}-${pad(m)}-${pad(ru[1])}`;
  }
  return '';
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Ключ сортировки: будущую дату считаем сегодняшней — статья, у которой дата
// случайно оказалась впереди, не должна вставать над только что выпущенной.
function sortKey(raw) {
  const iso = toISO(raw);
  if (!iso) return '';
  const today = todayISO();
  return iso > today ? today : iso;
}

module.exports = { toISO, todayISO, sortKey };
