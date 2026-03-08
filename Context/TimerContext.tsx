'use client';

import useTimer from '@/hooks/useTimer';

import { createContext, useContext, ReactNode } from 'react';

// 自動抓取 useTimer 回傳的所有變數和函式類別， 不用手動寫interface
type TimerContextType = ReturnType<typeof useTimer>;

// 建立 Context , 預設值要給 null
const TimerContext = createContext<TimerContextType | null>(null);

// 建立 Provider 元件
export function TimerProvider({ children }: { children: ReactNode }) {
  const timerState = useTimer();

  return <TimerContext.Provider value={timerState}>{children}</TimerContext.Provider>;
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext 必須在 TimerProvider 中使用');
  }
  return context;
}
