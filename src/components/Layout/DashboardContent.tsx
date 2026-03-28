import FocusCore from './FocusCore';
import SocialPanel from './SocialPanel';
import TaskPanel from './TaskPanel';

export default function DashboardContent() {
  return (
    // calc = CSS 計算函式 , 100vh = 100% 4rem = NavBar的高度
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 h-auto lg:h-[calc(100vh-6rem)] lg:overflow-hidden max-w-400 mx-auto w-full">
      {/* SocialPanel */}
      <div className="order-3 lg:order-1 col-span-1 lg:col-span-3 flex flex-col h-full min-h-0">
        <div className="h-full overflow-y-auto pr-2">
          <SocialPanel />
        </div>
      </div>

      {/* FocusCore */}
      <div className="order-1 lg:order-2 col-span-1 lg:col-span-6 flex flex-col h-full min-h-0 justify-center">
        <div className="h-full overflow-y-auto pr-2 flex flex-col justify-center">
          <FocusCore />
        </div>
      </div>

      {/* TaskPanel */}
      <div className="order-2 lg:order-3 col-span-1 lg:col-span-3 flex flex-col h-full min-h-0">
        <div className="h-full overflow-y-auto pr-2">
          <TaskPanel />
        </div>
      </div>
    </div>
  );
}
