'use client';

// useRef = 便利貼，存資料但不會觸發畫面重畫
import { useRef } from 'react';

interface Props {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  startNewTimer: (targetMode?: 'work' | 'rest' | 'longRest') => Promise<void>;
}

export default function FocusButton({
  isActive,
  seconds,
  setIsActive,
  setSeconds,
  startNewTimer,
}: Props) {
  // 設定時間便利貼，預設數字
  const timeRef = useRef(0);

  // 函式：按下滑鼠
  const handleMouseDown = async () => {
    // 把按下滑鼠的時間用便利貼記下來
    timeRef.current = new Date().getTime();
  };

  // 函式：放開滑鼠
  const handleMouseUp = async () => {
    // 把現在的時間記下來 (放開滑鼠的時間)
    const now_time = new Date();
    // 計算放開-按下的時間
    const timeDelta = now_time.getTime() - timeRef.current;
    // 如果時間差>1秒(長按)
    if (timeDelta > 1000) {
      // 停止計時
      setIsActive(false);
      // 把時間重置成1500秒
      setSeconds(1500);
    } else {
      // 如果現在不是倒數的狀態
      if (!isActive) {
        // 判斷是否為「全新開始」：只有歸零或重置時才向後端拿新時間
        if (seconds === 1500 || seconds === 0) {
          startNewTimer();
        } else {
          setIsActive(true);
        }
      } else {
        setIsActive(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`px-6 py-2 text-white rounded hover:cursor-pointer transition-colors
          ${isActive ? 'bg-red-500 hover:bg-red-500/80' : 'bg-blue-500 hover:bg-blue-500/80'}`}
      >
        {isActive ? '結束專注' : '開始專注'}
      </button>
    </div>
  );
}
