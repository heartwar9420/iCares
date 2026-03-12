'use client';

import MusicPlayer from '../Music/MusicPlayer';
import TodoList from '../Todo/TodoList';

export default function TaskPanel() {
  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      {/* 1. 上半部：深度工作任務區塊 */}
      <div className="flex-1 overflow-hidden">
        <TodoList />
      </div>

      {/* 2. 下半部：音樂播放器區塊 */}
      <div className="shrink-0 h-32 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden relative transition-all hover:border-white/20">
        <MusicPlayer />
      </div>
    </div>
  );
}
