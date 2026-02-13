'use client';

import CountDownTimer from '@/components/CountDownTimer';
import FocusButton from '@/components/FocusButton';
import BackgroundVideo from '@/components/BackgroundVideo';
import useTimer from '@/hooks/useTimer';

export default function Page() {
  const timer = useTimer();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-10 overflow-hidden">
      <CountDownTimer {...timer} />
      <FocusButton {...timer} />
      <BackgroundVideo />
    </div>
  );
}
