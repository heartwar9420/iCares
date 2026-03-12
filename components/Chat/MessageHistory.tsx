import { ChatMessage } from './MessageArea';
import { useEffect, useRef } from 'react';

interface Props {
  messageHistoryList: ChatMessage[];
  currentUserName: string;
}

export default function MessageHistory({ messageHistoryList, currentUserName }: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 如果有新的訊息就自動滑動到底
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistoryList]);

  return (
    <div className="flex flex-col w-full gap-4">
      {messageHistoryList.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-slate-400 mt-10">
          目前沒有訊息，來打個招呼吧！
        </div>
      ) : (
        messageHistoryList.map((messageText) => {
          const isMyMessage = messageText.sender === currentUserName;
          return (
            <div
              key={messageText.id}
              className={`flex flex-col w-full ${isMyMessage ? 'items-end' : 'items-start'}`}
            >
              {/* 名字與時間 */}
              <div
                className={`flex items-baseline gap-2 mb-1 px-1 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span className="text-lg text-slate-400">{messageText.sender}</span>
                <span className="text-sm text-slate-600">{messageText.timestamp}</span>
              </div>

              {/* 對話氣泡本體 */}
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word ${
                  isMyMessage
                    ? 'bg-[#ffb347]/10 border border-[#ffb347]/30 text-[#ffb347] rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                }`}
              >
                {messageText.content}
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
