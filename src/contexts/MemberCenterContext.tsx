'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useMemberCenter } from '../hooks/useMemberCenter';

// 自動抓取 useFocus 回傳的所有變數和函式類別， 不用手動寫interface
type MemberCenterContextType = ReturnType<typeof useMemberCenter>;

// 建立 Context , 預設值要給 null
const MemberCenterContext = createContext<MemberCenterContextType | null>(null);

// 建立 Provider 元件
export function MemberCenterProvider({ children }: { children: ReactNode }) {
  const memberCenterState = useMemberCenter();

  return (
    <MemberCenterContext.Provider value={memberCenterState}>
      {children}
    </MemberCenterContext.Provider>
  );
}

export function useMemberCenterContext() {
  const context = useContext(MemberCenterContext);
  if (!context) {
    throw new Error('useMemberCenterContext 必須在 MemberCenterProvider 中使用');
  }
  return context;
}
