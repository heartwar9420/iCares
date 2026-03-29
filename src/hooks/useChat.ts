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
  const [messages, setMessages] = useState<ChatMessage[]>([]); // 用來儲存訊息
  const socketRef = useRef<WebSocket | null>(null); //
  const { user, profile } = useProfileContext();
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);
  const onlineUsersRef = useRef<UserStatus[]>([]);
  const [reconnectCount, setReconnectCount] = useState(0); // 記錄重連次數
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true); // 有更多歷史紀錄
  const [isLoadingOlder, setIsLoadingOlder] = useState(false); // 加載歷史紀錄中
  const oldestMsgTimestampRef = useRef<string | null>(null);

  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

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
            autoStatus: autoStatus || currentAutoStatusRef.current,
            privacyMode: privacyMode || currentPrivacyModeRef.current,
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
    [syncStatusToSupabase, user?.id],
  );

  const fetchChatHistory = useCallback(
    async (loadOlder = false) => {
      // 如果沒有 user，或者正在載入舊訊息、沒有更多訊息了，就不要執行
      if (!user?.id || (loadOlder && (!hasMoreHistory || isLoadingOlder))) return;

      try {
        if (loadOlder) setIsLoadingOlder(true);

        // 由新到舊抓取 30 筆
        let query = supabase
          .from('messages')
          .select('*, profiles:user_id(display_name)')
          .order('created_at', { ascending: false })
          .limit(30);

        // 如果往上滑載入更多加上時間條件
        if (loadOlder && oldestMsgTimestampRef.current) {
          query = query.lt('created_at', oldestMsgTimestampRef.current);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          // 如果抓回來的不到 30 筆 就不用再抓
          if (data.length < 30) {
            setHasMoreHistory(false);
          }

          // 因為是由新到舊抓，所以要把它反轉回正常的 由舊到新的 對話順序
          const formatted = data.reverse().map((item) => processMessage(item as RawMessageData));

          if (formatted.length > 0) {
            // 記錄下這批資料最舊的時間戳，留給下次分頁用
            oldestMsgTimestampRef.current = formatted[0].raw_timestamp;
          }

          // 如果是載入舊訊息，把舊資料塞在陣列前面；如果是初次載入，直接覆蓋
          setMessages((prev) => (loadOlder ? [...formatted, ...prev] : formatted));
        }
      } catch (error) {
        console.error('讀取紀錄失敗', error);
      } finally {
        if (loadOlder) setIsLoadingOlder(false);
      }
    },
    [user?.id, processMessage, hasMoreHistory, isLoadingOlder],
  );

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
    let wsProtocol = 'ws://';
    if (baseApiUrl.startsWith('https://')) {
      wsProtocol = 'wss://';
    }
    const baseUrlWithoutProtocol = baseApiUrl.replace(/^https?:\/\//, '');

    const webSocketUrl = `${wsProtocol}${baseUrlWithoutProtocol}/api/chat?user_id=${user?.id || 'unknown'}&name=${encodeURIComponent(displayName)}&autoStatus=${encodeURIComponent(currentAutoStatus)}&privacyMode=${encodeURIComponent(currentPrivacyMode)}`;
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
          autoStatus: currentAutoStatusRef.current,
          privacyMode: currentPrivacyModeRef.current,
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
        }, 15000);
      }
    }, 30000); // 30000 毫秒 = 30 秒送一次

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === 'pong') {
        clearTimeout(pongTimeout);
        return;
      }

      if (parsedData.type === 'online_users') {
        setOnlineUsers(parsedData.users);
        onlineUsersRef.current = parsedData.users;
      } else if (parsedData.type === 'status_update') {
        setOnlineUsers((prev) => {
          const updatedUsers = prev.map((u) =>
            u.id === parsedData.user_id
              ? { ...u, autoStatus: parsedData.autoStatus, privacyMode: parsedData.privacyMode }
              : u,
          );
          onlineUsersRef.current = updatedUsers;
          return updatedUsers;
        });
      } else if (parsedData.type === 'chat_message') {
        if (!parsedData.display_name && !parsedData.profiles) {
          const foundUser = onlineUsersRef.current.find((u) => u.id === parsedData.user_id);
          if (foundUser) parsedData.display_name = foundUser.name;
        }

        const newMessage = processMessage(parsedData);
        setMessages((prev) => [...prev, newMessage]);
        onNewMessageRef.current?.();
      }
    };

    socket.onclose = (event) => {
      if (!isManualOffline) {
        console.warn(`WebSocket 斷線 (Code: ${event.code})，2秒後重試...`);
        const timer = setTimeout(() => {
          setReconnectCount((prev) => prev + 1);
        }, 2000);

        return () => clearTimeout(timer);
      }
    };
    socket.onerror = (error) => {
      console.error('WebSocket 發生錯誤:', error);
    };

    return () => {
      socket.onclose = null;
      socket.close();
      clearInterval(pingInterval);
      clearTimeout(pongTimeout);
    };
  }, [user?.id, profile?.display_name, processMessage, isManualOffline, reconnectCount]);

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

  // 用來從後端取得已讀資料
  const fetchReadStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/read-status/${user.id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setLastReadMessageId(data.last_read_message_id);
      }
    } catch (error) {
      console.error('取得已讀紀錄失敗', error);
    }
  }, [user?.id]);
  // 更新已讀資料
  const updateReadStatus = useCallback(
    async (messageId: string) => {
      if (!user?.id || lastReadMessageId === messageId) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/read-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, message_id: messageId }),
        });
        const data = await res.json();
        if (data.status === 'success') {
          setLastReadMessageId(messageId);
        }
      } catch (error) {
        console.error('更新已讀資料失敗', error);
      }
    },
    [user?.id, lastReadMessageId],
  );
  useEffect(() => {
    if (user?.id) {
      fetchChatHistory();
      fetchReadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchReadStatus]);

  return {
    messages,
    sendMessage,
    fetchChatHistory,
    onlineUsers,
    updateStatus,
    disconnectChat,
    reconnectChat,
    hasMoreHistory,
    isLoadingOlder,
    lastReadMessageId,
    updateReadStatus,
  };
}
