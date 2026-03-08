import { useEffect, useRef } from 'react';
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

  // 建立一個 Ref 用來抓現在時間的ID
  const currentTimeRef = useRef<HTMLDivElement | null>(null);
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const currentCellId = Math.floor(currentTotalMinutes / 10);

  useEffect(() => {
    if (currentTimeRef.current) {
      // setTimeout 是因為要等到瀏覽器把資料載入完之後，再畫出來才不會報錯，100毫秒的時間就足夠把畫面渲染好了！
      setTimeout(() => {
        // block:'center' = 讓現在的時間在畫面的中間
        currentTimeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

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
          const isCurrentTimeCell = cell.id === currentCellId;
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
