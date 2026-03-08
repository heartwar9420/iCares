import { useEffect, useRef, useState } from 'react';
import { iconOptions } from '../Todo/iconConstants';
import { useFocus } from '@/Context/FocusContext';

export interface GridCell {
  id: number;
  status: 'empty' | 'focused';
  icon_name?: string;
  color?: string;
}

export default function ActivityGrid() {
  // 從 Hook 中拿到這兩個變數
  const { gridCellsArray } = useFocus();

  // 建立一個狀態來記錄現在幾點，避免伺服器端和客戶端時間不一致
  const [liveCurrentCellId, setLiveCurrentCellId] = useState<number | null>(null);

  // 建立一個 Ref 用來抓現在時間的ID
  const currentTimeRef = useRef<HTMLDivElement | null>(null);

  // 同步客戶端的本地時間
  useEffect(() => {
    const updateIdTimer = setTimeout(() => {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      const cellId = Math.floor(totalMinutes / 10);

      // 設定狀態
      setLiveCurrentCellId(cellId);
    }, 0);
    return () => clearTimeout(updateIdTimer);
    // 只在進場時執行一次
  }, []);

  // 當 liveCurrentCellId 確定有值且畫面渲染後，執行滾動
  useEffect(() => {
    // 只有當 liveCurrentCellId 從 null 變成數字，且 Ref 已經抓到元素時才執行
    if (liveCurrentCellId !== null && currentTimeRef.current) {
      const scrollTimer = setTimeout(() => {
        currentTimeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      return () => clearTimeout(scrollTimer);
    }
    // 只有當 liveCurrentCellId 改變時才觸發滾動邏輯
  }, [liveCurrentCellId]);

  return (
    <div className="flex mt-2 mx-10 p-3 bg-black rounded-2xl max-h-[30vh] overflow-y-auto ">
      <div className="grid grid-cols-6  w-full sm:gap-3">
        {gridCellsArray.map((cell) => {
          const matchedIconConfig = iconOptions.find((item) => item.name === cell.icon_name);
          const CellIcon = matchedIconConfig ? matchedIconConfig.icon : null;
          const totalMinutes = cell.id * 10;
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
          const isCurrentTimeCell = cell.id === liveCurrentCellId;
          return (
            <div
              key={cell.id}
              className="flex flex-col justify-center items-center"
              ref={isCurrentTimeCell ? currentTimeRef : null}
            >
              <div className="text-amber-100 text-center">{timeString}</div>
              <div
                className={`flex  w-16 h-16 rounded-2xl  ${cell.status === 'empty' ? 'bg-gray-500' : 'bg-white'} 
                ${isCurrentTimeCell ? 'ring-2 ring-green-400' : ''}`}
              >
                {cell.status === 'focused' && CellIcon && (
                  <CellIcon size={64} className={cell.color} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
