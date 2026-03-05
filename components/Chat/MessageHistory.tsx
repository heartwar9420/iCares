import { ChatMessage } from './MessageArea';

interface Props {
  messageHistory: ChatMessage[];
}

export default function MessageHistory({ messageHistory }: Props) {
  return (
    <div className="flex flex-col w-full">
      <div>
        {messageHistory.length === 0 ? (
          <div className="p-2">目前沒有訊息，來說點什麼吧</div>
        ) : (
          messageHistory.map((message) => (
            <div key={message.id} className="hover:bg-slate-400 rounded-xl p-2">
              <div className="w-fit rounded-2xl flex ">
                <div className="text-xl mr-3 text-black">{message.sender}</div>
                <div className="text-[14px] text-gray-500 mt-1">{message.timestamp}</div>
              </div>

              <div className="text-xl text-gray-600">{message.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
