import { useTimerStore } from '@/src/stores/useTimerStore';

interface TimerProgressProps {
  size: number;
  strokeWidth: number;
}

export function TimerProgress({ size, strokeWidth }: TimerProgressProps) {
  // 只有這個元件會每秒重新渲染
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const isTimerRunning = useTimerStore((s) => s.isTimerRunning);
  const mode = useTimerStore((s) => s.mode);
  const timerDurationConfigs = useTimerStore((s) => s.timerDurationConfigs);

  const safeRemaining = Number(remainingSeconds) || 0;
  const minutes = Math.floor(safeRemaining / 60);
  const seconds = safeRemaining % 60;

  // 用一個物件把所有模式的時間對應好
  const timeConfigs = {
    work: `${timerDurationConfigs?.workTimeMinutes ?? 20}:00`,
    long_rest: `${timerDurationConfigs?.longRestTimeMinutes ?? 20}:00`,
    rest: `00:${timerDurationConfigs?.shortRestTimeSeconds ?? 20}`,
  };

  // 0 秒且沒有在倒數中 才是準備開始
  const isInitialState = remainingSeconds === 0 && !isTimerRunning;
  const defaultTimeString = timeConfigs[mode as keyof typeof timeConfigs] || '--:--';

  // 取得分鐘與秒數
  let displayMinutes = '00';
  let displaySeconds = '00';

  if (!isInitialState) {
    displayMinutes = minutes < 10 ? `0${minutes}` : String(minutes);
    displaySeconds = seconds < 10 ? `0${seconds}` : String(seconds);
  } else {
    const [min, sec] = defaultTimeString.split(':');
    displayMinutes = String(min).padStart(2, '0');
    displaySeconds = String(sec).padStart(2, '0');
  }

  // 計算圓的百分比
  let totalSeconds = 0;
  if (mode === 'work') totalSeconds = timerDurationConfigs.workTimeMinutes * 60;
  else if (mode === 'rest') totalSeconds = timerDurationConfigs.shortRestTimeSeconds;
  else if (mode === 'long_rest') totalSeconds = timerDurationConfigs.longRestTimeMinutes * 60;

  let progressPercentage = 0;
  if (!isInitialState && totalSeconds > 0) {
    const pastSeconds = totalSeconds - remainingSeconds;
    progressPercentage = (pastSeconds / totalSeconds) * 100;
  }

  // SVG 計算
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center w-full h-full aspect-square mx-auto"
      style={{ maxWidth: size, maxHeight: size }}
    >
      <svg
        className="absolute inset-0 transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-[#ffb347] transition-all duration-500 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* 獨立的時間數字顯示 */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="text-[70px] sm:text-[90px] md:text-[110px] tracking-tight text-white font-mono">
          {displayMinutes}
          <span className={`${isTimerRunning ? 'animate-pulse' : ''} mx-1 md:mx-2 text-[#ffb347]`}>
            :
          </span>
          {displaySeconds}
        </div>
      </div>
    </div>
  );
}
