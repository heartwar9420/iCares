'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useChat } from '../hooks/useChat';

// 自動抓取 useChat 回傳的所有變數和函式類別， 不用手動寫interface
type ChatContextType = ReturnType<typeof useChat>;

// 建立 Context，初始值先給 undefined (尚未賦值用 undefined)，並套用剛剛寫好的 Interface
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 建立 Provider 元件
export function ChatProvider({ children }: { children: ReactNode }) {
  const chatState = useChat();

  return <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat 必須在 ChatProvider 中使用');
  }
  return context;
}
