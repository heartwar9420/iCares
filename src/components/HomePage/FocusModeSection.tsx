import { Headphones, LucideIcon, Sparkles, Timer } from 'lucide-react';
import { useState } from 'react';
import { TimerConfigPanelUI, TimerKey } from '../Timer/TimerConfigPanel';
import type { TimerComboType } from '@/src/hooks/useTimer';

interface Props {
  Icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
}

function FocusModeItem({ Icon, iconClassName, title, description }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors ">
      <div className="bg-[#0a0e17] border border-white/10 p-3 rounded-xl shrink-0">
        <Icon size={20} className={iconClassName} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
}

export default function FocusModeSection() {
  const [demoCombo, setDemoCombo] = useState<TimerComboType>('iCares');
  const [demoConfigs, setDemoConfigs] = useState({
    workTimeMinutes: 20,
    shortRestTimeSeconds: 20,
    longRestTimeMinutes: 20,
    roundsToLongRest: 5,
  });
  const [demoReplay, setDemoReplay] = useState(true);
  // 模擬模式切換的假邏輯
  const handleDemoApplyCombo = (combo: TimerComboType) => {
    setDemoCombo(combo);
    if (combo === 'iCares') {
      setDemoConfigs({
        workTimeMinutes: 20,
        shortRestTimeSeconds: 10,
        longRestTimeMinutes: 20,
        roundsToLongRest: 5,
      });
      setDemoReplay(true);
    } else if (combo === 'TomatoClock') {
      setDemoConfigs({
        workTimeMinutes: 25,
        shortRestTimeSeconds: 300,
        longRestTimeMinutes: 15,
        roundsToLongRest: 4,
      });
      setDemoReplay(false);
    } else if (combo === 'Immersion') {
      setDemoConfigs({
        workTimeMinutes: 20,
        shortRestTimeSeconds: 20,
        longRestTimeMinutes: 20,
        roundsToLongRest: 5,
      });
      setDemoReplay(false);
    }
  };

  const handleDemoUpdateDuration = (key: TimerKey, newValue: number) => {
    setDemoConfigs((prev) => ({ ...prev, [key]: newValue }));
  };
  const items = [
    {
      Icon: Headphones,
      iconClassName: 'text-blue-400',
      title: '沉浸專注',
      description: '每20分鐘提醒的深度工作模式。\n適合日常生活使用，兼顧眼睛健康。',
    },
    {
      Icon: Timer,
      iconClassName: 'text-emerald-400',
      title: '傳統番茄鐘',
      description: '經典的 25 分鐘工作搭配 5 分鐘休息。',
    },
  ];
  return (
    <section className="min-h-screen py-20 flex flex-col justify-center max-w-7xl mx-auto md:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full">
        <div className="w-full lg:w-5/12 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-wide">適應你的每種專注狀態</h2>
            <p className="text-slate-400 text-lg">
              不論是高強度的考前衝刺，
              <br />
              還是需要深度專注的程式開發。
              <br />
              切換最適合你的計時模式。
            </p>
          </div>

          <div className="space-y-4">
            {/* iCares 模式 */}
            <div className="bg-linear-to-r from-[#ffb347]/10 to-transparent border border-[#ffb347]/20 p-5 rounded-2xl flex items-start gap-4 relative overflow-hidden group hover:border-[#ffb347]/50 transition-colors">
              <div className="bg-[#0a0e17] border border-[#ffb347]/30 p-3 rounded-xl shrink-0 shadow-[0_0_10px_rgba(255,179,71,0.2)]">
                <Sparkles size={20} className="text-[#ffb347]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">iCares 模式</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  為高強度學習設計。結合神經重放機制，
                  <br />
                  以提示音引導 10 秒微休息，最大化提升記憶力。
                </p>
              </div>
            </div>
            {/* map */}
            {items.map((item, index) => (
              <FocusModeItem
                key={index}
                Icon={item.Icon}
                title={item.title}
                description={item.description}
                iconClassName={item.iconClassName}
              />
            ))}
          </div>
        </div>

        {/* UI 展示 */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-linear-to-r from-[#ffb347]/10 via-transparent to-blue-500/10 pointer-events-none z-0 blur-3xl"></div>

          <div className="relative z-10 w-full flex justify-center transform scale-100 md:scale-110 lg:scale-130 xl:scale-150">
            <TimerConfigPanelUI
              timerCombo={demoCombo}
              timerDurationConfigs={demoConfigs}
              isReplay={demoReplay}
              onApplyCombo={handleDemoApplyCombo}
              onUpdateDuration={handleDemoUpdateDuration}
              onToggleReplay={setDemoReplay}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
