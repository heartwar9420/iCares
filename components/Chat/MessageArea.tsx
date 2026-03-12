import { useState, useEffect, useRef } from 'react';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';

interface Props {
  onNewMessage?: () => void;
  shouldFocus?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function MessageArea({ onNewMessage, shouldFocus }: Props) {
  const [messageHistoryList, setMessageHistoryList] = useState<ChatMessage[]>([]);
  const webSocketReference = useRef<WebSocket | null>(null);
  const [currentUserName] = useState<string>('Me');

  useEffect(() => {
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // replace = 字串替換, /^http/ = 正規表達式 , / / = 開始和結束
    // ^ =從字串的最開頭比對, http = 要找的文字 'ws' = 要替換成的文字
    // 這一行 = 把 http://localhost:8000 替換成 ws://localhost:8000
    const webSocketUrl = baseApiUrl.replace(/^http/, 'ws') + '/api/chat';

    // 建立一個真正的 WebSocket 連線實例
    const serverConnection = new WebSocket(webSocketUrl);

    // 將連線實例存入 useRef 中 ， 這樣在 useEffect 以外也能呼叫(發送訊息)
    webSocketReference.current = serverConnection;

    // 成功連線時 console 成功訊息
    serverConnection.onopen = () => {
      console.log('已連線到聊天伺服器');
    };

    // 當收到新訊息時觸發
    serverConnection.onmessage = (incomingEvent) => {
      // 把後端傳來的 JSON 格式 解析成 JS 物件
      const parsedData = JSON.parse(incomingEvent.data);

      // 把解析好的資料包裝成前端定義的 ChatMessage 格式
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: parsedData.sender,
        content: parsedData.content,
        timestamp: parsedData.timestamp,
      };

      // 使用 Functional Update 更新狀態，確保拿到最新的訊息列表 且 把新訊息放到最後面
      setMessageHistoryList((prev) => [...prev, newMessage]);

      // 當收到新訊息時，觸發通知函式！
      if (onNewMessage) {
        onNewMessage();
      }
    };

    // 結束後就把連線關掉
    return () => {
      serverConnection.close();
    };
  }, [onNewMessage]);

  const handleSendMessage = (newContent: string) => {
    // 確認 WebSocket 實例存在 且 連線狀態是 OPEN
    if (webSocketReference.current && webSocketReference.current.readyState === WebSocket.OPEN) {
      // 把要傳送的傳訊打包成一個物件
      const outgoingPayload = {
        sender: currentUserName,
        content: newContent,
      };
      // 把打包好的物件 轉成字串後 傳送出去
      webSocketReference.current.send(JSON.stringify(outgoingPayload));
    } else {
      console.warn('連線尚未完成，請稍後再試');
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
      {/* 標題列 */}
      <div className="shrink-0 p-4 bg-black/20 flex items-center justify-between">
        <div className="text-sm font-bold tracking-widest text-slate-400">FOCUS CHAT</div>
      </div>

      {/* 歷史訊息 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
        <MessageHistory messageHistoryList={messageHistoryList} currentUserName={currentUserName} />
      </div>

      {/* 輸入框 */}
      <div className="shrink-0 p-4 bg-black/20 ">
        <MessageInput onSendMessage={handleSendMessage} shouldFocus={shouldFocus} />
      </div>
    </div>
  );
}
