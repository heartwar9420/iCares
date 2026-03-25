import { useProfileContext } from '@/src/contexts/ProfileContext';
import { ChatMessage } from '@/src/hooks/useChat';
import { useEffect, useRef, Fragment } from 'react';

interface Props {
  messageHistoryList: ChatMessage[];
  shouldFocus?: boolean;
}

export default function MessageHistory({ messageHistoryList, shouldFocus }: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 如果有新的訊息就自動滑動到底
  useEffect(() => {
    if (messagesEndRef.current && shouldFocus) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistoryList, shouldFocus]);

  const { user } = useProfileContext();

  return (
    <div className="flex flex-col w-full gap-4">
      {messageHistoryList.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-slate-400 mt-10">
          目前沒有訊息，來打個招呼吧！
        </div>
      ) : (
        messageHistoryList.map((messageText, index) => {
          const isMyMessage = messageText.user_id === user?.id;
          const currentDate = new Date(messageText.raw_timestamp).toLocaleDateString('zh-TW');
          const prevDate =
            index > 0
              ? new Date(messageHistoryList[index - 1].raw_timestamp).toLocaleDateString('zh-TW')
              : null;
          const isNewDay = currentDate !== prevDate;
          return (
            <Fragment key={messageText.id}>
              {/* 如果是新的一天，顯示日期分隔線 */}
              {isNewDay && (
                <div className="flex items-center gap-4 my-6 opacity-40">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-xs font-medium tracking-widest text-slate-400">
                    {currentDate}
                  </span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
              )}

              <div className={`flex flex-col w-full ${isMyMessage ? 'items-end' : 'items-start'}`}>
                <div
                  className={`flex items-baseline gap-2 mb-1 px-1 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <span className="text-lg text-slate-400">{messageText.sender}</span>
                  <span className="text-sm text-slate-600">{messageText.timestamp}</span>
                </div>

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
            </Fragment>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
