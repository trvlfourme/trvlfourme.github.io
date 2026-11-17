import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { NavTab } from '../types';

interface PrivacyPolicyViewProps {
  onNav: (tab: NavTab) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNav }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <button onClick={() => onNav('articles')} className="hover:text-stone-900 transition-colors">Главная</button>
        <span>/</span>
        <span className="text-stone-900 font-medium">Политика конфиденциальности</span>
      </nav>

      {/* Header */}
      <div className="border-b border-stone-200 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Сайт не собирает персональные данные
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
          Политика конфиденциальности
        </h1>
        <p className="text-xs text-stone-500">
          Редакция от 16 ноября 2026 года | Информационный ресурс KabinetDoma.ru
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed">
        
        {/* Core Notice */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 text-xs sm:text-sm space-y-2">
          <div className="font-bold flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Главный принцип ресурса: сайт ничего не собирает о посетителе
          </div>
          <p>
            Сайт «Кабинет Дома» (<strong>kabinetdoma.ru</strong>) — открытое информационно-аналитическое издание
            об эргономике рабочего места. Здесь <strong>нет регистрации, личных кабинетов, подписок, форм и полей
            ввода</strong>, поэтому персональные данные посетителей не собираются, не записываются и не хранятся.
          </p>
        </div>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">1. Чего на сайте нет</h2>
          <p>
            Политика описывает ровно то, что делает сайт, поэтому список короткий:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Нет форм обратной связи, регистрации, авторизации, подписки и комментариев — ввести свои данные некуда.</li>
            <li>Нет счётчиков посещаемости, систем веб-аналитики, Вебвизора, пикселей и рекламных идентификаторов.</li>
            <li>Нет сохранения данных в браузере: сайт не записывает ни настроек, ни идентификаторов и не считывает их при следующих визитах.</li>
            <li>Нет внешних запросов к сторонним сервисам — шрифты системные, виджетов, встраиваний и чужих скриптов на страницах нет.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">2. Расчёты и тесты выполняются в браузере</h2>
          <p>
            Калькулятор высоты стола и стула, конструктор комплекта, чек-листы и тесты работают
            <strong> локально в браузере посетителя</strong>. Введённые значения не отправляются на сервер,
            не сохраняются и никому не передаются: после закрытия страницы их не остаётся.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">3. Партнерские ссылки (ст. 18.1 ФЗ «О рекламе»)</h2>
          <p>
            Партнерские ссылки сопровождаются идентификаторами рекламы (erid) — это требование ст. 18.1 Федерального
            закона от 13.03.2006 № 38-ФЗ «О рекламе» (статья введена Федеральным законом от 02.07.2021 № 347-ФЗ).
            Сведения о креативах в Единый реестр интернет-рекламы передает сервис размещения — ОРД «Яндекс».
          </p>
          <p>
            При клике по партнерской ссылке посетитель переходит на сайт маркетплейса, и дальнейшая обработка данных
            происходит по правилам этой площадки. Сайт KabinetDoma.ru не имеет доступа к аккаунтам, заказам,
            платежам и корзинам на торговых площадках и не получает сведений о том, что именно вы там делали.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">4. Технические журналы хостинга</h2>
          <p>
            Страницы сайта отдаёт хостинг-провайдер, который ведёт технические журналы обращений для обеспечения
            работы и защиты сайта. Редакция эти журналы не использует для идентификации посетителей, не связывает
            их с конкретным человеком и не передает третьим лицам.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">5. Обращения и связь</h2>
          <p>
            Сайт не принимает обращения через формы и не публикует почтовый ящик редакции, поэтому переписки,
            в которой могли бы появиться ваши данные, не возникает.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">6. Изменения политики</h2>
          <p>
            Если на сайте появятся аналитика, формы, рассылка или другой сбор данных, политика будет переписана
            до их запуска, а на страницах появится уведомление. Действующая редакция всегда опубликована на этой
            странице, дата указана выше.
          </p>
        </section>

      </div>

    </div>
  );
};
