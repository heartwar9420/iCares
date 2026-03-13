'use client';

import { useEffect, useState } from 'react';
import { iconOptions } from '../Todo/iconConstants';
import { useFocus } from '@/Context/FocusContext';

export default function FocusMatrix() {
  const { gridCellsArray } = useFocus();

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

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* 標題與圖例 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold tracking-widest text-slate-500">專注時間記錄</h3>
        <div className="flex items-center gap-4 text-base text-slate-500"></div>
      </div>

      {/* 144 格區塊 */}
      <div className="flex-1 grid grid-rows-6 grid-flow-col gap-0.75 w-full">
        {gridCellsArray.map((cell) => {
          const matchedIconConfig = iconOptions.find((item) => item.name === cell.icon_name);
          const CellIcon = matchedIconConfig ? matchedIconConfig.icon : null;

          const totalMinutes = cell.id * 10;
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

          const isCurrentTimeCell = cell.id === liveCurrentCellId;
          const isFocused = cell.status === 'focused';

          return (
            <div key={cell.id} className="relative group w-full h-full cursor-pointer">
              {/* 負責背景色、hover 變色與呼吸燈效果 */}
              <div
                className={`w-full h-full rounded-xs transition-all duration-300
                  ${isFocused ? `bg-current opacity-80 group-hover:opacity-100 ${cell.color || 'text-[#ffb347]'}` : 'bg-white/5 group-hover:bg-white/10'}
                  ${isCurrentTimeCell ? 'ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 animate-pulse' : ''}
                `}
              ></div>

              {/* 提示框層 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                <div className="bg-[#161b26] border border-white/10 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
                  <span className="text-base font-mono text-slate-400">{timeString}</span>
                  {isFocused && (
                    <>
                      <span className="w-px h-3 bg-slate-600"></span>
                      {CellIcon && <CellIcon size={14} className={cell.color} />}
                      <span>{cell.task_name || '已專注'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 時間軸標示 */}
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
