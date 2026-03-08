import { useState, useEffect, useRef } from 'react';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';

export interface ChatMessage {
  id: string; // id(key)
  sender: string; // 發送者
  content: string; // 內容
  timestamp: string; // 發送時間
}

export default function MessageArea() {
  // 用來存放歷史訊息的陣列
  const [messageHistoryList, setMessageHistoryList] = useState<ChatMessage[]>([]);

  // 建立一個 Ref 讓他不會被 React 畫面更新打斷 ，用來放和伺服器的連線
  // 預設 這個 reference 的 current 只能接受 WebSocket 或是 null 且預設是 null
  const webSocketReference = useRef<WebSocket | null>(null);

  // 建立當前使用者的身份狀態
  const [currentUserName] = useState<string>('小飯');

  useEffect(() => {
    // 建立連線
    const serverConnection = new WebSocket('ws://localhost:8000/api/chat');

    webSocketReference.current = serverConnection;
    // 如果連線成功 就console一個訊息出來
    serverConnection.onopen = () => {
      console.log('已連線到伺服器');
    };
    // 如果有新訊息 就把他加到 messageHistoryList 中
    serverConnection.onmessage = (incomingEvent) => {
      const parsedData = JSON.parse(incomingEvent.data);

      const newMessage: ChatMessage = {
        id: crypto.randomUUID(), // 生成一個隨機的 ID
        // 從後端傳來的 Data 中取出我們要的資料
        sender: parsedData.sender,
        content: parsedData.content,
        timestamp: parsedData.timestamp,
      };
      // 拷貝一份舊陣列 裝入 新的陣列中，並且把新訊息接在新陣列的最後面
      setMessageHistoryList((prev) => [...prev, newMessage]);
    };
    // 結束後把伺服器連線關閉
    return () => {
      serverConnection.close();
    };
  }, []);

  // 用來接收訊息的函式
  const handleSendMessage = (newContent: string) => {
    // 確定目前和伺服器有連線中 且 伺服器已經準備完畢，再 send 新訊息給伺服器
    if (webSocketReference.current && webSocketReference.current.readyState === WebSocket.OPEN) {
      const outgoing_payload = {
        sender: currentUserName,
        content: newContent,
      };
      webSocketReference.current.send(JSON.stringify(outgoing_payload));
    } else {
      console.warn('連線尚未完成，請稍後再試');
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-2xl overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-y-auto bg-yellow-400">
        <MessageHistory messageHistoryList={messageHistoryList} currentUserName={currentUserName} />
      </div>
      <div className="flex shrink-0">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
