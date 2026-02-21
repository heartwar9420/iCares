'use client';

import BackgroundVideo from '@/components/BackgroundVideo';
import useTimer from '@/hooks/useTimer';
import FocusBoard from '@/components/FocusBoard';
import useVideoController from '@/hooks/useVideoController';
import PersonalDashboard from '@/components/PersonalDashboard';

export default function Page() {
  const timer = useTimer();
  const video = useVideoController();

  return (
    <div className="relative min-h-screen grid grid-cols-2 overflow-hidden">
      <FocusBoard {...timer} {...video} />
      <PersonalDashboard {...timer} />
      <BackgroundVideo {...video} />
    </div>
  );
}
