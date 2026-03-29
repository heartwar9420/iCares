import { useState, useRef, useEffect } from 'react';
import ActionIconButton from '../UI/ActionIconButton';
import { Send } from 'lucide-react';

interface Props {
  onSendMessage: (newContent: string) => void;
  shouldFocus?: boolean;
}

export default function MessageInput({ onSendMessage, shouldFocus }: Props) {
  const [messageInputText, setMessageInputText] = useState('');

  const handleSend = () => {
    // 如果把開頭和結尾的空白都去除掉之後還是 '' 就不傳送(禁止使用者傳送空白的意思)
    if (messageInputText.trim() === '') return;
    // 把input裡面的東西用 onSendMessage 傳送出去
    onSendMessage(messageInputText);
    // 把 input 清空
    setMessageInputText('');
  };

  // 當使用者按下聊天室的按鈕後 就可以直接開始打字
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (shouldFocus) {
      inputRef.current?.focus();
    }
  }, [shouldFocus]);

  // 如果把頭尾的空白去除掉之後 > 0 才讓使用者可以按下 btn
  const hasText = messageInputText.trim().length > 0;

  return (
    <div className="flex w-full items-center bg-black/40 border border-white/10 rounded-xl p-1 pr-2 transition-colors focus-within:border-[#ffb347]/50 focus-within:bg-black/60">
      <input
        ref={inputRef}
        type="text"
        value={messageInputText}
        onChange={(e) => setMessageInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="輸入訊息..."
        className="flex-1 min-w-0 bg-transparent text-base text-slate-200 placeholder:text-slate-400 px-3 py-2 outline-none"
      />
      <ActionIconButton
        onClick={handleSend}
        disabled={!hasText}
        className={`shrink-0 p-2 px-3 rounded-lg transition-all duration-300 ${
          hasText ? 'text-[#ffb347] bg-[#ffb347]/10' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <Send size={18} />
      </ActionIconButton>
    </div>
  );
}
