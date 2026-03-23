'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTodosHistory } from '../hooks/useTodosHistory';

// 自動抓取 useFocus 回傳的所有變數和函式類別， 不用手動寫interface
type TodosHistoryContextType = ReturnType<typeof useTodosHistory>;

// 建立 Context , 預設值要給 null
const TodosHistoryContext = createContext<TodosHistoryContextType | null>(null);

// 建立 Provider 元件
export function TodosHistoryProvider({ children }: { children: ReactNode }) {
  const todosHistoryState = useTodosHistory();

  return (
    <TodosHistoryContext.Provider value={todosHistoryState}>
      {children}
    </TodosHistoryContext.Provider>
  );
}

export function useTodosHistoryContext() {
  const context = useContext(TodosHistoryContext);
  if (!context) {
    throw new Error('useTodosHistoryContext 必須在 TodosHistoryProvider 中使用');
  }
  return context;
}
