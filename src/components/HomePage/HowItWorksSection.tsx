import { Bell, CheckSquare, LucideIcon, Play, Settings } from 'lucide-react';

interface Props {
  Icon: LucideIcon;
  title: string;
  description: string;
}

function HowItWorksItem({ Icon, title, description }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
      <div className="bg-[#0a0e17] border border-white/10 p-2 rounded-xl mt-1">
        <Icon size={20} className="text-[#ffb347]" />
      </div>
      <div>
        <h3 className="font-bold text-xl text-white mb-1">{title}</h3>
        <p className="text-base text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const items = [
    { icon: Play, title: '內置背景音樂', description: '進入心流狀態，搭配 Lofi 音樂。' },
    {
      icon: Settings,
      title: '自定義計時器',
      description: '根據你的專注節奏，切換iCares模式或是傳統番茄鐘。',
    },
    { icon: CheckSquare, title: '待辦清單', description: '記錄每一項任務，讓目標清晰可見。' },
    { icon: Bell, title: '音效通知', description: '專注時間結束時，給予溫和的提醒。' },
  ];

  return (
    <section className="min-h-screen py-24 flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 w-full flex justify-center">
        <div className="w-full aspect-square bg-[url('/HowWorksSection.jpg')] bg-center bg-cover rounded-3xl shadow-xl backdrop-blur-sm"></div>
      </div>
      <div className="flex-1 space-y-8">
        <h2 className="text-3xl font-bold text-white">iCares 是如何運作的</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <HowItWorksItem
              key={index}
              Icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
