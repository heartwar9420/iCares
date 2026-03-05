import FocusButton from './FocusButton';
import TimerConfigPanel from './TimerConfigPanel';
import TimerSettingButton from './TimerSettingButton';

export default function TimerControls() {
  return (
    <div className="flex gap-10 items-center justify-center mb-10">
      <FocusButton />
      <TimerSettingButton />
      <TimerConfigPanel />
    </div>
  );
}
