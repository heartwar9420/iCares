'use client';

// useRef = 便利貼，存資料但不會觸發畫面重畫
import { useRef } from 'react';

interface Props {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  seconds: number;
}

export default function FocusButton({ isActive, seconds, setIsActive, setSeconds }: Props) {
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
      // 把時間設置成1500秒
      setSeconds(1500);
    } else {
      // 如果現在不是倒數的狀態
      if (!isActive) {
        // 判斷是否為「全新開始」：只有歸零或重置時才向後端拿新時間
        if (seconds === 1500 || seconds === 0) {
          // fetchAPI
          const response = await fetch('http://127.0.0.1:8000/api/timer');
          // 轉成json格式
          const result = await response.json();
          const data = result.data;
          // 把後端的時間存到end_time 變數中
          const end_time = new Date(data.end_time);
          // 計算後端的結束時間和現在的時間 / 1000 轉成秒數格式(原本是毫秒)
          const select_time = Math.floor((end_time.getTime() - now_time.getTime()) / 1000);
          // 把時間設成 select_time
          setSeconds(select_time);
          // 開始計時
          setIsActive(true);
        } else {
          setIsActive(true);
        }
      } else {
        setIsActive(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`mt-4 px-6 py-2 text-white rounded hover:cursor-pointer transition-colors active:scale-95 duration-75
          ${isActive ? 'bg-red-500 hover:bg-red-500/80' : 'bg-blue-500 hover:bg-blue-500/80'}`}
      >
        {isActive ? '結束專注' : '開始專注'}
      </button>
    </div>
  );
}
