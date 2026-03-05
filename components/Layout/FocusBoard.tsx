'use client';

interface VideoProps {
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}

import ChatRoom from '../Chat/ChatRoom';
import CountDownTimer from '../Timer/CountDownTimer';
import SettingBar from './SettingBar';

export default function FocusBoard(props: VideoProps) {
  return (
    <div>
      <SettingBar {...props} />
      <CountDownTimer />
      <ChatRoom />
    </div>
  );
}
