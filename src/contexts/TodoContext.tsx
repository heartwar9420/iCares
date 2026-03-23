'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTodoList } from '../hooks/useTodoList';

// 自動抓取 useFocus 回傳的所有變數和函式類別， 不用手動寫interface
type TodoContextType = ReturnType<typeof useTodoList>;

// 建立 Context , 預設值要給 null
const TodoContext = createContext<TodoContextType | null>(null);

// 建立 Provider 元件
export function TodoProvider({ children }: { children: ReactNode }) {
  const todoState = useTodoList();

  return <TodoContext.Provider value={todoState}>{children}</TodoContext.Provider>;
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext 必須在 TodoProvider 中使用');
  }
  return context;
}
