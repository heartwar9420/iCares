'use client';

interface TimerProps {
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  // 等同於 setSeconds: (val: number | ((prev: number) => number)) => void;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'work' | 'rest' | 'longRest';
  setMode: React.Dispatch<React.SetStateAction<'work' | 'rest' | 'longRest'>>;
  startNewTimer: (targetMode?: 'work' | 'rest' | 'longRest') => Promise<void>;
}
interface VideoProps {
  size: number;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}
type AllProps = TimerProps & VideoProps;

import ChatRoom from './ChatRoom';
import CountDownTimer from './CountDownTimer';
import SettingBar from './SettingBar';

export default function FocusBoard(props: AllProps) {
  return (
    <div>
      <SettingBar {...props} />
      <CountDownTimer {...props} />
      <ChatRoom />
    </div>
  );
}
