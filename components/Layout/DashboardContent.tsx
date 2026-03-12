import FocusCore from './FocusCore';
import SocialPanel from './SocialPanel';
import TaskPanel from './TaskPanel';

export default function DashboardContent() {
  return (
    // calc = CSS 計算函式 , 100vh = 100% 4rem = NavBar的高度
    <div className="grid grid-cols-12 gap-6 p-6 h-[calc(100vh-4rem)] overflow-hidden max-w-400 mx-auto w-full">
      <div className="col-span-3 h-full overflow-hidden">
        <SocialPanel />
      </div>
      <div className="col-span-6 flex flex-col h-full overflow-hidden">
        <FocusCore />
      </div>
      <div className="col-span-3 flex flex-col h-full overflow-hidden">
        <TaskPanel />
      </div>
    </div>
  );
}
