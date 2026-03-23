import { useCallback, useEffect, useRef, useState } from 'react';
import { Circle, MessageSquareText, ChevronDown, Users } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import OnlineUserList from '../Chat/OnlineUserList';
import MessageArea from '../Chat/MessageArea';
import { useChatContext } from '@/src/contexts/ChatContext';

function useChatNotification(isChatOpen: boolean) {
  const [unread, setUnread] = useState(false);

  const isChatOpenRef = useRef(isChatOpen);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const handleNewMessage = useCallback(() => {
    if (!isChatOpenRef.current) {
      setUnread(true);
    }
  }, []);

  const clearUnread = () => setUnread(false);

  return { unread, handleNewMessage, clearUnread };
}

export default function SocialPanel() {
  // 聊天室是否打開
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
  const { unread, clearUnread, handleNewMessage } = useChatNotification(isChatRoomOpen);

  const { messages, onlineUsers, updateStatus } = useChatContext();
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const handleToggleOnlineStatus = () => {
    const newStatus = !isOnlineMode;
    setIsOnlineMode(newStatus);
    updateStatus(undefined, newStatus ? 'Public' : 'Hidden');
  };

  useEffect(() => {
    if (messages.length > 0) {
      handleNewMessage();
    }
  }, [messages.length, handleNewMessage]);

  const [globalFocusMinutes, setGlobalFocusMinutes] = useState(0);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/global-focus-status`);
        const result = await res.json();

        if (result.status === 'success') {
          setGlobalFocusMinutes(Math.floor(result.total_seconds / 60));
        }
      } catch (error) {
        console.error('無法取得全站專注時間', error);
      }
    };
    //
    fetchGlobalStats();
    // 設定每 1 分鐘自動重新抓取一次
    const interval = setInterval(fetchGlobalStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 h-full rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="text-sm xl:text-base font-bold tracking-[0.2em] text-slate-500  ">
            FOCUS SOCIAL
          </div>
          <ActionIconButton
            onClick={handleToggleOnlineStatus}
            className={`flex items-center gap-1 p-1 text-sm lg:text-base lg:gap-2 lg:p-2 rounded-full border transition-colors group ${
              isOnlineMode
                ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
                : 'bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20'
            }`}
          >
            <Circle
              size={10}
              className={
                isOnlineMode ? 'fill-green-500 text-green-500' : 'fill-slate-500 text-slate-500'
              }
            />
            <span
              className={`text-s font-bold ${isOnlineMode ? 'text-green-400' : 'text-slate-400'}`}
            >
              {isOnlineMode ? '上線' : '隱藏'}
            </span>
            <ChevronDown
              size={16}
              className={`${isOnlineMode ? 'text-green-500' : 'text-slate-500'} group-hover:translate-y-0.5 transition-transform`}
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
              clearUnread();
            }
            // 切換狀態
            setIsChatRoomOpen(!isChatRoomOpen);
          }}
        >
          {/* 切換 Icon */}
          {isChatRoomOpen ? <Users size={20} /> : <MessageSquareText size={20} />}

          {/* 有未讀訊息且聊天室關閉時，才顯示紅點 */}
          {unread && !isChatRoomOpen && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ffb347] rounded-full border-2 border-[#0a0e17] shadow-[0_0_8px_rgba(255,179,71,0.6)] animate-pulse"></span>
          )}
        </ActionIconButton>
      </div>
      {/* 當聊天室開啟時 隱藏 */}
      {!isChatRoomOpen && (
        <div className="flex flex-col gap-2">
          <div className="text-6xl leading-none text-white">
            {globalFocusMinutes.toLocaleString()}
          </div>
          <div className="text-slate-500 text-base track">所有使用者專注總分鐘</div>
        </div>
      )}
      {/* 用 hidden 保留背景運作 */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full ${isChatRoomOpen ? 'hidden' : 'block'}`}>
          <OnlineUserList userList={onlineUsers} />
        </div>

        <div className={`h-full ${isChatRoomOpen ? 'block' : 'hidden'}`}>
          <MessageArea shouldFocus={isChatRoomOpen} />
        </div>
      </div>
    </div>
  );
}
