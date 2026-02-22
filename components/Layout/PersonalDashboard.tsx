interface TimerProps {
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'work' | 'rest' | 'long_rest';
  setMode: React.Dispatch<React.SetStateAction<'work' | 'rest' | 'long_rest'>>;
  startNewTimer: (targetMode?: 'work' | 'rest' | 'long_rest') => Promise<void>;
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
