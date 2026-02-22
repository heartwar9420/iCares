interface TimerProps {
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'work' | 'rest' | 'longRest';
  setMode: React.Dispatch<React.SetStateAction<'work' | 'rest' | 'longRest'>>;
  startNewTimer: (targetMode?: 'work' | 'rest' | 'longRest') => Promise<void>;
}

import ActivityGrid from '../Stats/ActivityGrid';
import AuthButtonGroup from '../Auth/AuthButtonGroup';
import TodoList from '../Todo/TodoList';
import FocusButton from '../UI/FocusButton';

export default function PersonalDashboard(props: TimerProps) {
  return (
    <div className="grid grid-rows-[auto 1fr 1fr auto]">
      <AuthButtonGroup />
      <TodoList />
      <ActivityGrid />
      <FocusButton {...props} />
    </div>
  );
}
