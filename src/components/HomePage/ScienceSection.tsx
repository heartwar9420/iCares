import { Activity, Brain, Dices, Eye, LucideIcon } from 'lucide-react';

interface Props {
  glowClassName: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
}

function ScienceItems({ glowClassName, title, Icon, iconClassName, description }: Props) {
  return (
    <div className="relative overflow-hidden group bg-[#0f141f] border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-all duration-300">
      {/* 背景發光效果 */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 bg-linear-to-bl ${glowClassName} to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500`}
      ></div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="bg-[#0a0e17] w-fit p-3 rounded-2xl border border-white/5 shadow-inner">
          <Icon size={28} className={iconClassName} />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide mt-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
}

export default function ScienceSection() {
  const items = [
    {
      glowClassName: 'from-blue-500/10',
      Icon: Brain,
      title: '覺醒神經重放 (Awake Neural Replay)',
      description:
        '專注過程中的短暫休息，\n能讓大腦以20倍速「重播」剛剛的神經訊號。\n學會適時停下，反而能加速技能學習與記憶鞏固。',
      iconClassName: 'text-blue-400',
    },
    {
      glowClassName: 'from-purple-500/10',
      Icon: Dices,
      title: '變比率強化機制 (Variable Ratio)',
      description:
        '不確定的獎勵機制會刺激大腦分泌大量多巴胺。\n將枯燥的專注過程遊戲化，讓你不知不覺產生：\n「想再專注一次」的強大動力。',
      iconClassName: 'text-purple-400',
    },
    {
      glowClassName: 'from-[#ffb347]/10',
      Icon: Activity,
      title: '次晝夜節律 (Ultradian Rhythms)',
      description:
        '人體清醒時也存在：\n「90 分鐘高頻運作、20分鐘低頻休息」的週期。\n順應生理時鐘切換狀態，在最佳時刻發揮最大產能。',
      iconClassName: 'text-[#ffb347]',
    },
    {
      glowClassName: 'from-emerald-500/10',
      Icon: Eye,
      title: '20-20-20 護眼法則',
      description:
        '每專注 20 分鐘，看向 20 英呎（6公尺）外至少 20秒。\n經眼科醫師推廣的簡單策略，有效預防視覺疲勞。',
      iconClassName: 'text-emerald-400',
    },
  ];
  return (
    <section className="min-h-screen py-24 flex flex-col items-center justify-center">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl font-bold text-white tracking-wide">背後的科學依據</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          每一個設計細節都有行為科學與神經學的支撐。
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {items.map((item, index) => (
          <ScienceItems
            key={index}
            glowClassName={item.glowClassName}
            Icon={item.Icon}
            iconClassName={item.iconClassName}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}
