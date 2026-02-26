import React, { useEffect } from 'react';

interface Props {
  remainingSeconds: number;
  setRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;
  // 等同於 setSeconds: (val: number | ((prev: number) => number)) => void;
  isTimerRunning: boolean;
  mode: 'work' | 'rest' | 'long_rest';
  // 不用 string 而是讓變數是特定的幾個字 (可以用 聯集型別！)
  setMode: React.Dispatch<React.SetStateAction<'work' | 'rest' | 'long_rest'>>;
  startNewTimer: (targetMode?: 'work' | 'rest' | 'long_rest') => Promise<void>;
}

export default function CountDownTimer({ remainingSeconds, isTimerRunning, mode }: Props) {
  // Math.floor = 把小數點後面的數字全部切掉
  const minutes = Math.floor(remainingSeconds / 60);
  // % = 取餘數
  const displaySeconds = remainingSeconds % 60;
  const modeText = {
    work: '專注中',
    rest: '休息中',
    long_rest: '長休息',
  };

  return (
    <div className="flex gap-5 bg-orange-800 rounded-2xl p-3 h-fit min-w-80 w-fit mt-10 mx-10 justify-center">
      <div className="text-4xl font-mono text-amber-50">
        {isTimerRunning ? `${modeText[mode]}` : '準備開始'}
      </div>
      <div className="text-4xl font-mono text-amber-50 ">
        {/* 當秒數小於 10 ， 在前面加一個 0 ， 三元運算子 */}
        {minutes}:{displaySeconds < 10 ? `0${displaySeconds}` : displaySeconds}
      </div>
    </div>
  );
}
