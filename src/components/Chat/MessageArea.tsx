import { forwardRef } from 'react'; // forwardRef = 讓父層可以操作子層的 div 或 input
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import { useChatContext } from '@/src/contexts/ChatContext';

interface Props {
  shouldFocus?: boolean;
}

//  這個 ref 指向的是 HTMLDivElement ,
const MessageArea = forwardRef<HTMLDivElement, Props>(({ shouldFocus }, ref) => {
  const {
    messages,
    sendMessage,
    lastReadMessageId,
    updateReadStatus,
    fetchChatHistory,
    hasMoreHistory,
    isLoadingOlder,
  } = useChatContext();

  return (
    <div
      ref={ref}
      className="flex flex-col h-full w-full rounded-3xl bg-white/5 border border-white/10 overflow-y-auto"
    >
      {/* 標題列 */}
      <div className="shrink-0 p-4 bg-black/20 flex items-center justify-between">
        <div className="text-sm font-bold tracking-widest text-slate-400">FOCUS CHAT</div>
      </div>

      {/* 歷史訊息 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
        <MessageHistory
          messageHistoryList={messages}
          shouldFocus={shouldFocus}
          lastReadMessageId={lastReadMessageId}
          updateReadStatus={updateReadStatus}
          onLoadOlder={() => fetchChatHistory(true)}
          hasMoreHistory={hasMoreHistory}
          isLoadingOlder={isLoadingOlder}
        />
      </div>

      {/* 輸入框 */}
      <div className="shrink-0 p-4 bg-black/20 ">
        <MessageInput onSendMessage={(content) => sendMessage(content)} shouldFocus={shouldFocus} />
      </div>
    </div>
  );
});

MessageArea.displayName = 'MessageArea';

export default MessageArea;
