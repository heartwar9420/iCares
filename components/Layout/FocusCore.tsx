'use client';

import { useRef, useState, useEffect } from 'react';
import { useTimerContext } from '@/Context/TimerContext';
import TimerSettingButton from '../Timer/TimerSettingButton';
import TimerConfigPanel from '../Timer/TimerConfigPanel';
import FocusMatrix from '../Stats/FocusMatrix';

export default function FocusCore() {
  const { remainingSeconds, mode, timerDurationConfigs, isTimerRunning, toggleTimer, resetTimer } =
    useTimerContext();

  const minutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;

  const modeText = {
    work: '專注中',
    rest: '短休息',
    long_rest: '長休息',
  };

  let defaultTimeString = '';
  if (mode === 'work') defaultTimeString = `${timerDurationConfigs.work_time_minutes}:00`;
  if (mode === 'long_rest') defaultTimeString = `${timerDurationConfigs.long_rest_time_minutes}:00`;
  if (mode === 'rest') {
    // 確保秒數小於 10 時補 0
    const sec = timerDurationConfigs.short_rest_time_seconds;
    defaultTimeString = `00:${sec < 10 ? `0${sec}` : sec}`;
  }

  const timeRef = useRef(0);

  const [isShaking, setIsShaking] = useState(false);

  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    timeRef.current = new Date().getTime();

    // 在按下的同時設定一個 1 秒後的定時器，時間到了之後就開始震動
    timerIdRef.current = setTimeout(() => {
      setIsShaking(true);
    }, 1000);
  };

  const handleMouseUp = () => {
    const now_time = new Date();
    const timeDelta = now_time.getTime() - timeRef.current;

    // 放開滑鼠時 清理定時器
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

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 relative">
      {/* 計時區塊 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
        {/* 計時器數字與狀態 */}
        <div className="text-center flex flex-col items-center select-none">
          <h1 className="text-[150px] 2xl:text-[180px] font-thin tracking-tighter text-white leading-none flex items-center justify-center">
            {remainingSeconds > 0 ? (
              <>
                {minutes < 10 ? `0${minutes}` : minutes}
                <span className={`${isTimerRunning ? 'animate-pulse' : ''} mx-2 text-[#ffb347]`}>
                  :
                </span>
                {displaySeconds < 10 ? `0${displaySeconds}` : displaySeconds}
              </>
            ) : (
              // 準備開始或重置狀態顯示預設時間
              defaultTimeString.split(':').map((part, index) => (
                <span key={index} className="flex items-center">
                  {part}
                  {index === 0 && <span className="mx-2 text-slate-700">:</span>}
                </span>
              ))
            )}
          </h1>

          <p className="text-slate-500 uppercase font-medium text-base md:text-lg tracking-[0.4em] mt-6">
            當前階段：{remainingSeconds === 0 ? '準備開始' : modeText[mode]}
          </p>
        </div>

        <div className="mt-16 flex items-center justify-center gap-6">
          {/* 左側隱形佔位符 確保主按鈕絕對置中 */}
          <div className="w-12 h-12 invisible pointer-events-none"></div>

          {/* 主按鈕 */}
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="group relative cursor-pointer outline-none shrink-0"
          >
            <div
              className={`absolute -inset-1 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500 group-hover:duration-200 
      ${isTimerRunning ? 'bg-linear-to-r from-red-500 to-rose-600' : 'bg-linear-to-r from-[#ffb347] to-orange-600'}`}
            ></div>

            <div
              className={`relative px-16 py-5 rounded-full font-extrabold text-xl tracking-widest hover:scale-105 active:scale-95 transition-all duration-200 ${isShaking ? 'animate-shake' : ''}
      ${
        isTimerRunning
          ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
          : 'bg-[#ffb347] text-[#0a0e17] shadow-[0_0_20px_rgba(255,179,71,0.3)]'
      }`}
            >
              {isTimerRunning ? '暫停專注' : remainingSeconds === 0 ? '開始專注' : '繼續專注'}
            </div>
          </button>

          {/* 3. 右側設定按鈕 */}
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <TimerSettingButton />
          </div>
          <div className="absolute bottom-16 right-0 z-50">
            <TimerConfigPanel />
          </div>
        </div>

        {/* 操作提示小字 (維持不變) */}
        <p className="mt-6 text-sm text-slate-500 tracking-wider">長按按鈕 1 秒可重置計時器</p>
      </div>

      {/* 熱力圖區塊 */}
      <div className="w-full shrink-0 h-48 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-6 flex items-center justify-center">
        <FocusMatrix />
      </div>
    </div>
  );
}
