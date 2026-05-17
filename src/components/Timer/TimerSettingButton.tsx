import { Settings } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import { useTimerStore } from '@/src/stores/useTimerStore';
import React from 'react';

const TimerSettingButton = React.memo(function TimerSettingButton() {
  const isTimerConfigOpen = useTimerStore((s) => s.isTimerConfigOpen);
  const setIsTimerConfigOpen = useTimerStore((s) => s.setIsTimerConfigOpen);
  const isTimerRunning = useTimerStore((s) => s.isTimerRunning);
  const hasRemainingTime = useTimerStore((s) => s.remainingSeconds > 0);

  return (
    <div>
      <ActionIconButton
        className="w-fit h-fit"
        disabled={isTimerRunning || hasRemainingTime}
        onClick={() => {
          setIsTimerConfigOpen(!isTimerConfigOpen);
        }}
      >
        <Settings className="w-10 h-10 text-slate-500 hover:text-white transition-colors duration-200" />
      </ActionIconButton>
    </div>
  );
});
export default TimerSettingButton;
