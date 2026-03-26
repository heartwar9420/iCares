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
  // 只計算連線中且公開的人
  const onlineCount = userList.filter(
    (user) => user.isConnected && user.privacyMode === 'Public',
  ).length;

  return (
    <div className="flex flex-col h-full w-full rounded-3xl">
      <div className="px-4 py-3 text-slate-300 font-medium border-b border-white/10 mb-2">
        線上人數　-　{onlineCount}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        {userList.map((user) => {
          // 判斷是否顯示「線上狀態」
          const isActuallyOnline = user.isConnected && user.privacyMode === 'Public';

          return (
            <div
              key={user.id}
              className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all
                ${isActuallyOnline ? 'hover:bg-white/5 opacity-100' : 'opacity-50 hover:opacity-80'}`}
            >
              <div className="relative shrink-0 mr-4">
                <div
                  className={`p-3 rounded-full border border-white/10 ${isActuallyOnline ? 'bg-white/10' : 'bg-transparent'}`}
                >
                  <User
                    size={24}
                    className={isActuallyOnline ? 'text-slate-300' : 'text-slate-600'}
                  />
                </div>

                {/* 只有公開上線才顯示綠點 */}
                {isActuallyOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0e17] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                )}
              </div>

              <div className="flex flex-col">
                <span
                  className={`text-base font-medium tracking-wide ${isActuallyOnline ? 'text-slate-100' : 'text-slate-500'}`}
                >
                  {user.name}
                </span>
                <div className="text-sm py-1 text-slate-500">
                  {isActuallyOnline ? user.autoStatus : '離線'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
