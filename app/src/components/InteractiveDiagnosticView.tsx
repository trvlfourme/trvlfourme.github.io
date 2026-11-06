import React, { useState } from 'react';
import { 
  Activity, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Share2, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  HeartPulse, 
  Sliders, 
  Clock, 
  PiggyBank, 
  Smile, 
  Zap, 
  Coffee, 
  Eye, 
  Flame, 
  BookOpen,
  Copy,
  FileText,
  Target
} from 'lucide-react';
import { NavTab } from '../types';

type TestType = 'ergonomics' | 'balance' | 'readiness' | 'savings';

interface QuestionOption {
  text: string;
  score: number;
  insight: string;
}

interface DiagnosticQuestion {
  id: number;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}

// --------------------------------------------------------------------------
// TEST 1: Ergonomic Posture & Biomechanics Audit
// --------------------------------------------------------------------------
const ERGONOMICS_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    title: '1. Положение предплечий и кистей во время работы за компьютером',
    subtitle: 'Определяет нагрузку на трапециевидные мышцы, шею и срединный нерв запястья',
    options: [
      {
        text: 'Локти висят в воздухе без опоры, плечи непроизвольно приподняты к ушам',
        score: 0,
        insight: 'Критичный фактор: постоянное статическое перенапряжение мышц шеи и верхней части спины уже через 30 минут.'
      },
      {
        text: 'Предплечья лежат на жестком остром крае столешницы, на коже остаются следы вдавливания',
        score: 1,
        insight: 'Фактор риска: сдавливание сосудов и карпального канала, риск синдрома запястного канала.'
      },
      {
        text: 'Руки лежат на столе или регулируемых подлокотниках под углом 90–100°, плечи свободно опущены',
        score: 4,
        insight: 'Оптимально: физиологический угол по ГОСТ 21889-76, плечевой пояс полностью расслаблен.'
      }
    ]
  },
  {
    id: 2,
    title: '2. Направление линии взора и высота экрана',
    subtitle: 'Каждые 2.5 см наклона головы вперед увеличивают нагрузку на шейные позвонки на 4.5 кг',
    options: [
      {
        text: 'Ноутбук стоит на плоскости стола, голова постоянно наклонена вниз на 30–45°',
        score: 0,
        insight: 'Критично: давление на межпозвонковые диски шеи эквивалентно весу в 20–27 кг!'
      },
      {
        text: 'Ноутбук приподнят на стопке книг/подставке, но приходится тянуться к клавиатуре',
        score: 2,
        insight: 'Компромисс: шея разгружена, но из-за неудобного угла клавиатуры перенапрягаются запястья.'
      },
      {
        text: 'Верхняя треть монитора находится строго на уровне глаз на расстоянии вытянутой руки (50–70 см)',
        score: 4,
        insight: 'Идеально: нейтральное положение шейного отдела позвоночника, минимальная утомляемость мышц.'
      }
    ]
  },
  {
    id: 3,
    title: '3. Опора стоп и контакт бедер с краем сиденья',
    subtitle: 'Влияет на циркуляцию венозной крови в ногах и нагрузку на крестцово-подвздошные сочленения',
    options: [
      {
        text: 'Стопы висят в воздухе или опираются только на носочки, край сиденья врезается под колени',
        score: 0,
        insight: 'Опасно: компрессия подколенных вен, высокий риск варикозного расширения вен и отечности к вечеру.'
      },
      {
        text: 'Часто поджимаю одну или обе ноги под себя на кресле, сижу «по-турецки»',
        score: 1,
        insight: 'Фактор перекоса: асимметрия таза, скручивание поясничного отдела и передавливание седалищного нерва.'
      },
      {
        text: 'Стопы полностью стоят на полу или наклонной подставке, бедра параллельны полу, есть зазор 3–5 см под коленями',
        score: 4,
        insight: 'Золотой стандарт: свободный лимфоток и равномерное распределение веса по седалищным буграм.'
      }
    ]
  },
  {
    id: 4,
    title: '4. Динамика и смена положения в течение 8-часового дня',
    subtitle: 'Длительная непрерывная неподвижность замедляет обмен веществ на 40%',
    options: [
      {
        text: 'Сижу практически непрерывно по 3–4 часа подряд без вставания, встаю только на обед',
        score: 0,
        insight: 'Гиподинамический спазм: застой крови в малом тазу, уплощение поясничного лордоза.'
      },
      {
        text: 'Встаю размяться эпизодически, когда спина или шея уже начинают сильно затекать',
        score: 2,
        insight: 'Реактивный подход: тело подает сигналы боли, сигнализируя о сформировавшемся микроспазме.'
      },
      {
        text: 'Регулярно делаю короткие 2-минутные паузы каждые 45–60 минут или чередую работу сидя и стоя',
        score: 4,
        insight: 'Отлично: активная смена поз предотвращает компрессию межпозвонковых дисков и поддерживает метаболизм.'
      }
    ]
  },
  {
    id: 5,
    title: '5. Освещенность рабочей зоны и зрительный комфорт',
    subtitle: 'Главная причина вечерней усталости глаз, рези и головной боли напряжения',
    options: [
      {
        text: 'Сижу в полутьме со светящимся монитором либо люстра за спиной дает тень на стол',
        score: 0,
        insight: 'Высокий контраст: зрачок непрерывно адаптируется между ярким экраном и темной комнатой, спазмируя цилиарную мышцу.'
      },
      {
        text: 'Настольная лампа светит прямо в монитор, создавая светлые блики на матрице',
        score: 1,
        insight: 'Блики заставляют мозг напрягать зрение, чтобы распознать текст сквозь оптический шум.'
      },
      {
        text: 'Равномерное рассеянное освещение 400–500 лк (СанПиН), свет падает сбоку, на мониторе нет бликов',
        score: 4,
        insight: 'Образцово: нулевой зрительный стресс, сохранность аккомодации глаз до конца рабочего дня.'
      }
    ]
  },
  {
    id: 6,
    title: '6. Ощущения в кисти ведущей руки (пальцы, запястье)',
    subtitle: 'Экспресс-скрининг синдрома карпального канала (RSI — Repetitive Strain Injury)',
    options: [
      {
        text: 'Периодически чувствую покалывание, онемение пальцев (большой, указательный) или ноющую боль в запястье',
        score: 0,
        insight: 'Тревожный маркер: признаки компрессии срединного нерва из-за неестественного излома кисти.'
      },
      {
        text: 'Тяжесть и скованность в запястье появляются только к вечеру после активных созвонов и монтажа/скролла',
        score: 2,
        insight: 'Начальная усталость: связочному аппарату не хватает анатомической нейтральности.'
      },
      {
        text: 'Кисть и пальцы чувствуют себя легко и свободно, никаких болевых ощущений нет',
        score: 4,
        insight: 'Прекрасно: здоровая биомеханика движений при работе с манипуляторами.'
      }
    ]
  }
];

