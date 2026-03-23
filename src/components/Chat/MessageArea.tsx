import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import { useChatContext } from '@/src/contexts/ChatContext';

interface Props {
  shouldFocus?: boolean;
}

export default function MessageArea({ shouldFocus }: Props) {
  const { messages, sendMessage } = useChatContext();

  return (
    <div className="flex flex-col h-full w-full rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
      {/* 標題列 */}
      <div className="shrink-0 p-4 bg-black/20 flex items-center justify-between">
        <div className="text-sm font-bold tracking-widest text-slate-400">FOCUS CHAT</div>
      </div>

      {/* 歷史訊息 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
        <MessageHistory messageHistoryList={messages} shouldFocus={shouldFocus} />
      </div>

      {/* 輸入框 */}
      <div className="shrink-0 p-4 bg-black/20 ">
        <MessageInput onSendMessage={(content) => sendMessage(content)} shouldFocus={shouldFocus} />
      </div>
    </div>
  );
}
