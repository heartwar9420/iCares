'use client';

import CountdownTimer from '@/components/CountDownTimer';
import FocusButton from '@/components/FocusButton';
import { useState } from 'react';

export default function Page() {
  // 設定時間，預設數字
  const [seconds, setSeconds] = useState(0);
  // 是否計時，預設暫停
  const [isActive, setIsActive] = useState(false);
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-10 overflow-hidden">
      <CountdownTimer seconds={seconds} setSeconds={setSeconds} isActive={isActive} />
      <FocusButton
        seconds={seconds}
        setSeconds={setSeconds}
        isActive={isActive}
        setIsActive={setIsActive}
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-fill -z-10 blur scale-200 brightness-75"
      >
        <source src="/test6.mp4" type="video/mp4" />
      </video>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-contain -z-5 opacity-80 drop-shadow-2xl"
      >
        <source src="/test6.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
