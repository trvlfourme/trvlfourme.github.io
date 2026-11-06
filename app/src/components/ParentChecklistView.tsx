import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles,
  Volume2,
  VolumeX,
  Smile,
  ShieldAlert
} from 'lucide-react';
import { ChecklistTask } from '../types';

const INITIAL_TASKS: ChecklistTask[] = [
  {
    id: 'task-morning-fuel',
    title: '«Эмоциональная заправка»: 15–20 минут качественного контакта до включения ноутбука',
    description: 'Обнимитесь, соберите вместе короткую башню или приготовьте завтрак без телефона в руках. Насыщенный вниманием ребенок в 3 раза реже требует контакта в первые 2 часа вашего рабочего дня.',
    category: 'morning',
    completed: false,
    importance: 'critical',
    proTip: 'Телефон держите в другой комнате до 09:00.'
  },
  {
    id: 'task-busy-box',
    title: 'Автономная «коробка сокровищ» (выдавать строго во время созвонов)',
    description: 'Спрячьте коробку с редкими игрушками (кинетический песок, наклейки, пазлы, новые фломастеры). Она достается ТОЛЬКО когда включается красный сигнал светофора.',
    category: 'focus-call',
    completed: false,
    importance: 'critical',
    proTip: 'Меняйте состав коробки раз в 3 дня, чтобы не угасал эффект новизны.'
  },
  {
    id: 'task-audio-shield',
    title: 'Акустический барьер: генератор розового шума или вентилятор у двери',
    description: 'Поставьте источник монотонного шума между вашей рабочей зоной и игровой. Это маскирует ваш голос для ребенка и звуки игр для вашего микрофона.',
    category: 'focus-call',
    completed: false,
    importance: 'high',
    proTip: 'Розовый шум мягче белого и не раздражает нервную систему малыша.'
  },
  {
    id: 'task-traffic-light',
    title: 'Выставить визуальный индикатор «Светофор» на видное ребенку место',
    description: 'Красный кружок — тишина, папа/мама на звонке. Зеленый кружок — перерыв, можно обняться.',
    category: 'kids-boundary',
    completed: false,
    importance: 'critical'
  },
  {
    id: 'task-hardware-mute',
    title: 'Проверить аппаратную кнопку Mute на микрофоне перед входом в Zoom/Телемост',
    description: 'Никаких кликов мышкой в панике. Кнопка глушения должна быть под рукой на проводе или штанге.',
    category: 'focus-call',
    completed: false,
    importance: 'high'
  },
  {
    id: 'task-evening-close',
    title: 'Ритуал закрытия офиса: захлопнуть крышку ноутбука в 18:30',
    description: 'Покажите ребенку физический жест окончания рабочего дня. Переоденьте рабочую рубашку в домашнюю футболку.',
    category: 'evening',
    completed: false,
    importance: 'high',
    proTip: 'Если граница размыта, ребенок будет требовать внимания круглосуточно.'
  }
];

