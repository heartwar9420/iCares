import { useState } from 'react';
import ActionIconButton from '../UI/ActionIconButton';
import { Send } from 'lucide-react';

interface Props {
  onSendMessage: (newContent: string) => void;
}

export default function MessageInput({ onSendMessage }: Props) {
  // 存放使用者正在輸入的文字 預設空字串
  const [messageInputText, setMessageInputText] = useState('');
  // 送出的函式
  const handleSend = () => {
    if (messageInputText.trim() === '') {
      return;
    }
    onSendMessage(messageInputText);
    setMessageInputText('');
  };

  return (
    <div className=" w-full flex bg-white hover:bg-white p-2  ">
      <input
        type="text"
        value={messageInputText}
        onChange={(e) => {
          setMessageInputText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="輸入訊息 ... "
        className="w-full"
      />
      <ActionIconButton onClick={handleSend}>
        <Send size={24} />
      </ActionIconButton>
    </div>
  );
}
