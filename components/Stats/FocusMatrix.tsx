'use client';

import { useEffect, useState } from 'react';
import { iconOptions } from '../Todo/iconConstants';
import { useFocus } from '@/Context/FocusContext';

export default function FocusMatrix() {
  const { gridCellsArray } = useFocus();
  const [liveCurrentCellId, setLiveCurrentCellId] = useState<number | null>(null);

  // 同步客戶端的本地時間
  useEffect(() => {
    // 進入時先執行一次
    const updateTime = () => {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      setLiveCurrentCellId(Math.floor(totalMinutes / 10));
    };
    updateTime();

    // 改用 setInterval 每分鐘檢查一次，確保時間準確跨越格子
    const intervalTimer = setInterval(updateTime, 60000);
    return () => clearInterval(intervalTimer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* 標題與圖例 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase">專注強度矩陣</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-white/5"></span> 未啟用
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-[#ffb347]"></span> 專注中
          </span>
        </div>
      </div>

      {/* 核心 144 矩陣區塊 */}
      {/* grid-rows-6 和 grid-flow-col 讓 144 格自動排成 24欄 x 6列 (每欄代表 1 小時) */}
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
            <div
              key={cell.id}
              /* 1. group：為了讓 hover tooltip 生效 
                2. bg-current：會吃 cell.color (例如 text-blue-500) 的顏色並填滿背景 
              */
              className={`relative group rounded-xs transition-all duration-300 cursor-pointer
                ${isFocused ? `bg-current opacity-80 hover:opacity-100 ${cell.color || 'text-[#ffb347]'}` : 'bg-white/5 hover:bg-white/10'}
                ${isCurrentTimeCell ? 'ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 animate-pulse' : ''}
              `}
            >
              {/* 滑鼠懸停才顯示的精緻 Tooltip (氣泡提示框) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                <div className="bg-[#161b26] border border-white/10 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
                  <span className="font-mono text-slate-400">{timeString}</span>
                  {isFocused && (
                    <>
                      <span className="w-px h-3 bg-slate-600"></span>
                      {CellIcon && <CellIcon size={14} className={cell.color} />}
                      <span>{cell.icon_name || '已專注'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部時間軸標示 */}
      <div className=" flex justify-between text-sm text-slate-600 font-medium font-mono">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
    </div>
  );
}
