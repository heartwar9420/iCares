'use client';

import React, { useEffect, useState } from 'react';
import { iconOptions } from '../Todo/iconConstants';
import { useFocusContext } from '@/src/contexts/FocusContext';
import { useTimerStore } from '@/src/stores/useTimerStore';

const FocusMatrix = React.memo(function FocusMatrix() {
  const { gridCellsArray, activeColor, activeTaskName, activeIcon } = useFocusContext();
  const mode = useTimerStore((s) => s.mode);
  const timerDurationConfigs = useTimerStore((s) => s.timerDurationConfigs);
  const isTimerRunning = useTimerStore((s) => s.isTimerRunning);
  const hasRemainingTime = useTimerStore((s) => s.remainingSeconds > 0);
  const [liveCurrentCellId, setLiveCurrentCellId] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      setLiveCurrentCellId(Math.floor(totalMinutes / 10));
    };

    updateTime();

    const intervalTimer = setInterval(updateTime, 60000);
    return () => clearInterval(intervalTimer);
  }, []);

  let startCellId: number | null = null;

  if (mode === 'work' && liveCurrentCellId !== null && timerDurationConfigs) {
    const currentRemainingSeconds = useTimerStore.getState().remainingSeconds;

    const totalFocusSeconds = timerDurationConfigs.workTimeMinutes * 60;

    const pastSeconds = totalFocusSeconds - currentRemainingSeconds;
    const pastMinutes = Math.floor(pastSeconds / 60);

    if (pastSeconds > 0 || isTimerRunning) {
      const now = new Date();
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

      const startTotalMinutes = currentTotalMinutes - pastMinutes;

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
          // 這個格子 是否 = 現在時間的格子？
          const isCurrentTimeCell = cell.id === liveCurrentCellId;

          // 這個格子是否 = 正在進行中的專注間間區間 中？
          const isActivelyFocusingNow =
            (isTimerRunning || hasRemainingTime) && // 暫停時 or 開始時
            mode === 'work' && // 且模式是 work
            startCellId !== null && // 且 起始格子 != null
            liveCurrentCellId !== null && // 且 現在的格子 != null
            cell.id >= startCellId && // 且 這個格子在 起點之後 終點之前
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
});
export default FocusMatrix;
