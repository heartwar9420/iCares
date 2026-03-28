import { Settings } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import { useTimerContext } from '@/src/contexts/TimerContext';

export default function TimerSettingButton() {
  const { setIsTimerConfigOpen, isTimerConfigOpen, isTimerRunning, remainingSeconds } =
    useTimerContext();

  return (
    <div>
      <ActionIconButton
        className="w-fit h-fit"
        disabled={isTimerRunning || remainingSeconds !== 0}
        onClick={() => {
          setIsTimerConfigOpen(!isTimerConfigOpen);
        }}
      >
        <Settings className="w-10 h-10 text-slate-500 hover:text-white transition-colors duration-200" />
      </ActionIconButton>
    </div>
  );
}
