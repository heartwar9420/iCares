import { useCallback, useEffect, useRef, useState } from 'react';
import { useProfileContext } from '../contexts/ProfileContext';
import { supabase } from '../lib/supabase';
import { UserStatus } from '../components/Chat/OnlineUserList';
export interface ChatMessage {
  id: string;
  user_id: string;
  sender: string;
  content: string;
  timestamp: string;
  raw_timestamp: string;
}
// 定義從Supabase傳來的資料格式
interface RawMessageData {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name?: string;
  sender?: string;
  profiles?: { display_name: string }; // Supabase 的巢狀物件
}

export function useChat(onNewMessage?: () => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const { user, profile } = useProfileContext();
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);
  const onlineUsersRef = useRef<UserStatus[]>([]);
  const [reconnectCount, setReconnectCount] = useState(0); // 記錄重連次數

  const currentAutoStatusRef = useRef(profile?.auto_status || '閒置中');
  const currentPrivacyModeRef = useRef(profile?.privacy_mode || 'Public');

  useEffect(() => {
    currentAutoStatusRef.current = profile?.auto_status || '閒置中';
    currentPrivacyModeRef.current = profile?.privacy_mode || 'Public';
  }, [profile?.auto_status, profile?.privacy_mode]);

  const formatTWTime = useCallback((dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }, []);

  const processMessage = useCallback(
    (data: RawMessageData): ChatMessage => {
      const nameFromProfile = data.profiles?.display_name;
      // 優先序為 profiles物件 > display_name欄位 > sender欄位 > 使用者ID縮寫
      const safeSender =
        nameFromProfile || data.display_name || data.sender || `User_${data.user_id?.slice(0, 4)}`;

      return {
        id: data.id,
        user_id: data.user_id,
        sender: safeSender,
        content: data.content,
        timestamp: formatTWTime(data.created_at),
        raw_timestamp: data.created_at,
      };
    },
    [formatTWTime],
  );

  const syncStatusToSupabase = useCallback(
    async (updates: {
      privacy_mode?: 'Public' | 'Hidden';
      auto_status?: '專注中' | '閒置中' | '離線中';
    }) => {
      if (!user?.id) return;
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter((entry) => entry[1] !== undefined),
      );
      if (Object.keys(cleanUpdates).length === 0) return;

      const { error } = await supabase.from('profiles').update(cleanUpdates).eq('id', user.id);
      if (error) console.error('同步狀態至Supabase失敗:', error.message);
    },
    [user?.id],
  );

  const updateStatus = useCallback(
    (autoStatus?: '專注中' | '閒置中' | '離線中', privacyMode?: 'Public' | 'Hidden') => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'status_update',
            user_id: user?.id,
            autoStatus: autoStatus || profile?.auto_status || '閒置中',
            privacyMode: privacyMode || profile?.privacy_mode || 'Public',
          }),
        );
      } else {
        console.warn('WebSocket 尚未連線，狀態稍後將由 onopen 自動補發');
      }

      syncStatusToSupabase({
        auto_status: autoStatus,
        privacy_mode: privacyMode,
      });
    },
    [syncStatusToSupabase, user?.id, profile?.auto_status, profile?.privacy_mode],
  );

  const fetchChatHistory = useCallback(async () => {
    try {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles:user_id(display_name)')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        const formatted = data.map((item) => processMessage(item as RawMessageData));
        setMessages(formatted);
      }
    } catch (error) {
      console.log('讀取紀錄失敗', error);
    }
  }, [user?.id, processMessage]);

  useEffect(() => {
    if (user?.id) {
      fetchChatHistory();
    }
  }, [fetchChatHistory, user?.id]);

  const [isManualOffline, setIsManualOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsManualOffline(localStorage.getItem('focus_chat_status') === 'Offline');
    }
  }, []);

  const disconnectChat = useCallback(() => {
    setIsManualOffline(true);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setOnlineUsers([]);
  }, []);

  const reconnectChat = useCallback(() => {
    setIsManualOffline(false);
  }, []);

  useEffect(() => {
    if (!user?.id || !profile?.display_name || isManualOffline) {
      return;
    }
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const displayName = profile?.display_name || '未命名';

    const currentAutoStatus = currentAutoStatusRef.current;
    const currentPrivacyMode = currentPrivacyModeRef.current;

    // replace = 字串替換, /^http/ = 正規表達式 , / / = 開始和結束
    // ^ =從字串的最開頭比對, http = 要找的文字 'ws' = 要替換成的文字
    // 這一行 = 把 http://localhost:8000 替換成 ws://localhost:8000
    // 把 http 替換成 ws 是因為這是 webSocket 的專用連線方式
    const webSocketUrl =
      baseApiUrl.replace(/^http/, 'ws') +
      `/api/chat?user_id=${user?.id || 'unknown'}&name=${encodeURIComponent(displayName)}&autoStatus=${encodeURIComponent(currentAutoStatus)}&privacyMode=${encodeURIComponent(currentPrivacyMode)}`;

    // 建立一個真正的 WebSocket 連線實例 ， 且這會立即嘗試連線
    const socket = new WebSocket(webSocketUrl);
    let pongTimeout: NodeJS.Timeout;

    // 將連線實例存入 useRef 中 ， 這樣在 useEffect 以外也能呼叫(發送訊息)
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'status_update',
          user_id: user?.id,
          autoStatus: currentAutoStatusRef,
          privacyMode: currentPrivacyModeRef,
        }),
      );
    };

    // 用來確保前端和後端的連線
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));

        pongTimeout = setTimeout(() => {
          console.warn('伺服器無回應，即將重新連線');
          socket.close();
        }, 5000);
      }
    }, 30000); // 30000 毫秒 = 30 秒送一次

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === 'pong') {
        clearTimeout(pongTimeout);
        return;
      }

      if (parsedData.type === 'online_users') {
        // 更新聊天室名單，不產生聊天訊息
        setOnlineUsers(parsedData.users);
        onlineUsersRef.current = parsedData.users;
      } else if (parsedData.type === 'status_update') {
        // 更新單一使用者狀態，不產生聊天訊息
        setOnlineUsers((prev) => {
          const updatedUsers = prev.map((u) =>
            u.id === parsedData.user_id
              ? { ...u, autoStatus: parsedData.autoStatus, privacyMode: parsedData.privacyMode }
              : u,
          );
          onlineUsersRef.current = updatedUsers;
          return updatedUsers;
        });
      } else {
        // 只有在是一般聊天訊息時，才去 processMessage 和 setMessages
        if (!parsedData.display_name && !parsedData.profiles) {
          const foundUser = onlineUsersRef.current.find((u) => u.id === parsedData.user_id);
          if (foundUser) parsedData.display_name = foundUser.name;
        }

        const newMessage = processMessage(parsedData);
        setMessages((prev) => [...prev, newMessage]);
        onNewMessage?.();
      }
    };
    socket.onclose = () => {
      // 如果不是我們手動按離線 而斷開的，就代表是意外斷線
      if (!isManualOffline) {
        console.warn('WebSocket 意外斷線，2秒後嘗試重新連線...');
        setTimeout(() => {
          setReconnectCount((prev) => prev + 1); // 觸發 useEffect 重新執行
        }, 2000);
      }
    };

    // 結束後就把連線關掉
    return () => {
      socket.onclose = null;
      socket.close();
      clearInterval(pingInterval);
      clearTimeout(pongTimeout);
    };
  }, [
    onNewMessage,
    user?.id,
    profile?.display_name,
    processMessage,
    isManualOffline,
    reconnectCount,
  ]);

  const sendMessage = useCallback(
    (content: string) => {
      // 檢查 socket 存在 且 連線 已開啟
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const payload = {
          user_id: user?.id,
          content: content,
        };
        // 將資料包裝成JSON 字串發送到伺服器
        socketRef.current.send(JSON.stringify(payload));
      } else {
        console.warn('聊天室未連線或找不到使用者ID');
      }
    },
    [user],
  );

  return {
    messages,
    sendMessage,
    fetchChatHistory,
    onlineUsers,
    updateStatus,
    disconnectChat,
    reconnectChat,
  };
}
