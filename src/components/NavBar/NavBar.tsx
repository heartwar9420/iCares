'use client';
import { CircleEllipsis } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';

import SettingModal from './SettingModal';
import MemberCenterModal from '../MemberCenter/MemberCenterModal';
import { useEffect, useRef } from 'react';
import { useMemberCenterContext } from '@/src/contexts/MemberCenterContext';
import HomePageButton from '../UI/HomePageButton';

export default function NavBar() {
  const {
    setIsSettingModalOpen,
    isSettingModalOpen,
    closeMemberCenter,
    isMemberCenterOpen,
    userProfile,
  } = useMemberCenterContext();

  const settingModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingModalRef.current && !settingModalRef.current.contains(e.target as Node)) {
        setIsSettingModalOpen(false);
      }
    };
    if (isSettingModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingModalOpen, setIsSettingModalOpen]);
  return (
    <nav className="relative flex text-slate-400 bg-[#161b26] text-center items-center p-5 border-b border-yellow-300/40 shadow-[0_4px_20px_-5px_rgba(255,179,71,0.2)]">
      <div className="flex gap-2 w-full justify-between items-center" ref={settingModalRef}>
        <HomePageButton />
        <div className="min-h-0">
          <ActionIconButton
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingModalOpen(!isSettingModalOpen);
            }}
            className="flex text-sm lg:text-base items-center bg-[#ffb347] hover:bg-orange-500 text-[#0a0e17] px-5 py-2 rounded-full font-bold transition gap-3"
          >
            {userProfile.displayName} 的個人設定
            <CircleEllipsis />
          </ActionIconButton>
        </div>
        {isSettingModalOpen && (
          <SettingModal onCloseSettingModal={() => setIsSettingModalOpen(false)} />
        )}
      </div>

      {isMemberCenterOpen && (
        /* 點擊遮罩時呼叫 closeCenter */
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={closeMemberCenter}
        >
          <div
            className="relative w-[90%] h-[85vh] overflow-hidden bg-[#111827] rounded-2xl border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <MemberCenterModal />
          </div>
        </div>
      )}
    </nav>
  );
}