export const ParentChecklistView: React.FC = () => {
  const [tasks, setTasks] = useState<ChecklistTask[]>(() => {
    try {
      const saved = localStorage.getItem('h4w_parent_checklist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TASKS;
  });

  // Traffic Light state
  const [trafficColor, setTrafficColor] = useState<'red' | 'yellow' | 'green'>('green');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 25-minute Pomodoro Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem('h4w_parent_checklist', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (soundEnabled) {
        // play simple Web Audio API chime
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch {}
      }
      setTrafficColor('green');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, soundEnabled]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTrafficChange = (color: 'red' | 'yellow' | 'green') => {
    setTrafficColor(color);
    if (color === 'red') {
      // automatically start 25 min timer
      setTimerSeconds(25 * 60);
      setIsTimerRunning(true);
    } else if (color === 'green') {
      setIsTimerRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="text-xs uppercase tracking-wider font-semibold text-rose-800 mb-2 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5" />
          Психологический протокол & тайм-менеджмент
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
          Чек-лист тишины и продуктивной работы с детьми дома
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Проверено на личном опыте удаленщиков с детьми от 1 до 7 лет. 
          Система заменяет бесконечные ссоры и шиканье понятными визуальными ритуалами.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Traffic Light & Pomodoro (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Interactive Traffic Light Widget */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Визуальный «Светофор» для ребенка
              </h3>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
                title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
              </button>
            </div>

            {/* Traffic Light Physical Box Representation */}
            <div className="bg-stone-950 p-5 rounded-3xl w-40 mx-auto flex flex-col items-center gap-4 shadow-xl border-4 border-stone-800">
              
              {/* Red Light */}
              <button
                onClick={() => handleTrafficChange('red')}
                className={`w-20 h-20 rounded-full transition-all flex items-center justify-center ${
                  trafficColor === 'red'
                    ? 'bg-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.9)] scale-105 ring-4 ring-rose-300'
                    : 'bg-rose-950/60 opacity-40 hover:opacity-70'
                }`}
              >
                {trafficColor === 'red' && <ShieldAlert className="w-8 h-8 text-white animate-pulse" />}
              </button>

              {/* Yellow Light */}
              <button
                onClick={() => handleTrafficChange('yellow')}
                className={`w-20 h-20 rounded-full transition-all flex items-center justify-center ${
                  trafficColor === 'yellow'
                    ? 'bg-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.9)] scale-105 ring-4 ring-amber-200'
                    : 'bg-amber-950/60 opacity-40 hover:opacity-70'
                }`}
              >
                {trafficColor === 'yellow' && <span className="text-2xl">⏳</span>}
              </button>

              {/* Green Light */}
              <button
                onClick={() => handleTrafficChange('green')}
                className={`w-20 h-20 rounded-full transition-all flex items-center justify-center ${
                  trafficColor === 'green'
                    ? 'bg-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.9)] scale-105 ring-4 ring-emerald-200'
                    : 'bg-emerald-950/60 opacity-40 hover:opacity-70'
                }`}
              >
                {trafficColor === 'green' && <Smile className="w-8 h-8 text-white" />}
              </button>

            </div>

            {/* Current Signal Meaning */}
            <div className="mt-5 p-3.5 rounded-xl border text-xs text-center">
              {trafficColor === 'red' && (
                <div className="text-rose-950 bg-rose-50 p-2 rounded-lg font-medium">
                  🛑 <span className="font-bold">КРАСНЫЙ:</span> Идет звонок! Подходить строго запрещено. Ребенок играет с «коробкой сокровищ».
                </div>
              )}
              {trafficColor === 'yellow' && (
                <div className="text-amber-950 bg-amber-50 p-2 rounded-lg font-medium">
                  ⏳ <span className="font-bold">ЖЕЛТЫЙ:</span> Папа/мама пишет текст. Можно тихо подойти и положить руку на плечо.
                </div>
              )}
              {trafficColor === 'green' && (
                <div className="text-emerald-950 bg-emerald-50 p-2 rounded-lg font-medium">
                  🟢 <span className="font-bold">ЗЕЛЕНЫЙ:</span> Перерыв! Свободное время для обнимашек, игр и перекуса.
                </div>
              )}
            </div>

            {/* Pomodoro Timer */}
            <div className="mt-6 pt-5 border-t border-stone-200 text-center">
              <div className="text-xs uppercase font-semibold text-stone-500 mb-1">
                Таймер фокуса Deep Work (25 минут)
              </div>
              <div className="text-4xl font-black font-mono text-stone-900 tracking-wider mb-4">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isTimerRunning 
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isTimerRunning ? 'Пауза' : 'Старт сессии'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(25 * 60);
                  }}
                  className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Сбросить на 25 мин"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Step-by-Step Interactive Tasks (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Progress Header */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
              <span>Готовность к рабочему дню:</span>
              <span className="font-mono text-stone-900">{completedCount} из {tasks.length} выполнено ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-stone-150 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  task.completed 
                    ? 'bg-emerald-50/40 border-emerald-200 opacity-90' 
                    : 'bg-white border-stone-200 hover:border-amber-400 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                    task.completed 
                      ? 'bg-emerald-600 text-white' 
                      : 'border-2 border-stone-300 hover:border-amber-500'
                  }`}>
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm sm:text-base font-bold ${
                        task.completed ? 'line-through text-stone-500' : 'text-stone-900'
                      }`}>
                        {task.title}
                      </h4>
                      {task.importance === 'critical' && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex-shrink-0">
                          Критично
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-2">
                      {task.description}
                    </p>

                    {task.proTip && (
                      <div className="text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 inline-block font-medium">
                        💡 <span className="font-semibold">Лайфхак: </span>{task.proTip}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => setTasks(INITIAL_TASKS)}
              className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors"
            >
              Сбросить все галочки
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
