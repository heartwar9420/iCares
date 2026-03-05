'use client';

import BackgroundVideo from '@/components/Layout/BackgroundVideo';
import useTimer from '@/hooks/useTimer';
import FocusBoard from '@/components/Layout/FocusBoard';
import useVideoController from '@/hooks/useVideoController';
import PersonalDashboard from '@/components/Layout/PersonalDashboard';
import { TimerProvider } from '@/Context/TimerContext';

export default function Page() {
  const timer = useTimer();
  const video = useVideoController();

  return (
    <TimerProvider>
      <div className="relative max-h-screen min-h-screen grid grid-cols-2 overflow-hidden">
        <FocusBoard {...timer} {...video} />
        <PersonalDashboard />
        <BackgroundVideo {...video} />
      </div>
    </TimerProvider>
  );
}
