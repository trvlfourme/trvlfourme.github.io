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
          152-ФЗ РФ «О персональных данных»
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
          Политика конфиденциальности
        </h1>
        <p className="text-xs text-stone-500">
          Редакция от 05 октября 2026 года | Информационный ресурс KabinetDoma.ru
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed">
        
        {/* Core Notice */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 text-xs sm:text-sm space-y-2">
          <div className="font-bold flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Главный принцип ресурса: нулевой сбор персональных данных
          </div>
          <p>
            Сайт «Кабинет Дома» (<strong>kabinetdoma.ru</strong>) является открытым информационно-аналитическим изданием. 
            Сайт <strong>не требует регистрации</strong>, не создает личных кабинетов пользователей, 
            не содержит форм ввода личных данных и <strong>не собирает, не систематизирует и не хранит персональные данные физических лиц</strong> в базах данных.
          </p>
        </div>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">1. Отсутствие сбора персональных данных</h2>
          <p>
            Мы уважаем приватность наших читателей и придерживаемся политики минимизации данных:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>На сайте отсутствуют формы регистрации, подписки, авторизации и обратной связи.</li>
            <li>Мы не запрашиваем и не храним паспортные данные, номера телефонов, адреса проживания или платежные реквизиты.</li>
            <li>Все расчеты в интерактивных инструментах (калькулятор высоты стола и стула, конструктор комплекта) производятся 
            <strong> строго локально в браузере пользователя</strong> (на стороне клиента) и не передаются на внешние серверы.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">2. Обезличенные технические данные и Cookies</h2>
          <p>
            Для обеспечения корректной работы сайта и анализа посещаемости используются исключительно обезличенные технические средства:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Файлы Cookie (куки):</strong> технические маркеры, сохраняемые браузером для запоминания выбранных настроек отображения. 
              Вы можете в любой момент заблокировать или очистить cookie в настройках своего браузера.
            </li>
            <li>
              <strong>Агрегированная веб-аналитика:</strong> на сайте может использоваться сервис веб-аналитики Яндекс.Метрика 
              (ООО «Яндекс», ИНН 7736207543) для подсчета общего количества просмотров страниц и популярных рубрик. Данные собираются 
              в обобщенном обезличенном виде без возможности идентификации конкретного гражданина.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">3. Партнерские ссылки и сторонние сервисы (ФЗ-347)</h2>
          <p>
            Материалы сайта содержат партнерские ссылки на российские маркетплейсы (Яндекс Маркет, Ozon, Wildberries). 
            В соответствии со ст. 18.1 Федерального закона № 347-ФЗ «О рекламе» партнерские интеграции сопровождаются токенами ERID.
          </p>
          <p>
            При клике по партнерской ссылке Пользователь переходит на сайт соответствующего маркетплейса. 
            Сайт KabinetDoma.ru не имеет доступа к вашим аккаунтам, заказам, платежам или корзинам на этих торговых площадках. 
            Отношения купли-продажи и обработка данных при покупке регулируются политиками конфиденциальности соответствующих платформ.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">4. Электронная почта редакции</h2>
          <p>
            Если вы добровольно отправляете письмо на адрес редакции <a href="mailto:info@kabinetdoma.ru" className="text-amber-700 underline font-medium">info@kabinetdoma.ru</a>, 
            ваш e-mail адрес используется исключительно для ответа на ваше обращение и не передается третьим лицам, не включается в спам-базы или коммерческие рассылки.
          </p>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2">5. Контакты по правовым вопросам</h2>
          <p>
            По любым вопросам касательно настоящей Политики вы можете обратиться к администрации сайта: <a href="mailto:info@kabinetdoma.ru" className="text-amber-700 underline font-medium">info@kabinetdoma.ru</a>.
          </p>
        </section>

      </div>

    </div>
  );
};
