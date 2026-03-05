import { Settings } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import { useTimerContext } from '@/Context/TimerContext';

export default function TimerSettingButton() {
  const {
    setIsTimerConfigOpen,
    isTimerConfigOpen,
    isTimerRunning,
    originTimerMode,
    setOriginTimerMode,
    timerCombo,
    setTimerCombo,
    timerDurationConfigs,
    setTimerDurationConfigs,
    isReplay,
    setIsReplay,
  } = useTimerContext();

  return (
    <div>
      <ActionIconButton
        className="w-fit h-fit"
        disabled={isTimerRunning}
        onClick={() => {
          setIsTimerConfigOpen(!isTimerConfigOpen);
          if (!isTimerConfigOpen) {
            setOriginTimerMode({ timerCombo, timerDurationConfigs, isReplay });
          }
          if (originTimerMode) {
            setIsReplay(originTimerMode.isReplay);
            setTimerCombo(originTimerMode.timerCombo);
            setTimerDurationConfigs(originTimerMode.timerDurationConfigs);
          }
        }}
      >
        <Settings size={48} color="#fef3c7" />
      </ActionIconButton>
    </div>
  );
}
