'use client';

import { User } from 'lucide-react';

export interface UserStatus {
  id: string;
  name: string;
  isConnected: boolean;
  privacyMode: 'Public' | 'Hidden';
  autoStatus: '專注中' | '閒置中' | '離線中';
}

interface OnlineUserListProps {
  userList: UserStatus[];
}

export default function OnlineUserList({ userList }: OnlineUserListProps) {
  const onlineCount = userList.filter(
    (user) => user.isConnected && user.privacyMode === 'Public',
  ).length;

  return (
    <div className="flex flex-col h-full w-full rounded-3xl">
      <div className="px-4 py-3 text-slate-300 font-medium border-b border-white/10 mb-2">
        線上人數 ({onlineCount})
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        {userList.map((user) => {
          const isVisible = user.isConnected && user.privacyMode === 'Public';

          return (
            <div
              key={user.id}
              className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all
                ${isVisible ? 'hover:bg-white/5' : 'opacity-80 hover:bg-white/5'}`}
            >
              <div className="relative shrink-0 mr-4">
                {/* 大頭貼 */}
                <div
                  className={`p-3 rounded-full border border-white/10 ${isVisible ? 'bg-white/10' : 'bg-white/8'}`}
                >
                  <User size={24} className={isVisible ? 'text-slate-300' : 'text-slate-500'} />
                </div>
                {/* 上線綠點 */}
                {isVisible && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0e17] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                )}
              </div>
              {/* 名字 */}
              <div className="flex flex-col">
                <span
                  className={`text-base font-medium tracking-wide ${isVisible ? 'text-slate-100' : 'text-slate-500'}`}
                >
                  {user.name}
                </span>
                {/* 狀態 */}
                <div
                  className={`rounded text-sm py-1 transition-all text-slate-400 ${isVisible ? 'text-slate-200' : 'text-slate-500'}`}
                >
                  {isVisible ? user.autoStatus : '離線中'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
