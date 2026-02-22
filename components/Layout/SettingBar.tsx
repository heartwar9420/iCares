interface Props {
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}

import { Info, MonitorPause, MonitorPlay, Volume2, VolumeOff } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';

export default function SettingBar({ isMuted, setIsMuted, isPaused, setIsPaused }: Props) {
  const size = 36;
  return (
    <div className="flex gap-10 py-2 px-5 ml-10 mt-10 w-fit h-fit rounded-2xl bg-amber-900 opacity-90">
      <ActionIconButton>
        <Info size={size} color="#fef3c7" />
      </ActionIconButton>
      <ActionIconButton onClick={() => setIsMuted(!isMuted)}>
        {isMuted ? (
          <VolumeOff size={size} color="#fef3c7" />
        ) : (
          <Volume2 size={size} color="#fef3c7" />
        )}
      </ActionIconButton>
      <ActionIconButton onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? (
          <MonitorPause size={size} color="#fef3c7" />
        ) : (
          <MonitorPlay size={size} color="#fef3c7" />
        )}
      </ActionIconButton>
    </div>
  );
}
