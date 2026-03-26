import { useEffect, useRef, useState } from 'react';
import { Circle, MessageSquareText, ChevronDown, Users, EyeOff, PowerOff } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import OnlineUserList from '../Chat/OnlineUserList';
import MessageArea from '../Chat/MessageArea';
import { useChatContext } from '@/src/contexts/ChatContext';
import { useProfileContext } from '@/src/contexts/ProfileContext';

function useChatNotification(isChatOpen: boolean) {
  const { messages, lastReadMessageId } = useChatContext();
  const { user } = useProfileContext();

  // 如果聊天室開著或是沒訊息 未讀就一定是 false
  if (isChatOpen || !messages || messages.length === 0 || !lastReadMessageId) {
    return { unread: false };
  }

  const latestMsg = messages[messages.length - 1];

  // 最新訊息的 ID 不等於最後讀取到的訊息 ID 且這則訊息不是我發的
  const hasUnread = latestMsg.id !== lastReadMessageId && latestMsg.user_id !== user?.id;

  return { unread: hasUnread };
}

export default function SocialPanel() {
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
  const { unread } = useChatNotification(isChatRoomOpen);

  const { onlineUsers, updateStatus, disconnectChat, reconnectChat } = useChatContext();
  const { profile } = useProfileContext();

  const [currentStatus, setCurrentStatus] = useState<'Public' | 'Hidden' | 'Offline'>('Public');
  // 控制彈窗開關
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 用來偵測點擊外部的 ref
  const menuRef = useRef<HTMLDivElement>(null);
  // 在畫面渲染完成後，再去讀取本地存檔或資料庫
  useEffect(() => {
    setTimeout(() => {
      const savedStatus = localStorage.getItem('focus_chat_status');
      let targetStatus = 'Public';

      if (savedStatus) {
        // 如果有存檔，就使用存檔的狀態
        targetStatus = savedStatus;
      } else if (profile) {
        // 如果沒有存檔，才使用 profile 的設定
        targetStatus = profile.privacy_mode === 'Public' ? 'Public' : 'Hidden';
      }
      setCurrentStatus(targetStatus as 'Public' | 'Hidden' | 'Offline');

      if (targetStatus !== 'Offline') {
        updateStatus('閒置中', targetStatus as 'Public' | 'Hidden');
      }
    }, 0);
  }, [profile, updateStatus]);

  const HistoryRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉聊天室的邏輯
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // 如果聊天室沒開，就不用管它
      if (!isChatRoomOpen) return;

      const toggleBtn = document.getElementById('chat-toggle-btn');

      // 確保有抓到聊天室 且點擊的位置不在聊天室內
      const isOutsideChat = HistoryRef.current && !HistoryRef.current.contains(target);

      // 確保點擊的位置不在切換按鈕上
      const isOutsideBtn = !toggleBtn || !toggleBtn.contains(target);

      // 如果都滿足的話 就關閉聊天室
      if (isOutsideChat && isOutsideBtn) {
        setIsChatRoomOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatRoomOpen]);

  // 點擊外部關閉彈窗的邏輯
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (status: 'Public' | 'Hidden' | 'Offline') => {
    setCurrentStatus(status);
    setIsMenuOpen(false);

    // 記住使用者的選擇
    localStorage.setItem('focus_chat_status', status);

    if (status === 'Offline') {
      disconnectChat();
      updateStatus(undefined, 'Hidden');
    } else {
      if (currentStatus === 'Offline') {
        reconnectChat();
      }
      updateStatus(undefined, status);
    }
  };

  const [globalFocusMinutes, setGlobalFocusMinutes] = useState(0);

  // 取得全站專注時間
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
    fetchGlobalStats();
    const interval = setInterval(fetchGlobalStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // 根據當前狀態設定按鈕樣式
  const getStatusConfig = () => {
    switch (currentStatus) {
      case 'Public':
        return {
          label: '上線',
          colorClass: 'text-green-400',
          bgClass: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20',
          iconColor: 'fill-green-500 text-green-500',
        };
      case 'Hidden':
        return {
          label: '隱藏',
          colorClass: 'text-slate-400',
          bgClass: 'bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20',
          iconColor: 'fill-slate-500 text-slate-500',
        };
      case 'Offline':
        return {
          label: '離線',
          colorClass: 'text-red-400',
          bgClass: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
          iconColor: 'fill-red-500 text-red-500',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="flex flex-col gap-6 p-6 h-full rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="text-sm xl:text-base font-bold tracking-[0.2em] text-slate-500">
            FOCUS SOCIAL
          </div>

          {/* 狀態按鈕與彈窗容器 */}
          <div className="relative" ref={menuRef}>
            <ActionIconButton
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-1 p-1 text-sm lg:text-base lg:gap-2 lg:p-2 rounded-full border transition-colors group ${statusConfig.bgClass}`}
            >
              <Circle size={10} className={statusConfig.iconColor} />
              <span className={`text-sm font-bold ${statusConfig.colorClass}`}>
                {statusConfig.label}
              </span>
              <ChevronDown
                size={16}
                className={`${statusConfig.colorClass.replace('text-', 'text-')} group-hover:translate-y-0.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
              />
            </ActionIconButton>

            {/* 下拉選單 */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <ActionIconButton
                  onClick={() => handleStatusChange('Public')}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Circle size={12} className="fill-green-500 text-green-500" />
                  上線
                </ActionIconButton>
                <ActionIconButton
                  onClick={() => handleStatusChange('Hidden')}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <EyeOff size={14} className="text-slate-400" />
                  隱藏
                </ActionIconButton>
                <ActionIconButton
                  onClick={() => handleStatusChange('Offline')}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                >
                  <PowerOff size={14} className="text-red-400" />
                  離線
                </ActionIconButton>
              </div>
            )}
          </div>
        </div>

        {/* 點擊切換 聊天室 / 使用者列表 */}
        <ActionIconButton
          id="chat-toggle-btn"
          className={`relative p-2 transition-colors ${
            isChatRoomOpen ? 'text-[#ffb347]' : 'text-slate-400 hover:text-[#ffb347]'
          }`}
          onClick={() => {
            setIsChatRoomOpen(!isChatRoomOpen);
          }}
        >
          {isChatRoomOpen ? <Users size={20} /> : <MessageSquareText size={20} />}
          {unread && !isChatRoomOpen && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ffb347] rounded-full border-2 border-[#0a0e17] shadow-[0_0_8px_rgba(255,179,71,0.6)] animate-pulse"></span>
          )}
        </ActionIconButton>
      </div>

      {!isChatRoomOpen && (
        <div className="flex flex-col gap-2">
          <div className="text-6xl leading-none text-white">
            {globalFocusMinutes.toLocaleString()}
          </div>
          <div className="text-slate-500 text-base track">所有使用者專注總分鐘</div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full ${isChatRoomOpen ? 'hidden' : 'block'}`}>
          {currentStatus === 'Offline' ? (
            <div className="flex flex-col text-xl items-center justify-center h-full text-slate-500 ">
              <span>已離線</span>
              <span>無法查看線上名單</span>
            </div>
          ) : (
            <OnlineUserList userList={onlineUsers} />
          )}
        </div>

        <div className={`h-full ${isChatRoomOpen ? 'block' : 'hidden'}`}>
          {currentStatus === 'Offline' ? (
            <div className="flex flex-col text-xl items-center justify-center h-full text-slate-500 border border-white/10 bg-white/5 rounded-3xl">
              <span>請關閉離線狀態</span>
              <span>以使用聊天室</span>
            </div>
          ) : (
            <MessageArea shouldFocus={isChatRoomOpen} ref={HistoryRef} />
          )}
        </div>
      </div>
    </div>
  );
}
