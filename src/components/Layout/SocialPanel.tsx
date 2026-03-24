import { useCallback, useEffect, useRef, useState } from 'react';
import { Circle, MessageSquareText, ChevronDown, Users, EyeOff, PowerOff } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import OnlineUserList from '../Chat/OnlineUserList';
import MessageArea from '../Chat/MessageArea';
import { useChatContext } from '@/src/contexts/ChatContext';
import { useProfileContext } from '@/src/contexts/ProfileContext';

// (保持不變) 專門處理未讀紅點的 Hook
function useChatNotification(isChatOpen: boolean) {
  const { messages } = useChatContext();
  const [unread, setUnread] = useState(false);
  const isChatOpenRef = useRef(isChatOpen);
  const prevMsgCount = useRef(messages?.length || 0);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const handleNewMessage = useCallback(() => {
    if (!isChatOpenRef.current) {
      setUnread(true);
    }
  }, []);

  useEffect(() => {
    if (!messages) return;
    if (prevMsgCount.current !== 0 && messages.length > prevMsgCount.current) {
      handleNewMessage();
    }
    prevMsgCount.current = messages.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const clearUnread = () => setUnread(false);
  return { unread, clearUnread };
}

export default function SocialPanel() {
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
  const { unread, clearUnread } = useChatNotification(isChatRoomOpen);

  // 加上我們剛剛新增的 disconnectChat 和 reconnectChat (如果報錯說找不到，請確認 ChatContext 有把這兩個 function export 出來)
  const { onlineUsers, updateStatus, disconnectChat, reconnectChat } = useChatContext();
  const { profile } = useProfileContext();

  // 1. 給定一個固定的初始值，確保 Hydration 不會報錯
  const [currentStatus, setCurrentStatus] = useState<'Public' | 'Hidden' | 'Offline'>('Public');
  // 控制彈窗開關
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 用來偵測點擊外部的 ref
  const menuRef = useRef<HTMLDivElement>(null);
  // 2. 在畫面首次渲染完成後，再去讀取本地存檔或資料庫
  useEffect(() => {
    setTimeout(() => {
      const savedStatus = localStorage.getItem('focus_chat_status');

      if (savedStatus) {
        // 如果有存檔，就使用存檔的狀態
        setCurrentStatus(savedStatus as 'Public' | 'Hidden' | 'Offline');
      } else if (profile) {
        // 如果沒有存檔，才使用 profile 的設定
        setCurrentStatus(profile.privacy_mode === 'Public' ? 'Public' : 'Hidden');
      }
    }, 0);
  }, [profile]);

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

    // 關鍵：記住使用者的選擇，這樣換頁回來就不會被舊的 profile 蓋掉！
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

  // (保持不變) 取得全站專注時間
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
          className={`relative p-2 transition-colors ${
            isChatRoomOpen ? 'text-[#ffb347]' : 'text-slate-400 hover:text-[#ffb347]'
          }`}
          onClick={() => {
            if (!isChatRoomOpen) {
              clearUnread();
            }
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
            <MessageArea shouldFocus={isChatRoomOpen} />
          )}
        </div>
      </div>
    </div>
  );
}
