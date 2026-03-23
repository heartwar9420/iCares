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
}

export function useChat(onNewMessage?: () => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const { user, setLoading, profile } = useProfileContext();

  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);

  const formatTWTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei',
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    if (!user?.id || !profile?.display_name) {
      return;
    }
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const displayName = profile?.display_name || '未命名';
    // replace = 字串替換, /^http/ = 正規表達式 , / / = 開始和結束
    // ^ =從字串的最開頭比對, http = 要找的文字 'ws' = 要替換成的文字
    // 這一行 = 把 http://localhost:8000 替換成 ws://localhost:8000
    // 把 http 替換成 ws 是因為這是 webSocket 的專用連線方式
    const webSocketUrl =
      baseApiUrl.replace(/^http/, 'ws') +
      `/api/chat?user_id=${user?.id || 'unknown'}&name=${encodeURIComponent(displayName)}`;

    // 建立一個真正的 WebSocket 連線實例 ， 且這會立即嘗試連線
    const socket = new WebSocket(webSocketUrl);

    // 將連線實例存入 useRef 中 ， 這樣在 useEffect 以外也能呼叫(發送訊息)
    socketRef.current = socket;

    socket.onmessage = (event) => {
      // 解析後端傳來的 JSON 字串 為 JS物件
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === 'online_users') {
        setOnlineUsers(parsedData.users);
      } else if (parsedData.type === 'chat_message' || parsedData.content) {
        // 將 原始資料包裝成 前端定義的介面格式
        const newMessage: ChatMessage = {
          id: parsedData.id,
          user_id: parsedData.user_id,
          sender: parsedData.display_name,
          content: parsedData.content,
          timestamp: formatTWTime(parsedData.created_at),
        };
        // 確保在非同步的環境下拿到最新的舊列表 並加上新訊息
        setMessages((prev) => [...prev, newMessage]);
        // 若有傳入回呼函式 就執行
        onNewMessage?.();
      }
    };
    // 結束後就把連線關掉
    return () => socket.close();
  }, [onNewMessage, user?.id, profile?.display_name]);

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

  const updateStatus = useCallback(
    (autoStatus?: '專注中' | '閒置中' | '離線中', privacyMode?: 'Public' | 'Hidden') => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const payload: {
          type: string;
          autoStatus?: '專注中' | '閒置中' | '離線中';
          privacyMode?: 'Public' | 'Hidden';
        } = {
          type: 'status_update',
        };
        if (autoStatus) payload.autoStatus = autoStatus;
        if (privacyMode) payload.privacyMode = privacyMode;

        socketRef.current.send(JSON.stringify(payload));
      }
    },
    [],
  );

  const fetchChatHistory = useCallback(async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*,profiles(display_name)')
        .order('created_at', { ascending: true }); // 正序 , 舊的在最上面
      if (error) throw error;
      if (data) {
        const formatted = data.map((item) => {
          const senderName = Array.isArray(item.profiles)
            ? item.profiles[0]?.display_name
            : item.profiles?.display_name;

          return {
            id: item.id,
            user_id: item.user_id,
            sender: senderName || '',
            content: item.content,
            timestamp: formatTWTime(item.created_at),
          };
        });
        setMessages(formatted);
      }
    } catch (error) {
      console.log('讀取聊天室紀錄失敗', error);
    } finally {
    }
  }, [user?.id]);
  useEffect(() => {
    if (user?.id) {
      fetchChatHistory();
    }
  }, [fetchChatHistory, user?.id]);

  return { messages, sendMessage, fetchChatHistory, onlineUsers, updateStatus };
}