// --------------------------------------------------------------------------
// TEST 2: Work-Life Boundaries & Burnout Audit
// --------------------------------------------------------------------------
const BALANCE_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    title: '1. Окончание рабочего дня и ритуал отключения',
    subtitle: 'На удаленке офис переехал в квартиру — есть ли у вашего мозга четкий финал дня?',
    options: [
      {
        text: 'Рабочий день не заканчивается: ноутбук открыт до ночи, проверяю чаты перед сном в кровати',
        score: 0,
        insight: 'Стертая граница: мозг круглосуточно находится в фазе сканирования угроз и рабочих задач.'
      },
      {
        text: 'Формально закрываю ноутбук в 19:00, но телефон непрерывно пиликает уведомлениями до ночи',
        score: 1,
        insight: 'Иллюзия отдыха: фоновый шум рабочих мессенджеров не позволяет восстановить нервную систему.'
      },
      {
        text: 'Четкий стоп: в фиксированное время ноутбук закрывается и убирается, уведомления глушатся',
        score: 4,
        insight: 'Здоровая граница: полноценное переключение в режим восстановления и личной жизни.'
      }
    ]
  },
  {
    id: 2,
    title: '2. Психологическое чувство вины за отдых в рабочее время',
    subtitle: 'Внутренний надсмотрщик — главный скрытый триггер удаленного эмоционального истощения',
    options: [
      {
        text: 'Постоянно гложет тревога: «Я дома, значит должен работать усерднее», боюсь отойти от компьютера на 10 минут',
        score: 0,
        insight: 'Синдром гиперкомпенсации: страх показаться «бездельником» ведет к выгоранию за 3–6 месяцев.'
      },
      {
        text: 'Иногда нервничаю, если не ответил в чате в течение 5 минут, спешу оправдаться',
        score: 2,
        insight: 'Тревожность доступности: культура синхронной реактивности мешает глубокому погружению.'
      },
      {
        text: 'Спокойно отношусь к паузам: результат оценивается по закрытым задачам, а не по скорости кликов',
        score: 4,
        insight: 'Зрелая профессиональная позиция: фокус на ценности и уважение к биологическим ритмам.'
      }
    ]
  },
  {
    id: 3,
    title: '3. Физическое зонирование пространства квартиры',
    subtitle: 'Ассоциативные связи мозга: «где я нахожусь, то я и делаю»',
    options: [
      {
        text: 'Работаю где придется: в постели, на диване, на кухонном табурете — вся квартира стала офисом',
        score: 0,
        insight: 'Разрушение якорей отдыха: спальня перестает ассоциироваться со сном, растет бессонница.'
      },
      {
        text: 'Стол стоит в спальне или гостиной на виду, ноутбук постоянно открыт прямо перед глазами',
        score: 2,
        insight: 'Визуальный стресс: вид рабочего экрана во время отдыха провоцирует микровыбросы кортизола.'
      },
      {
        text: 'Выделенный рабочий угол; в нерабочее время ноутбук закрывается или зона стола физически скрыта',
        score: 4,
        insight: 'Четкая пространственная сепарация: дом остается безопасной гаванью для восстановления сил.'
      }
    ]
  },
  {
    id: 4,
    title: '4. Восстановление ресурса и контакт со свежим воздухом',
    subtitle: 'Свет, шаги и природа — естественные регуляторы нейромедиаторов дофамина и серотонина',
    options: [
      {
        text: 'Могу не выходить из квартиры по 3–5 дней подряд, физическая активность минимальна',
        score: 0,
        insight: 'Сенсорная депривация и гиподинамия: резкое падение уровня энергии, апатия, затуманивание мыслей.'
      },
      {
        text: 'Выхожу из дома эпизодически — до ближайшего супермаркета или вынести мусор',
        score: 1,
        insight: 'Дефицит дневного света: сбиваются циркадные ритмы, падает глубина ночного сна.'
      },
      {
        text: 'Ежедневно выхожу на прогулку минимум на 20–30 минут при дневном свете, есть регулярный спорт',
        score: 4,
        insight: 'Идеальная декомпрессия: утилизация кортизола через движение и подзарядка светом.'
      }
    ]
  },
  {
    id: 5,
    title: '5. Вечерний свет и сон после дня перед экранами',
    subtitle: 'Синий спектр матриц экранов блокирует гормон сна мелатонин на 3–4 часа',
    options: [
      {
        text: 'Листаю ленты соцсетей и рабочие чаты в темноте прямо перед засыпанием, часто трудно уснуть',
        score: 0,
        insight: 'Световая бессонница: мелатонин подавлен, поверхностный прерывистый сон без фазы глубокого восстановления.'
      },
      {
        text: 'Выключаю рабочий ноутбук за 30 минут до сна, но в комнате горит яркий холодный верхний свет',
        score: 2,
        insight: 'Спектральный конфликт: холодный свет 4000–6000K сообщает эпифизу, что сейчас полдень.'
      },
      {
        text: 'За 1.5–2 часа до сна перехожу на теплый янтарный свет 2700K без синего спектра, откладываю экраны',
        score: 4,
        insight: 'Биологическая норма: естественный пик мелатонина к 23:00 и глубокая регенерация мозга.'
      }
    ]
  }
];

