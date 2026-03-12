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
    if (messageInputText.trim() === '') return;
    onSendMessage(messageInputText);
    setMessageInputText('');
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (shouldFocus) {
      inputRef.current?.focus();
    }
  }, [shouldFocus]);

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
        className="flex-1 bg-transparent text-base text-slate-200 placeholder:text-slate-400 px-3 py-2 outline-none"
      />
      <ActionIconButton
        onClick={handleSend}
        disabled={!hasText}
        className={`p-2 px-3 rounded-lg transition-all duration-300 ${
          hasText ? 'text-[#ffb347] bg-[#ffb347]/10' : 'text-slate-600 cursor-not-allowed'
        }`}
      >
        <Send size={18} />
      </ActionIconButton>
    </div>
  );
}
