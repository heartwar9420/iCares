'use client';

import { Github, ShieldCheck, User } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import { useMemberCenterContext } from '@/src/contexts/MemberCenterContext';
import VerifyPasswordModal from './VerifyPasswordModal';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function UserProfile() {
  const {
    setInputUserName,
    inputUserName,
    handleUpdateDisplayName,
    isUpdating,
    isLoading,
    openVerifyPasswordModal,
    isVerifyPasswordModalOpen,
    closeVerifyPasswordModal,
    userProfile,
    handleUpdateAvatar,
    handleDeleteAvatar,
  } = useMemberCenterContext();

  const [isEditingName, setIsEditingName] = useState(false);

  // 設定是否點擊背景
  const [isClickingBackdrop, setIsClickingBackdrop] = useState(false);

  //確認刪除
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  // 如果按下的時候在背景
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsClickingBackdrop(true);
    }
  };
  // 如果放開的時候在背景 且 按下的時候也在背景
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isClickingBackdrop && e.target === e.currentTarget) {
      closeVerifyPasswordModal();
    }
    setIsClickingBackdrop(false);
  };

  // 用來觸發隱藏的 input 的 Ref
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // 觸發隱藏的 input 的函式
  const handleUploadAvatarClick = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const avatarFile = e.target.files?.[0];
    if (avatarFile) {
      handleUpdateAvatar(avatarFile);
    }
  };

  useEffect(() => {
    if (userProfile?.displayName) {
      setInputUserName(userProfile.displayName);
    }
  }, [userProfile?.displayName, setInputUserName]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* 個人設定區塊  */}
      <div className="bg-[#1e2433] rounded-2xl p-8 border border-slate-700/50">
        {/* 大頭貼 */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden mb-4 ring-2 ring-slate-700">
            {userProfile.avatarUrl ? (
              <Image src={userProfile.avatarUrl} alt="User Avatar" fill className="object-cover" />
            ) : (
              <User className="w-24 h-24" />
            )}
          </div>
          <div className="flex gap-4">
            <ActionIconButton
              onClick={handleUploadAvatarClick}
              className="px-4 py-2 text-slate-400 bg-slate-600/30 border border-slate-500/80 hover:bg-slate-600 hover:text-white rounded-lg transition-colors"
            >
              更換大頭照
              <input
                type="file"
                ref={avatarFileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </ActionIconButton>
            {!isConfirmDelete ? (
              <ActionIconButton
                onClick={() => {
                  setIsConfirmDelete(true);
                }}
                className="px-4 py-2 bg-slate-600/30 text-slate-400 border border-slate-500/80 hover:bg-slate-600 hover:text-white rounded-lg transition-colors"
              >
                刪除大頭貼
              </ActionIconButton>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <ActionIconButton
                  className="px-4 py-2 bg-green-500/10  text-green-300 border border-green-300/30 hover:border-green-300/50 hover:text-white rounded-lg transition-colors"
                  onClick={() => {
                    setIsConfirmDelete(false);
                  }}
                >
                  取消刪除
                </ActionIconButton>
                <ActionIconButton
                  className="px-4 py-2 bg-red-500/10  text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:text-white rounded-lg transition-colors"
                  onClick={() => {
                    handleDeleteAvatar();
                    setIsConfirmDelete(false);
                  }}
                >
                  確認刪除
                </ActionIconButton>
              </div>
            )}
          </div>
        </div>

        {/* 暱稱修改 */}
        <div className="w-full max-w-sm mx-auto border-t border-slate-700 pt-6">
          <div className="text-slate-500 text-xl mb-6">修改暱稱</div>
          {isEditingName ? (
            // 修改模式
            <div className="flex gap-3">
              <input
                disabled={isLoading}
                type="text"
                value={inputUserName}
                onChange={(e) => setInputUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (inputUserName.trim() !== '' && inputUserName !== userProfile?.displayName) {
                      handleUpdateDisplayName();
                    }
                  }
                  if (e.key === 'Escape') setInputUserName(userProfile.displayName);
                }}
                className="flex-1 bg-[#151a26] border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
              <ActionIconButton
                onClick={handleUpdateDisplayName}
                disabled={
                  isUpdating || !inputUserName.trim() || inputUserName === userProfile?.displayName
                }
                className="px-6 py-2 flex bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                {isUpdating ? '儲存中' : '儲存'}
              </ActionIconButton>
              <ActionIconButton
                onClick={() => {
                  setInputUserName(userProfile?.displayName || '');
                  setIsEditingName(false);
                }}
                disabled={isUpdating}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors shrink-0"
              >
                取消
              </ActionIconButton>
            </div>
          ) : (
            // 檢視模式
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <span className="text-slate-200 text-lg">
                {userProfile?.displayName || '尚未設定暱稱'}
              </span>
              <ActionIconButton
                onClick={() => setIsEditingName(true)}
                className="text-slate-400 hover:text-white hover:bg-orange-500 px-3 py-1 bg-white/5 rounded-md"
              >
                編輯
              </ActionIconButton>
            </div>
          )}
        </div>
      </div>

      {/* 帳號安全區塊 */}
      <div className="bg-[#1e2433] rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-orange-500" />
          <h3 className="text-lg font-bold tracking-widest text-slate-200">帳號安全</h3>
        </div>

        <div className="flex flex-col gap-6">
          {/* Email */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-700/50">
            <div className="flex flex-col items-start">
              <div className="text-slate-400 text-base">電子郵件帳號</div>
              <div className="text-slate-200 text-lg">{userProfile.email}</div>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
              唯讀
            </span>
          </div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-700/50">
            <div className=" text-slate-400">帳號密碼</div>
            <ActionIconButton
              onClick={openVerifyPasswordModal}
              className="px-4 py-2 border border-slate-600 hover:bg-slate-700 text-slate-200  rounded-lg transition-colors"
            >
              修改密碼
            </ActionIconButton>
          </div>

          {/* 第三方綁定
          <div>
            <div className=" text-slate-400 mb-3">第三方帳號綁定</div>
            <div className="grid grid-cols-2 gap-4">
              <ActionIconButton className="flex items-center justify-center gap-2 py-3 bg-[#151a26] border border-slate-700 hover:border-slate-500 rounded-lg text-slate-200 text-sm transition-colors">
                <span className="w-4 h-4 bg-white rounded-sm"></span> Google
              </ActionIconButton>
              <ActionIconButton className="flex items-center justify-center gap-2 py-3 bg-[#151a26] border border-slate-700 hover:border-slate-500 rounded-lg text-slate-200 text-sm transition-colors">
                <Github />
                GitHub
              </ActionIconButton>
            </div>
          </div> */}
        </div>
      </div>

      {/* 密碼修改彈窗 */}
      {isVerifyPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            className="relative overflow-hidden bg-[#111827] rounded-2xl border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <VerifyPasswordModal />
          </div>
        </div>
      )}
    </div>
  );
}
