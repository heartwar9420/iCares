'use client';

import { useEffect, useState } from 'react';
import { iconOptions } from '../Todo/iconConstants';
import { useFocusContext } from '@/src/contexts/FocusContext';
import { useTimerContext } from '@/src/contexts/TimerContext';

export default function FocusMatrix() {
  const { gridCellsArray, activeColor, activeTaskName, activeIcon } = useFocusContext();
  const { isTimerRunning, mode, remainingSeconds, timerDurationConfigs } = useTimerContext();

  // 用來在儲存目前是時間哪一個格子
  const [liveCurrentCellId, setLiveCurrentCellId] = useState<number | null>(null);

  // 同步使用者的本地時間
  useEffect(() => {
    // 進入時先執行一次
    const updateTime = () => {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      setLiveCurrentCellId(Math.floor(totalMinutes / 10));
    };

    updateTime();

    // 用 setInterval 每分鐘檢查一次，確保時間準確跨越格子
    const intervalTimer = setInterval(updateTime, 60000);
    return () => clearInterval(intervalTimer);
  }, []);

  // 用來儲存哪一個是專注開始時的格子
  let startCellId: number | null = null;
  // 如果現在是work 且現在的時間格子 != null 且 得到時用者的時間設定
  if (mode === 'work' && liveCurrentCellId !== null && timerDurationConfigs) {
    // 算出總共要專注多久分鐘
    const totalFocusSeconds = timerDurationConfigs.workTimeMinutes * 60;
    // 算出現在已經專注多久了
    const pastSeconds = totalFocusSeconds - remainingSeconds;
    const pastMinutes = Math.floor(pastSeconds / 60);
    if (pastSeconds > 0 || isTimerRunning) {
      // 如果已經專注>0 或是時間正在倒數
      const now = new Date();
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
      // 這一輸開始專注的時間 = 現在總時間 - 已經專注了幾分鐘
      const startTotalMinutes = currentTotalMinutes - pastMinutes;
      // /10 之後就能算出起始的格子的 ID
      startCellId = Math.floor(startTotalMinutes / 10);
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* 標題與圖例 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold tracking-widest text-slate-500">專注時間記錄</h3>
        <div className="flex items-center gap-4 text-base text-slate-500"></div>
      </div>

      {/* 144 格區塊 */}
      <div className="flex-1 grid grid-rows-6 grid-flow-col gap-0.75 w-full">
        {gridCellsArray?.map((cell) => {
          const isCurrentTimeCell = cell.id === liveCurrentCellId;

          const isActivelyFocusingNow =
            (isTimerRunning || remainingSeconds > 0) &&
            mode === 'work' &&
            startCellId !== null &&
            liveCurrentCellId !== null &&
            // 判斷條件：這格的 ID 大於等於起點，且小於等於現在的 ID
            cell.id >= startCellId &&
            cell.id <= liveCurrentCellId;

          // 如果資料庫中顯示 專注中 或 現在正在專注 = isFocused
          const isFocused = cell.status === 'focused' || isActivelyFocusingNow;

          // 決定顯示的顏色 名稱 圖標
          const cellColor = cell.color || (isActivelyFocusingNow ? activeColor : 'text-[#ffb347]');
          const displayTaskName =
            cell.task_name || (isActivelyFocusingNow ? activeTaskName : '已專注');

          let CellIcon = null;

          if (isActivelyFocusingNow) {
            const activeIconConfig = iconOptions.find((i) => i.name === activeIcon);
            CellIcon = activeIconConfig ? activeIconConfig.icon : null;
          } else {
            const matchedIconConfig = iconOptions.find((i) => i.name === cell.icon_name);
            CellIcon = matchedIconConfig ? matchedIconConfig.icon : null;
          }

          const totalMinutes = cell.id * 10;
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
          return (
            <div key={cell.id} className="relative group w-full h-full cursor-pointer">
              {/* 負責背景色、hover 變色與呼吸燈效果 */}
              <div
                className={`w-full h-full rounded-xs transition-all duration-300
                  ${isFocused ? `bg-current opacity-80 group-hover:opacity-100 ${cellColor}` : 'bg-white/5 group-hover:bg-white/10'}
                  ${isCurrentTimeCell ? `ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 ${isTimerRunning ? 'animate-pulse' : ''}` : ''}
                `}
              ></div>

              {/* 提示框層 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                <div className="bg-[#161b26] border border-white/10 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
                  <span className="text-base font-mono text-slate-400">{timeString}</span>
                  {isFocused && (
                    <>
                      <span className="w-px h-3 bg-slate-600"></span>
                      {CellIcon && <CellIcon size={14} className={cellColor} />}
                      <span>{displayTaskName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className=" flex justify-between text-base text-slate-600 font-bold font-mono">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
    </div>
  );
}
