import { useState } from 'react';
import { Circle, MessageSquareText, ChevronDown, Users } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import OnlineUserList from '../Chat/OnlineUserList';
import MessageArea from '../Chat/MessageArea';

export default function SocialPanel() {
  // 聊天室是否打開
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
  // 是否有未讀訊息
  const [Unread, setUnread] = useState(false);

  // 接收到新訊息時的處理邏輯
  const handleNewMessage = () => {
    // 只有在聊天室關閉的狀態下收到訊息，才會顯示未讀紅點
    if (!isChatRoomOpen) {
      setUnread(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="text-s font-bold tracking-[0.2em] text-slate-500 ">FOCUS SOCIAL</div>
          <ActionIconButton className="flex items-center gap-2 p-1.5 rounded-full bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors group">
            <Circle size={10} className="fill-green-500 text-green-500" />
            <span className="text-s text-green-400 font-bold">上線</span>
            <ChevronDown
              size={16}
              className="text-green-500 group-hover:translate-y-0.5 transition-transform"
            />
          </ActionIconButton>
        </div>

        {/* 點擊切換 聊天室 / 使用者列表 */}
        <ActionIconButton
          className={`relative p-2 transition-colors ${
            isChatRoomOpen ? 'text-[#ffb347]' : 'text-slate-400 hover:text-[#ffb347]'
          }`}
          onClick={() => {
            // 打開聊天室後把紅點消除
            if (!isChatRoomOpen) {
              setUnread(false);
            }
            // 切換狀態
            setIsChatRoomOpen(!isChatRoomOpen);
          }}
        >
          {/* 切換 Icon */}
          {isChatRoomOpen ? <Users size={20} /> : <MessageSquareText size={20} />}

          {/* 有未讀訊息且聊天室關閉時，才顯示紅點 */}
          {Unread && !isChatRoomOpen && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ffb347] rounded-full border-2 border-[#0a0e17] shadow-[0_0_8px_rgba(255,179,71,0.6)] animate-pulse"></span>
          )}
        </ActionIconButton>
      </div>
      {/* 當聊天室開啟時 隱藏 */}
      {!isChatRoomOpen && (
        <div className="flex flex-col gap-2">
          <div className="text-6xl leading-none text-white">12,450</div>
          <div className="text-slate-500 text-sm track">所有使用者專注總時間</div>
        </div>
      )}
      {/* 用 hidden 保留背景運作 */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full ${isChatRoomOpen ? 'hidden' : 'block'}`}>
          <OnlineUserList />
        </div>

        <div className={`h-full ${isChatRoomOpen ? 'block' : 'hidden'}`}>
          <MessageArea onNewMessage={handleNewMessage} shouldFocus={isChatRoomOpen} />
        </div>
      </div>
    </div>
  );
}
