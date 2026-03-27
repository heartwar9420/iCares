'use client';

import { useRef, useState, useEffect } from 'react';
import { useTimerContext } from '@/src/contexts/TimerContext';
import TimerSettingButton from '../Timer/TimerSettingButton';
import TimerConfigPanel from '../Timer/TimerConfigPanel';
import FocusMatrix from '../Stats/FocusMatrix';
import TimerProgress from '../Timer/TimerProgress';

export default function FocusCore() {
  const {
    remainingSeconds,
    mode,
    timerDurationConfigs,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    completedRounds,
    isReplayingNow,
  } = useTimerContext();

  const safeRemaining = Number(remainingSeconds) || 0; // 為了不要顯示 NaN 強制把他轉成Number

  const minutes = Math.floor(safeRemaining / 60);
  const seconds = safeRemaining % 60;

  const modeText = {
    work: '專注中',
    rest: '短休息',
    long_rest: '長休息',
  };
  // 根據目前的 mode 顯示中文名稱，如果資料還沒讀取到就顯示預設文字
  const currentModeText = modeText[mode as keyof typeof modeText] || '狀態讀取中';

  // 用一個物件把所有模式的時間對應好
  const timeConfigs = {
    work: `${timerDurationConfigs?.workTimeMinutes ?? 20}:00`,
    long_rest: `${timerDurationConfigs?.longRestTimeMinutes ?? 20}:00`,
    rest: `00:${timerDurationConfigs?.shortRestTimeSeconds ?? 20}`,
  };

  // 根據當前 mode 抓取對應時間，如果都沒有就給個預設值
  const defaultTimeString = timeConfigs[mode as keyof typeof timeConfigs] || '--:--';

  // 0 秒且沒有在倒數中 才是準備開始
  const isInitialState = remainingSeconds === 0 && !isTimerRunning;

  // 取得分鐘與秒數
  let displayMinutes = '00';
  let displaySeconds = '00';

  // 如果不是初始狀態的時候
  if (!isInitialState) {
    displayMinutes = minutes < 10 ? `0${minutes}` : String(minutes);
    displaySeconds = seconds < 10 ? `0${seconds}` : String(seconds);
  } else {
    const [min, sec] = defaultTimeString.split(':');
    displayMinutes = String(min).padStart(2, '0');
    displaySeconds = String(sec).padStart(2, '0');
  }

  // 只有在剩餘時間 = 0 且 時間沒有倒數中 才會顯示 '準備開始'
  const statusMessage = remainingSeconds === 0 && !isTimerRunning ? '準備開始' : currentModeText;

  // 把時間存到 timeRef 中 預設是0
  const timeRef = useRef(0);

  // 是否 震動
  const [isShaking, setIsShaking] = useState(false);

  // 用來取消計時器
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    // 把 現在的時間存到 timeRef 中
    timeRef.current = new Date().getTime();

    // 在按下的同時設定一個 1 秒後的定時器，時間到了之後就開始震動
    timerIdRef.current = setTimeout(() => {
      setIsShaking(true);
    }, 1000);
  };

  const handleMouseUp = () => {
    const now_time = new Date();
    // 用現在時間 算出時間差
    const timeDelta = now_time.getTime() - timeRef.current;

    // 如果有定時器的話 在放開滑鼠時 清理定時器
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    // 關閉震動
    setIsShaking(false);

    if (timeDelta > 1000) {
      resetTimer(); // 長按大於 1 秒重置
    } else {
      toggleTimer(); // 短按小於 1 秒切換暫停/開始
    }
  };

  // 防呆用 如果使用者按下 button 之後 把滑鼠移開 , 不論在哪放開 都要把 計時器取消 並 取消震動
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      setIsShaking(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // 計算圓的百分比
  let totalSeconds = 0;
  totalSeconds = Number(totalSeconds) || 0;
  if (mode === 'work') {
    totalSeconds = timerDurationConfigs.workTimeMinutes * 60;
  } else if (mode === 'rest') {
    totalSeconds = timerDurationConfigs.shortRestTimeSeconds;
  } else if (mode === 'long_rest') {
    totalSeconds = timerDurationConfigs.longRestTimeMinutes * 60;
  }

  let progressPercentage = 0;
  if (isInitialState) {
    // 只有在「準備開始」且剩餘時間為 0 時，才是真正的 0%
    progressPercentage = 0;
  } else if (totalSeconds > 0) {
    // 只要不是初始狀態，就計算過去的時間
    // 當 remainingSeconds 為 0 時，(totalSeconds - 0) / totalSeconds 就會剛好是 100%
    const pastSeconds = totalSeconds - remainingSeconds;
    progressPercentage = (pastSeconds / totalSeconds) * 100;
  }

  // 產生圓點陣列的邏輯
  const totalRounds = timerDurationConfigs.roundsToLongRest;
  const dots = Array.from({ length: totalRounds }).map((_, index) => {
    const isCompleted = index < completedRounds;
    const isCurrent = index === completedRounds && mode === 'work';
    return (
      <span
        key={index}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${isCompleted ? 'bg-[#ffb347]' : isCurrent ? 'bg-[#ffb347] animate-pulse ' : 'bg-white/30'}`}
      ></span>
    );
  });

  return (
    <div className="flex flex-col items-center justify-between relative min-h-0">
      {/* 計時區塊 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full ">
        {/* 計時器數字與狀態 */}

        <div className="text-center">
          <TimerProgress progress={progressPercentage} size={300} strokeWidth={30}>
            <div className="text-[70px] sm:text-[90px] md:text-[100px] tracking-tight text-white font-mono">
              <>
                {displayMinutes}
                {/* animate-pulse = 呼吸燈 */}
                <span
                  className={`${isTimerRunning ? 'animate-pulse' : ''} mx-1 md:mx-2 text-[#ffb347]`}
                >
                  :
                </span>
                {displaySeconds}
              </>
            </div>
          </TimerProgress>

          <div className="h-4 flex flex-col items-center justify-center mt-2 transition-all">
            {isReplayingNow && mode === 'work' && isTimerRunning ? (
              <p className="text-blue-400 font-bold text-lg tracking-widest animate-pulse drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                神經重放中，請閉眼10秒
              </p>
            ) : (
              <p className="text-slate-500 font-bold text-lg tracking-[0.4em]">
                當前階段：{statusMessage}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">{dots}</div>
        </div>

        <div className="mt-14 flex items-center justify-center gap-6">
          {/* 隱形佔位符讓主按鈕能置中 */}
          <div className="w-12"></div>

          {/* 主按鈕 */}
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="group relative cursor-pointer shrink-0"
          >
            {/* 外邊框 */}
            <div
              className={`absolute -inset-1 rounded-full blur opacity-60 group-hover:opacity-90 transition duration-500 group-hover:duration-200
                // bg-linear-to-r = 從左到右線性漸層
      ${isTimerRunning ? 'bg-linear-to-r from-red-500 to-rose-600' : 'bg-linear-to-r from-[#ffb347] to-orange-600'}`}
            ></div>

            <div
              className={`relative px-16 py-5 rounded-full font-bold text-xl tracking-[0.25rem] hover:scale-105 active:scale-95 transition-all duration-300 ${isShaking ? 'animate-shake' : ''}
      ${isTimerRunning ? 'bg-red-500 text-white]' : 'bg-[#ffb347] text-[#0a0e17]]'}`}
            >
              {isTimerRunning ? '暫停專注' : isInitialState ? '開始專注' : '繼續專注'}
            </div>
          </button>

          {/* 設定按鈕 & Panel */}
          <div className="relative group w-12 h-12 flex items-center justify-center shrink-0">
            <TimerSettingButton />

            {/* 提示文字 (Tooltip) */}
            {remainingSeconds !== 0 && (
              <div
                className={`absolute bottom-full mb-3 px-3 py-2 bg-slate-800 text-white text-base rounded-lg 
                    whitespace-nowrap shadow-xl border border-white/10
                    opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                    right-0
                    `}
              >
                只有重置計時器後才能開啟設定頁面！
              </div>
            )}
            <TimerConfigPanel />
          </div>
        </div>

        <p className="mt-6 mb-10 lg:mb-0 text-base text-slate-500 tracking-wider">
          長按按鈕 1 秒可重置計時器
        </p>
      </div>

      {/* 熱力圖 */}
      <div className="w-full shrink-0 h-60 min-h-60 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-4 flex ">
        <FocusMatrix />
      </div>
    </div>
  );
}
