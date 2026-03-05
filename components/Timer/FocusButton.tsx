'use client';

import { useTimerContext } from '@/Context/TimerContext';
// useRef = 便利貼，存資料但不會觸發畫面重畫
import { useRef } from 'react';

export default function FocusButton() {
  // 設定時間便利貼，預設數字
  const timeRef = useRef(0);

  const { isTimerRunning, toggleTimer, resetTimer } = useTimerContext();

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
      resetTimer();
    } else {
      toggleTimer();
    }
  };

  return (
    <div>
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`px-50 py-10 text-white rounded-2xl cursor-pointer transition-colors hover:opacity-90 hover:scale-110
          ${isTimerRunning ? 'bg-red-500 hover:bg-red-500/90' : 'bg-blue-500 hover:bg-blue-500/90'}`}
      >
        {isTimerRunning ? '結束專注' : '開始專注'}
      </button>
    </div>
  );
}