// --------------------------------------------------------------------------
// TEST 3: Remote Readiness & Autonomous Work Diagnostic
// --------------------------------------------------------------------------
const READINESS_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    title: '1. Управление временем при отсутствии начальника над душой',
    subtitle: 'Как вы справляетесь со свободой самостоятельного планирования дня?',
    options: [
      {
        text: 'Тяжело: легко отвлекаюсь на домашние дела, холодильник и соцсети, а к вечеру в панике доделываю работу',
        score: 0,
        insight: 'Сложность саморегуляции: отсутствие внешних рамок провоцирует прокрастинацию и вечерний аврал.'
      },
      {
        text: 'Справляюсь с дедлайнами, но график неровный: то работаю запоем, то полдня раскачиваюсь',
        score: 2,
        insight: 'Стихийная продуктивность: зависимость от вдохновения и приливов адреналина.'
      },
      {
        text: 'Уверенно структурирую день: делю время на спринты концентрации (Pomodoro) и четкие блоки отдыха',
        score: 4,
        insight: 'Высокая автономия: системное планирование экономит до 2 часов рабочего времени ежедневно.'
      }
    ]
  },
  {
    id: 2,
    title: '2. Потребность в социализации и живом человеческом общении',
    subtitle: 'Удаленная работа обнажает потребность в экстравертных контактах',
    options: [
      {
        text: 'Тяжело переношу тишину: мне жизненно необходимы живые шутки у кофемашины, живая энергия команды',
        score: 0,
        insight: 'Социальный экстраверт: полная изоляция дома быстро приводит к чувству одиночества и снижению тонуса.'
      },
      {
        text: 'Нормально отношусь к изоляции, но 1–2 раза в неделю хочется увидеть коллег или друзей очно',
        score: 2,
        insight: 'Гибридный склад: идеальный формат — 3 дня дома и 2 дня в офисе или коворкинге.'
      },
      {
        text: 'Обожаю тишину: в уединении моя концентрация и скорость закрытия сложных задач возрастают в разы',
        score: 4,
        insight: 'Прирожденный практик глубокого фокуса (Deep Work): домашняя среда раскрывает максимум потенциала.'
      }
    ]
  },
  {
    id: 3,
    title: '3. Асинхронная коммуникация и формулирование мыслей',
    subtitle: 'Основа эффективной работы в распределенных командах — культура текста',
    options: [
      {
        text: 'Предпочитаю сразу созваниваться по любому вопросу, писать длинные подробные сообщения лень',
        score: 0,
        insight: 'Синхронная зависимость: частые спонтанные созвоны дробят рабочий день коллег на мелкие осколки.'
      },
      {
        text: 'Пишу текстом, но иногда раздражает, если ответа приходится ждать несколько часов',
        score: 2,
        insight: 'Привыкание к асинхрону: необходимо развивать терпение и умение переключаться на параллельные задачи.'
      },
      {
        text: 'Умею излагать суть структурированно, прикладывать контекст и ссылки, ценю асинхронный регламент',
        score: 4,
        insight: 'Золотой стандарт распределенной работы: уважение ко времени коллег и нулевая трата часов на пустые митинги.'
      }
    ]
  },
  {
    id: 4,
    title: '4. Реагирование на бытовой шум и домашние раздражители',
    subtitle: 'Звуки за стеной, дети, домашние животные, шум улицы',
    options: [
      {
        text: 'Любой шорох выбивает из колеи, начинаю раздражаться на близких и срываться',
        score: 0,
        insight: 'Слуховая сенситивность: отсутствие звуковой гигиены держит нервную систему в постоянном напряжении.'
      },
      {
        text: 'Шум мешает только во время сложных аналитических задач или важных созвонов',
        score: 2,
        insight: 'Базовая адаптация: требуется инструмент точечной защиты фокуса в критические часы.'
      },
      {
        text: 'Научился отсекать шум (договоренности с семьей, правила тишины, беруши или шумоподавление)',
        score: 4,
        insight: 'Отличная психоэмоциональная защита: стабильная рабочая производительность.'
      }
    ]
  }
];

