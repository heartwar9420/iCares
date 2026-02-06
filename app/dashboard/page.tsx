'use client';

import CountdownTimer from '@/components/CountDownTimer';
import { useState } from 'react';

export default function Page() {
  const [seconds, setSeconds] = useState(1500);
  const [isActive, setIsActive] = useState(false);

  const handleActive = () => {
    if (!isActive) {
      setIsActive(true);
    } else {
      setIsActive(false);
      setSeconds(1500);
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <CountdownTimer seconds={seconds} setSeconds={setSeconds} isActive={isActive} />

      <button
        onClick={handleActive}
        className={`mt-4 px-6 py-2 text-white rounded hover:cursor-pointer transition-colors 
          ${isActive ? 'bg-red-500 hover:bg-red-500/80' : 'bg-blue-500 hover:bg-blue-500/80'}`}
      >
        {isActive ? '結束專注' : '開始專注'}
      </button>
    </div>
  );
}
