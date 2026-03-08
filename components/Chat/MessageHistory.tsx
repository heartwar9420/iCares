import { ChatMessage } from './MessageArea';
import { useEffect, useRef } from 'react';

interface Props {
  messageHistoryList: ChatMessage[];
  currentUserName: string;
}

export default function MessageHistory({ messageHistoryList, currentUserName }: Props) {
  // 建立一個 Ref 來抓畫面最底部的聊天訊息 , 只能接受 HTMLDivElement 或 null 預設是 null
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 如果每次有新訊息就執行裡面的滾動指令
  useEffect(() => {
    if (messagesEndRef.current) {
      // smooth = 捲動動畫
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistoryList]);
  return (
    <div className="flex flex-col w-full">
      <div>
        {messageHistoryList.length === 0 ? (
          <div className="p-2">目前沒有訊息，來說點什麼吧</div>
        ) : (
          messageHistoryList.map((messageText) => {
            const isMyMessage = messageText.sender === currentUserName;
            return (
              <div
                key={messageText.id}
                className={`hover:bg-slate-400 rounded-xl p-2 flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
              >
                <div className="w-fit rounded-2xl flex ">
                  <div className="text-xl mr-3 text-black">{messageText.sender}</div>
                  <div className="text-[14px] text-gray-500 mt-1">{messageText.timestamp}</div>
                </div>

                <div className="text-xl text-gray-600">{messageText.content}</div>
              </div>
            );
          })
        )}
        {/* 把聊天的標記點設在這 只要有新訊息 就會自動捲動*/}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
