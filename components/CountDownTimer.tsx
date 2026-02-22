import React, { useEffect } from 'react';

interface Props {
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  // 等同於 setSeconds: (val: number | ((prev: number) => number)) => void;
  isActive: boolean;
  mode: 'work' | 'rest' | 'long_rest';
  // 不用 string 而是讓變數是特定的幾個字 (可以用 聯集型別！)
  setMode: React.Dispatch<React.SetStateAction<'work' | 'rest' | 'long_rest'>>;
  startNewTimer: (targetMode?: 'work' | 'rest' | 'long_rest') => Promise<void>;
}

export default function CountDownTimer({
  seconds,
  setSeconds,
  isActive,
  mode,
  setMode,
  startNewTimer,
}: Props) {
  // Math.floor = 把小數點後面的數字全部切掉
  const minutes = Math.floor(seconds / 60);
  // % = 取餘數
  const remainSeconds = seconds % 60;
  const modeText = {
    work: '專注中',
    rest: '休息中',
    long_rest: '長休息',
  };

  useEffect(() => {
    if (isActive && seconds === 0) {
      if (mode === 'work') {
        startNewTimer('rest');
      } else {
        setMode('work');
        startNewTimer('work');
      }
      return;
    }
    if (!isActive || seconds <= 0) {
      return;
    }

    // setInterval((),1000) = 每隔 1000 毫秒執行一次前面的動作
    const timerId = setInterval(() => {
      // setSeconds((先去看一下目前的數字) => 把目前的數字 -1 再放回來)
      setSeconds((prev) => prev - 1);
      // 每隔1秒做一次
    }, 1000);

    // 撤銷這張號碼牌對應的計時任務，確保舊的計時器被清乾淨，不浪費記憶體。
    return () => clearInterval(timerId);
  }, [seconds, isActive, mode, startNewTimer, setMode, setSeconds]);
  // 依賴陣列 當秒數變更或 開始專注後 就重新執行一次這個 useEffect
  // 要把所以在 useEffect 中用過的變數都放進去，不然會出現黃色波浪號

  return (
    <div className="flex gap-5 bg-orange-800 rounded-2xl p-3 h-fit min-w-80 w-fit mt-10 mx-10 justify-center">
      <div className="text-4xl font-mono text-amber-50">
        {isActive ? `${modeText[mode]}` : '準備開始'}
      </div>
      <div className="text-4xl font-mono text-amber-50 ">
        {/* 當秒數小於 10 ， 在前面加一個 0 ， 三元運算子 */}
        {minutes}:{remainSeconds < 10 ? `0${remainSeconds}` : remainSeconds}
      </div>
    </div>
  );
}
