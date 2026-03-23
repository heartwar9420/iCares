'use client';

import UserProfile from './UserProfile';
import FocusHistory from './FocusHistory';
import TodosHistory from './TodosHistory';

import ActionIconButton from '../UI/ActionIconButton';
import { SquareX } from 'lucide-react';
import { useMemberCenterContext } from '@/src/contexts/MemberCenterContext';

export default function MemberCenterModal() {
  const { closeMemberCenter, setActiveTab, activeTab } = useMemberCenterContext();

  return (
    <div className="flex flex-col w-full h-full text-slate-200">
      {/* 標題切換 */}
      <div className="flex flex-col items-center pt-10 pb-6 border-b border-slate-800/80 shrink-0 relative">
        {/* 關閉按鈕 */}
        <ActionIconButton
          onClick={closeMemberCenter}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <SquareX />
        </ActionIconButton>

        <div className="text-3xl font-bold mb-6 tracking-widest">會員中心</div>

        {/* Tab 按鈕群組 */}
        <div className="flex bg-[#151a26] p-1 rounded-xl">
          <ActionIconButton
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-lg text-xl font-medium tracking-widest transition-all ${
              activeTab === 'profile' ? 'bg-orange-500 text-white' : 'text-slate-400 '
            }`}
          >
            個人與帳號設定
          </ActionIconButton>
          <ActionIconButton
            onClick={() => setActiveTab('focus')}
            className={`px-6 py-2 rounded-lg text-xl font-medium tracking-widest transition-all ${
              activeTab === 'focus' ? 'bg-orange-500 text-white' : 'text-slate-400 '
            }`}
          >
            專注紀錄
          </ActionIconButton>
          <ActionIconButton
            onClick={() => setActiveTab('todos')}
            className={`px-6 py-2 rounded-lg text-xl font-medium tracking-widest transition-all ${
              activeTab === 'todos' ? 'bg-orange-500 text-white' : 'text-slate-400 '
            }`}
          >
            已完成待辦
          </ActionIconButton>
        </div>
      </div>

      {/* 彈窗內容區塊 */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'profile' && <UserProfile />}
        {activeTab === 'focus' && <FocusHistory />}
        {activeTab === 'todos' && <TodosHistory />}
      </div>
    </div>
  );
}
