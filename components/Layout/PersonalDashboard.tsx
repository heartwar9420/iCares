import ActivityGrid from '../Stats/ActivityGrid';
import AuthButtonGroup from '../Auth/AuthButtonGroup';
import TodoList from '../Todo/TodoList';
import TimerControls from '../Timer/TimerControls';

export default function PersonalDashboard() {
  return (
    <div className="grid grid-rows-[auto_1fr_1fr_auto] h-screen items-start">
      <AuthButtonGroup />
      <TodoList />
      <ActivityGrid />
      <TimerControls />
    </div>
  );
}