interface InteractiveDiagnosticViewProps {
  onNav?: (tab: NavTab) => void;
  onSelectArticle?: (slugOrId: string) => void;
}

export const InteractiveDiagnosticView: React.FC<InteractiveDiagnosticViewProps> = ({ 
  onNav,
  onSelectArticle
}) => {
  const [activeTest, setActiveTest] = useState<TestType>('ergonomics');

  // Test 1: Ergonomics State
  const [ergoAnswers, setErgoAnswers] = useState<number[]>([]);
  const [ergoCurrentStep, setErgoCurrentStep] = useState(0);
  const [ergoFinished, setErgoFinished] = useState(false);

  // Test 2: Balance State
  const [balanceAnswers, setBalanceAnswers] = useState<number[]>([]);
  const [balanceCurrentStep, setBalanceCurrentStep] = useState(0);
  const [balanceFinished, setBalanceFinished] = useState(false);

  // Test 3: Readiness State
  const [readinessAnswers, setReadinessAnswers] = useState<number[]>([]);
  const [readinessCurrentStep, setReadinessCurrentStep] = useState(0);
  const [readinessFinished, setReadinessFinished] = useState(false);

  // Tool 4: Savings Calculator State
  const [remoteDaysPerWeek, setRemoteDaysPerWeek] = useState<number>(5);
  const [commuteMinutesOneWay, setCommuteMinutesOneWay] = useState<number>(50);
  const [dailyTransportCost, setDailyTransportCost] = useState<number>(140);
  const [dailyLunchCoffeeCost, setDailyLunchCoffeeCost] = useState<number>(450);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // --------------------------------------------------------------------------
  // Handlers for Test 1 (Ergonomics)
  // --------------------------------------------------------------------------
  const handleSelectErgoOption = (score: number) => {
    const updated = [...ergoAnswers, score];
    setErgoAnswers(updated);
    if (ergoCurrentStep + 1 < ERGONOMICS_QUESTIONS.length) {
      setErgoCurrentStep(s => s + 1);
    } else {
      setErgoFinished(true);
    }
  };

  const handleResetErgo = () => {
    setErgoAnswers([]);
    setErgoCurrentStep(0);
    setErgoFinished(false);
  };

  // --------------------------------------------------------------------------
  // Handlers for Test 2 (Balance)
  // --------------------------------------------------------------------------
  const handleSelectBalanceOption = (score: number) => {
    const updated = [...balanceAnswers, score];
    setBalanceAnswers(updated);
    if (balanceCurrentStep + 1 < BALANCE_QUESTIONS.length) {
      setBalanceCurrentStep(s => s + 1);
    } else {
      setBalanceFinished(true);
    }
  };

  const handleResetBalance = () => {
    setBalanceAnswers([]);
    setBalanceCurrentStep(0);
    setBalanceFinished(false);
  };

  // --------------------------------------------------------------------------
  // Handlers for Test 3 (Readiness)
  // --------------------------------------------------------------------------
  const handleSelectReadinessOption = (score: number) => {
    const updated = [...readinessAnswers, score];
    setReadinessAnswers(updated);
    if (readinessCurrentStep + 1 < READINESS_QUESTIONS.length) {
      setReadinessCurrentStep(s => s + 1);
    } else {
      setReadinessFinished(true);
    }
  };

  const handleResetReadiness = () => {
    setReadinessAnswers([]);
    setReadinessCurrentStep(0);
    setReadinessFinished(false);
  };

  // --------------------------------------------------------------------------
  // Diagnosis Calculations (Pure Evidence-Based Assessment)
  // --------------------------------------------------------------------------
  const getErgoReport = () => {
    const maxScore = ERGONOMICS_QUESTIONS.length * 4; // 24
    const totalScore = ergoAnswers.reduce((a, b) => a + b, 0);
    const percent = Math.round((totalScore / maxScore) * 100);

    if (totalScore <= 9) {
      return {
        level: 'danger',
        score: totalScore,
        percent,
        badge: 'Критическая зона: высокий риск постурального синдрома',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        title: 'Рабочее место перегружает позвоночник и сосуды',
        description: 'Ваше текущее положение тела создает избыточную компрессионную нагрузку на шейные позвонки, пережимает подколенные вены и держит плечевой пояс в спазме. Это приводит к хронической головной боли к вечеру и быстрой утомляемости.',
        riskFactors: [
          'Шейный гиперлордоз: голова наклонена вниз, нагрузка на позвонки эквивалентна 20+ кг.',
          'Пережатие сосудов малого таза и бедер: застой крови из-за отсутствия опоры стоп.',
          'Статический спазм трапециевидных мышц из-за нависания локтей без опоры.'
        ],
        actionPlan: [
          'Поднимите экран ноутбука: используйте стопку книг или коробку, чтобы верхняя рамка экрана оказалась на уровне зрачков. Клавиатуру подключите внешнюю.',
          'Поставьте под стопы жесткую коробку из-под обуви или устойчивую подставку, чтобы бедра были строго параллельны полу.',
          'Внедрите правило «45/5»: по таймеру вставайте каждые 45 минут на 2 минуты легкой разминки (вращения плечами, наклоны головы).'
        ],
        relatedArticleSlug: 'kuda-postavit-rabochij-stol-okno-batareya-rozetki'
      };
    }

    if (totalScore <= 17) {
      return {
        level: 'warning',
        score: totalScore,
        percent,
        badge: 'Умеренная зона: базовая посадка с точечными перегрузками',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        title: 'Базовый комфорт есть, но накапливается скрытая усталость',
        description: 'Вы интуитивно настроили рабочее место, однако локальные эргономические недочеты (недостаточный свет, редкая смена поз или контакт запястья с ребром стола) вызывают микроспазмы и снижают глубину концентрации к 16:00.',
        riskFactors: [
          'Зрительный дисбаланс: контраст между монитором и неосвещенной комнатой утомляет глаза.',
          'Усталость связочного аппарата кисти при продолжительном скроллинге без опоры предплечья.',
          'Недостаточная частота двигательных микропауз в середине рабочего дня.'
        ],
        actionPlan: [
          'Сбалансируйте свет: организуйте мягкий рассеянный боковой свет, устраните белые блики на матрице экрана.',
          'Отрегулируйте высоту сиденья так, чтобы локти опирались под углом 90–100° без подъема плеч вверх.',
          'Делайте пальчиковую гимнастику и круговые вращения кистями 2 раза в день для профилактики туннельного синдрома.'
        ],
        relatedArticleSlug: 'stol-s-elektroprivodom-vs-obychnyj'
      };
    }

    return {
      level: 'good',
      score: totalScore,
      percent,
      badge: 'Зеленая зона: превосходная эргономическая культура',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      title: 'Ваше тело защищено от статических перегрузок',
      description: 'Вы соблюдаете ключевые биомеханические нормы: шея находится в нейтральном положении, стопы стабильно опираются, а свет распределен равномерно. Это сохраняет вашу энергию и ясность мышления на протяжении всего дня.',
      riskFactors: [
        'Единственный фактор контроля — следить за поддержанием водного баланса и проветриванием комнаты (CO2 < 800 ppm).'
      ],
      actionPlan: [
        'Поддерживайте привычку регулярных двигательных пауз каждые 50 минут.',
        'Добавьте в вечерний распорядок 10 минут мягкой растяжки грудного отдела и спины.',
        'Проветривайте комнату каждые 2 часа: свежий кислород поддерживает скорость нейронных связей.'
      ],
      relatedArticleSlug: 'stol-s-elektroprivodom-vs-obychnyj'
    };
  };

  const getBalanceReport = () => {
    const maxScore = BALANCE_QUESTIONS.length * 4; // 20
    const totalScore = balanceAnswers.reduce((a, b) => a + b, 0);
    const percent = Math.round((totalScore / maxScore) * 100);

    if (totalScore <= 7) {
      return {
        level: 'danger',
        score: totalScore,
        percent,
        badge: 'Высокий риск выгорания: диффузные границы дома и работы',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        title: 'Острый дефицит декомпрессии и психологических границ',
        description: 'Ваш дом превратился в круглосуточный филиал офиса. Отсутствие фиксированного финала дня, вечерние уведомления и работа в зоне сна держат уровень кортизола на постоянно высоком уровне. Организм не успевает восстанавливаться за ночь.',
        recommendations: [
          'Железное правило 19:00: закрывайте крышку ноутбука и физически убирайте его в шкаф или ящик. Экран не должен быть на виду.',
          'Табу на работу в постели: спальня должна вызывать у мозга строго ассоциацию со сном и безопасностью.',
          'Внедрите ритуал «Виртуальная дорога домой»: 15–20 минут спокойной прогулки на свежем воздухе сразу после окончания рабочего дня.'
        ],
        mindsetTip: 'Помните: круглосуточная доступность в чатах — это не признак профессионализма, а симптом неорганизованных процессов.'
      };
    }

    if (totalScore <= 14) {
      return {
        level: 'warning',
        score: totalScore,
        percent,
        badge: 'Умеренная зона: периодический перегруз и фоновая тревога',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        title: 'Границы установлены, но периодически дают сбой',
        description: 'Вам удается контролировать рабочий день, но в периоды сдачи проектов или повышенной нагрузки вы жертвуете сном, прогулками и вечерней тишиной. Фоновое чувство вины за отдых мешает полноценно расслабиться.',
        recommendations: [
          'Включите автоматический профиль «Не беспокоить» на телефоне с 19:30 до 08:30 для рабочих чатов.',
          'Составляйте список «3 главных результата дня» с утра: когда они выполнены, разрешайте себе отдыхать с чистой совестью.',
          'За 2 часа до сна переходите на приглушенный теплый свет (2700K) и убирайте экраны со светящейся синей матрицей.'
        ],
        mindsetTip: 'Качественный отдых — это прямая профессиональная обязанность. Уставший мозг совершает в 3 раза больше ошибок.'
      };
    }

    return {
      level: 'good',
      score: totalScore,
      percent,
      badge: 'Гармоничный баланс: крепкие границы и здоровая психогигиена',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      title: 'Образцовый баланс работы и личной жизни',
      description: 'Вы выстроили четкую культуру присутствия: работаете сфокусированно в рабочие часы и качественно восстанавливаетесь вечером. Ваша нервная система защищена от хронического стресса и эмоционального истощения.',
      recommendations: [
        'Продолжайте соблюдать ритуал завершения дня и регулярные паузы на свежий воздух.',
        'Делитесь своим опытом асинхронной коммуникации с коллегами: это оздоравливает культуру всей команды.',
        'Сохраняйте правило экрано-детокса перед сном для поддержания глубоких фаз сна.'
      ],
      mindsetTip: 'Вы нашли золотую пропорцию: высокая продуктивность без выгорания и потери радости жизни.'
    };
  };

  const getReadinessReport = () => {
    const maxScore = READINESS_QUESTIONS.length * 4; // 16
    const totalScore = readinessAnswers.reduce((a, b) => a + b, 0);

    if (totalScore <= 6) {
      return {
        type: 'office',
        title: '🏢 Архетип: «Офисный синхронист (Командный экстраверт)»',
        badge: 'Тяготеет к офисной среде и очному формату',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        summary: 'Вам жизненно необходимы внешние рамки, живая энергия команды и непосредственный контакт с коллегами. В четырех стенах дома вам сложно удерживать темп без внешнего ритма, а тишина может вызывать апатию.',
        strengths: ['Мгновенное включение в командную динамику', 'Отличные навыки очной фасилитации и переговоров'],
        blindSpots: ['Трудности с самоорганизацией без внешних стимулов', 'Быстрое падение мотивации при длительной изоляции'],
        recommendation: 'Оптимальный для вас формат — гибрид (2–3 дня в офисе или коворкинге). Дома планируйте рутинные механические задачи, а сложные креативы и брейнштормы выносите на дни очных встреч.'
      };
    }

    if (totalScore <= 11) {
      return {
        type: 'hybrid',
        title: '⚖️ Архетип: «Гибридный балансир (Оптимизатор сред)»',
        badge: 'Идеален для формата 3 дня дома / 2 дня в офисе',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        summary: 'Вы гибко берете лучшее от обоих форматов: цените тишину домашнего кабинета для решения сложных глубоких задач без помех, но периодически нуждаетесь в очном общении с коллегами для калибровки целей.',
        strengths: ['Умение переключаться между форматами', 'Сбалансированное отношение к синхрону и асинхрону'],
        blindSpots: ['Риск размытия фокуса в домашние дни, если не выстроено расписание'],
        recommendation: 'Четко разделите календарь: дни дома посвящайте автономной аналитике и коду (Deep Work), а офисные дни — встречам, синками и проектным обсуждениям.'
      };
    }

    return {
      type: 'deep-work',
      title: '🧠 Архетип: «Автономный мастер (Deep Work Practitioner)»',
      badge: '100% Готовность к полной удаленке',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      summary: 'Вы принадлежите к категории специалистов, чья продуктивность вне офиса возрастает на 30–50%. Вы виртуозно управляете своим календарем, мыслите результатами и цените тишину для глубокой концентрации.',
      strengths: ['Высокая дисциплина и самомотивация', 'Отточенные навыки асинхронной коммуникации'],
      blindSpots: ['Риск ухода в гиподинамию: можете не замечать, как проходят дни без выхода на улицу'],
      recommendation: 'Обязательно внедрите принудительные паузы движения и социализации: спортзал, прогулки, встречи с друзьями вне работы, чтобы исключить социальную депривацию.'
    };
  };

  // Savings Calculations
  const workingWeeksPerYear = 48;
  const workingDaysPerYear = remoteDaysPerWeek * workingWeeksPerYear;
  const hoursSavedCommutePerYear = Math.round((commuteMinutesOneWay * 2 * workingDaysPerYear) / 60);
  const fullDaysOfLifeSaved = (hoursSavedCommutePerYear / 24).toFixed(1);
  const moneySavedTransport = dailyTransportCost * workingDaysPerYear;
  const moneySavedFood = dailyLunchCoffeeCost * workingDaysPerYear;
  const totalMoneySavedPerYear = moneySavedTransport + moneySavedFood;

  const ergoReport = getErgoReport();
  const balanceReport = getBalanceReport();
  const readinessReport = getReadinessReport();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-lg border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Экспертная диагностика KabinetDoma.ru
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
          Тесты и калькуляторы удаленной работы
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Научно обоснованная диагностика без рекламы: оцените физическую эргономику тела, 
          уровень защиты от выгорания, психотип удаленщика или посчитайте сэкономленные часы жизни.
        </p>
      </div>

      {/* 4-Tab Segmented Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1.5 bg-stone-200/90 rounded-2xl max-w-3xl mx-auto mb-10">
        <button
          onClick={() => setActiveTest('ergonomics')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTest === 'ergonomics'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-500" />
          <span>Аудит тела и осанки</span>
        </button>

        <button
          onClick={() => setActiveTest('balance')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTest === 'balance'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Баланс и выгорание</span>
        </button>

        <button
          onClick={() => setActiveTest('readiness')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTest === 'readiness'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-purple-600" />
          <span>Психотип и автономия</span>
        </button>

        <button
          onClick={() => setActiveTest('savings')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTest === 'savings'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <PiggyBank className="w-4 h-4 text-emerald-600" />
          <span>Часы жизни и бюджет</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TEST 1: ERGONOMICS AUDIT */}
      {/* ======================================================== */}
      {activeTest === 'ergonomics' && (
        <div>
          {!ergoFinished ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-10">
              
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
                  <span>Вопрос {ergoCurrentStep + 1} из {ERGONOMICS_QUESTIONS.length}</span>
                  <span>{Math.round(((ergoCurrentStep + 1) / ERGONOMICS_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${((ergoCurrentStep + 1) / ERGONOMICS_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-2 leading-snug">
                  {ERGONOMICS_QUESTIONS[ergoCurrentStep].title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600">
                  {ERGONOMICS_QUESTIONS[ergoCurrentStep].subtitle}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {ERGONOMICS_QUESTIONS[ergoCurrentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectErgoOption(opt.score)}
                    className="w-full text-left p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group flex items-start gap-4 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-stone-300 group-hover:border-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-stone-500 group-hover:text-amber-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm sm:text-base text-stone-900 mb-1 group-hover:text-amber-950">
                        {opt.text}
                      </div>
                      <div className="text-xs text-stone-500 leading-relaxed">
                        {opt.insight}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 flex-shrink-0 self-center transition-colors" />
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* Results Screen: Pure Diagnostic Report */
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs">
                
                {/* Result Header */}
                <div className="pb-6 border-b border-stone-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${ergoReport.badgeColor}`}>
                      {ergoReport.badge}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-500">
                      Индекс эргономики: {ergoReport.percent}% ({ergoReport.score} из 24)
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {ergoReport.title}
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-stone-700 leading-relaxed py-6">
                  {ergoReport.description}
                </p>

                {/* Risk Factors */}
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl mb-6 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Выявленные зоны биомеханического риска:
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700">
                    {ergoReport.riskFactors.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Plan */}
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-8 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Персональный план коррекции (бесплатные шаги):
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-800">
                    {ergoReport.actionPlan.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-emerald-700 flex-shrink-0">{i + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons & Retake */}
                <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={handleResetErgo}
                    className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Пройти диагностику заново
                  </button>

                  <div className="flex items-center gap-3">
                    {onNav && (
                      <button
                        onClick={() => onNav('calculator')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Рассчитать высоту стола
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const summary = `Мой результат эргономического аудита: ${ergoReport.percent}% (${ergoReport.title}). Проверьте свое рабочее место на kabinetdoma.ru`;
                        navigator.clipboard?.writeText(summary);
                        showToast('Результат скопирован в буфер обмена!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Скопировать отчет
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TEST 2: WORK-LIFE BALANCE & BURNOUT */}
      {/* ======================================================== */}
      {activeTest === 'balance' && (
        <div>
          {!balanceFinished ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-10">
              
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
                  <span>Вопрос {balanceCurrentStep + 1} из {BALANCE_QUESTIONS.length}</span>
                  <span>{Math.round(((balanceCurrentStep + 1) / BALANCE_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${((balanceCurrentStep + 1) / BALANCE_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-2 leading-snug">
                  {BALANCE_QUESTIONS[balanceCurrentStep].title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600">
                  {BALANCE_QUESTIONS[balanceCurrentStep].subtitle}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {BALANCE_QUESTIONS[balanceCurrentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectBalanceOption(opt.score)}
                    className="w-full text-left p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group flex items-start gap-4 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-stone-300 group-hover:border-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-stone-500 group-hover:text-amber-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm sm:text-base text-stone-900 mb-1 group-hover:text-amber-950">
                        {opt.text}
                      </div>
                      <div className="text-xs text-stone-500 leading-relaxed">
                        {opt.insight}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 flex-shrink-0 self-center transition-colors" />
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* Results Screen: Balance Report */
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs">
                
                {/* Header */}
                <div className="pb-6 border-b border-stone-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${balanceReport.badgeColor}`}>
                      {balanceReport.badge}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-500">
                      Индекс баланса: {balanceReport.percent}%
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {balanceReport.title}
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-stone-700 leading-relaxed py-6">
                  {balanceReport.description}
                </p>

                {/* Mindset Quote */}
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-purple-950 text-xs sm:text-sm mb-6 flex items-start gap-3">
                  <HeartPulse className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Принцип редакции: </span>
                    {balanceReport.mindsetTip}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl mb-8 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Алгоритм восстановления психологических границ:
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                    {balanceReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-stone-900 flex-shrink-0">{i + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={handleResetBalance}
                    className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Пройти диагностику заново
                  </button>

                  <div className="flex items-center gap-3">
                    {onNav && (
                      <button
                        onClick={() => onNav('articles')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Читать гайды по балансу
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const summary = `Мой индекс Work-Life Balance: ${balanceReport.percent}% (${balanceReport.title}). Проверьте свой баланс на kabinetdoma.ru`;
                        navigator.clipboard?.writeText(summary);
                        showToast('Результат скопирован в буфер обмена!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Скопировать отчет
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TEST 3: REMOTE READINESS & ARCHETYPE */}
      {/* ======================================================== */}
      {activeTest === 'readiness' && (
        <div>
          {!readinessFinished ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-10">
              
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
                  <span>Вопрос {readinessCurrentStep + 1} из {READINESS_QUESTIONS.length}</span>
                  <span>{Math.round(((readinessCurrentStep + 1) / READINESS_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${((readinessCurrentStep + 1) / READINESS_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-2 leading-snug">
                  {READINESS_QUESTIONS[readinessCurrentStep].title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600">
                  {READINESS_QUESTIONS[readinessCurrentStep].subtitle}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {READINESS_QUESTIONS[readinessCurrentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectReadinessOption(opt.score)}
                    className="w-full text-left p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all group flex items-start gap-4 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-stone-300 group-hover:border-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-stone-500 group-hover:text-purple-600">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm sm:text-base text-stone-900 mb-1 group-hover:text-purple-950">
                        {opt.text}
                      </div>
                      <div className="text-xs text-stone-500 leading-relaxed">
                        {opt.insight}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-purple-500 flex-shrink-0 self-center transition-colors" />
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* Results Screen: Archetype Report */
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs">
                
                {/* Header */}
                <div className="pb-6 border-b border-stone-200">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${readinessReport.badgeColor}`}>
                    {readinessReport.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {readinessReport.title}
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-stone-700 leading-relaxed py-6">
                  {readinessReport.summary}
                </p>

                {/* Strengths & Blindspots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
                    <div className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Ваши сильные стороны:
                    </div>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {readinessReport.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                    <div className="font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Зоны риска на удаленке:
                    </div>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {readinessReport.blindSpots.map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Practical recommendation */}
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl mb-8 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-purple-600" />
                    Рекомендация по организации рабочего формата:
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {readinessReport.recommendation}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={handleResetReadiness}
                    className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Пройти заново
                  </button>

                  <button
                    onClick={() => {
                      const summary = `Мой психотип удаленщика: ${readinessReport.title}. Пройдите тест на kabinetdoma.ru`;
                      navigator.clipboard?.writeText(summary);
                      showToast('Результат скопирован в буфер обмена!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Скопировать результат
                  </button>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TOOL 4: SAVINGS CALCULATOR */}
      {/* ======================================================== */}
      {activeTest === 'savings' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 bg-emerald-100 text-emerald-900 border-emerald-300">
              Калькулятор свободы
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Сколько часов жизни и денег экономит вам удаленка
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Дневная дорога в офис на метро или в пробках — это невидимый вор времени. 
              Оцените реальный масштаб сэкономленных ресурсов за 1 рабочий год.
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Дней удаленки в неделю:</span>
                <span className="font-mono text-emerald-700 font-extrabold text-sm">{remoteDaysPerWeek} дн.</span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={remoteDaysPerWeek}
                onChange={(e) => setRemoteDaysPerWeek(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>1 день (гибрид)</span>
                <span>5 дней (полная)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Время в дороге в 1 сторону:</span>
                <span className="font-mono text-emerald-700 font-extrabold text-sm">{commuteMinutesOneWay} мин</span>
              </div>
              <input 
                type="range"
                min="15"
                max="120"
                step="5"
                value={commuteMinutesOneWay}
                onChange={(e) => setCommuteMinutesOneWay(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>15 минут</span>
                <span>2 часа</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Проезд в день (метро/бензин):</span>
                <span className="font-mono text-emerald-700 font-extrabold text-sm">{dailyTransportCost} ₽</span>
              </div>
              <input 
                type="range"
                min="60"
                max="800"
                step="20"
                value={dailyTransportCost}
                onChange={(e) => setDailyTransportCost(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Бизнес-ланчи и офисный кофе:</span>
                <span className="font-mono text-emerald-700 font-extrabold text-sm">{dailyLunchCoffeeCost} ₽</span>
              </div>
              <input 
                type="range"
                min="150"
                max="1200"
                step="50"
                value={dailyLunchCoffeeCost}
                onChange={(e) => setDailyLunchCoffeeCost(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Big Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-300 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase font-extrabold text-amber-900 tracking-wider mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Сэкономлено времени:
                </div>
                <div className="font-mono text-4xl sm:text-5xl font-black text-stone-900 tracking-tight my-2">
                  {hoursSavedCommutePerYear} <span className="text-lg font-bold text-stone-500">часов</span>
                </div>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed pt-3 border-t border-amber-200">
                Это эквивалентно <strong>{fullDaysOfLifeSaved} полным суткам чистой жизни</strong> в год, которые вы подарили семье, сну и хобби вместо давки в транспорте.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-300 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase font-extrabold text-emerald-900 tracking-wider mb-2">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  Сохранено семейного бюджета:
                </div>
                <div className="font-mono text-4xl sm:text-5xl font-black text-stone-900 tracking-tight my-2">
                  {totalMoneySavedPerYear.toLocaleString()} <span className="text-lg font-bold text-stone-500">₽ / год</span>
                </div>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed pt-3 border-t border-emerald-200">
                Этих средств с избытком хватает на первоклассный подъемный стол, ортопедическое кресло и обустройство идеального домашнего кабинета.
              </p>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              Расчет основан на 48 рабочих неделях в году (за вычетом 4 недель отпуска).
            </div>

            <button
              onClick={() => {
                const summary = `Благодаря удаленке я экономлю ${hoursSavedCommutePerYear} часов дороги (${fullDaysOfLifeSaved} суток жизни!) и ${totalMoneySavedPerYear.toLocaleString()} ₽ в год. Рассчитайте свои ресурсы на kabinetdoma.ru`;
                navigator.clipboard?.writeText(summary);
                showToast('Расчет скопирован в буфер обмена!');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Скопировать свой расчет
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
