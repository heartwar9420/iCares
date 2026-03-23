'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFocus } from '../hooks/useFocus';

// 自動抓取 useFocus 回傳的所有變數和函式類別， 不用手動寫interface
type FocusContextType = ReturnType<typeof useFocus>;

// 建立 Context，初始值先給 undefined (尚未賦值用 undefined)，並套用剛剛寫好的 Interface
const FocusContext = createContext<FocusContextType | undefined>(undefined);

// 建立 Provider 元件
export function FocusProvider({ children }: { children: ReactNode }) {
  const focusState = useFocus();

  return <FocusContext.Provider value={focusState}>{children}</FocusContext.Provider>;
}

export function useFocusContext() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus 必須在 FocusProvider 中使用');
  }
  return context;
}
