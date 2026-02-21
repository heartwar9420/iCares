interface TimerProps {
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'work' | 'rest' | 'longRest';
  setMode: React.Dispatch<React.SetStateAction<'work' | 'rest' | 'longRest'>>;
  startNewTimer: (targetMode?: 'work' | 'rest' | 'longRest') => Promise<void>;
}

import FocusButton from './FocusButton';

export default function PersonalDashboard(props: TimerProps) {
  return <FocusButton {...props} />;
}
