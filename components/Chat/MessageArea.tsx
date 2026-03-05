import { useState } from 'react';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function MessageArea() {
  // 用來存放歷史訊息的陣列
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);
  // 用來抓發送時間
  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // 用來接收訊息的函式
  const handleSendMessage = (newContent: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'Me', //暫時寫死
      content: newContent,
      timestamp: currentTime,
    };
    setMessageHistory((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex flex-col h-full w-full rounded-2xl overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-y-auto bg-yellow-400">
        <MessageHistory messageHistory={messageHistory} />
      </div>
      <div className="flex shrink-0">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
