'use client';

import useTimer from '@/src/hooks/useTimer';

import { createContext, useContext, ReactNode } from 'react';
import { useFocusContext } from './FocusContext';

// 自動抓取 useTimer 回傳的所有變數和函式類別， 不用手動寫interface
type TimerContextType = ReturnType<typeof useTimer>;

// 建立 Context , 預設值要給 null
const TimerContext = createContext<TimerContextType | null>(null);

// 建立 Provider 元件
export function TimerProvider({ children }: { children: ReactNode }) {
  // 從另一個context 中拿我們要用到的函式
  const { saveFocusToDatabase, activeId } = useFocusContext();

  const timerState = useTimer({
    onWorkEnd: (startTime, endTime, duration) => {
      saveFocusToDatabase(startTime, endTime, duration, activeId);
    },
  });

  return <TimerContext.Provider value={timerState}>{children}</TimerContext.Provider>;
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext 必須在 TimerProvider 中使用');
  }
  return context;
}
