'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useProfile } from '../hooks/useProfile';

// 自動抓取 useFocus 回傳的所有變數和函式類別， 不用手動寫interface
type ProfileContextType = ReturnType<typeof useProfile>;

// 建立 Context , 預設值要給 null
const ProfileContext = createContext<ProfileContextType | null>(null);

// 建立 Provider 元件
export function ProfileProvider({ children }: { children: ReactNode }) {
  const profileState = useProfile();

  return <ProfileContext.Provider value={profileState}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('ProfileContext 必須在 ProfileProvider 中使用');
  }
  return context;
}
