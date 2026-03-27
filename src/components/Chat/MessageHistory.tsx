import { useProfileContext } from '@/src/contexts/ProfileContext';
import { ChatMessage } from '@/src/hooks/useChat';
import { useEffect, useRef, Fragment, useState, useLayoutEffect } from 'react';

interface Props {
  messageHistoryList: ChatMessage[];
  shouldFocus?: boolean;
  lastReadMessageId?: string | null;
  updateReadStatus?: (messageId: string) => void;
  onLoadOlder?: () => void;
  hasMoreHistory?: boolean;
  isLoadingOlder?: boolean;
}

export default function MessageHistory({
  messageHistoryList,
  shouldFocus,
  lastReadMessageId,
  updateReadStatus,
  onLoadOlder,
  hasMoreHistory,
  isLoadingOlder,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const topObserverRef = useRef<HTMLDivElement | null>(null); // 監聽聊天室頂部
  const hasScrolledRef = useRef(false); // 每次打開只會自動捲動一次

  const prevLatestMsgIdRef = useRef<string | null>(null); // 用來記錄最新一則訊息的 ID
  const { user } = useProfileContext();

  const [dividerMessageId, setDividerMessageId] = useState<string | null>(null);
  const [shouldShowDivider, setShouldShowDivider] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const prevFirstMsgIdRef = useRef<string | null>(null);

  // 關閉聊天室時，重置所有狀態
  if (!shouldFocus && (dividerMessageId !== null || shouldShowDivider)) {
    setDividerMessageId(null);
    setShouldShowDivider(false);
  }

  useEffect(() => {
    if (!shouldFocus) {
      hasScrolledRef.current = false;
      prevLatestMsgIdRef.current = null;
    }
  }, [shouldFocus]);

  // 處理初次載入的紅線邏輯
  if (
    shouldFocus &&
    lastReadMessageId &&
    dividerMessageId === null &&
    messageHistoryList.length > 0
  ) {
    setDividerMessageId(lastReadMessageId);
    const latestMsgId = messageHistoryList[messageHistoryList.length - 1].id;
    setShouldShowDivider(lastReadMessageId !== latestMsgId);
  }

  // 自己發送訊息，隱藏紅線
  if (shouldShowDivider && messageHistoryList.length > 0) {
    const latestMsg = messageHistoryList[messageHistoryList.length - 1];
    if (latestMsg.user_id === user?.id) {
      setShouldShowDivider(false);
    }
  }

  useEffect(() => {
    if (shouldFocus && messageHistoryList.length > 0 && !hasScrolledRef.current) {
      if (dividerMessageId) {
        const el = document.getElementById(`msg-${dividerMessageId}`);

        if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }

      hasScrolledRef.current = true;
      // 記錄目前的最新訊息的 ID
      prevLatestMsgIdRef.current = messageHistoryList[messageHistoryList.length - 1].id;
    }
  }, [shouldFocus, messageHistoryList, dividerMessageId]);

  // 新訊息自動捲動邏輯
  useEffect(() => {
    if (shouldFocus && messageHistoryList.length > 0 && hasScrolledRef.current) {
      const currentLatestMsgId = messageHistoryList[messageHistoryList.length - 1].id;

      // 如果有新訊息進來
      if (prevLatestMsgIdRef.current !== currentLatestMsgId) {
        const latestMsg = messageHistoryList[messageHistoryList.length - 1];
        const isMyMessage = latestMsg.user_id === user?.id;

        // 如果是自已發的訊息 或是如果沒有未讀的線
        if (isMyMessage || !shouldShowDivider) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // 更新記錄
      prevLatestMsgIdRef.current = currentLatestMsgId;
    }
  }, [messageHistoryList, shouldFocus, user?.id, shouldShowDivider]);

  // 更新已讀
  useEffect(() => {
    if (!updateReadStatus || messageHistoryList.length === 0 || !shouldFocus) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const latestMessageId = messageHistoryList[messageHistoryList.length - 1].id;
          updateReadStatus(latestMessageId);
        }
      },
      { threshold: 1.0 },
    );
    if (messagesEndRef.current) observer.observe(messagesEndRef.current);
    return () => observer.disconnect();
  }, [messageHistoryList, updateReadStatus, shouldFocus]);

  // 用頂部的監視器 載入更舊的訊息
  useEffect(() => {
    if (!onLoadOlder || !hasMoreHistory || isLoadingOlder || !shouldFocus) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const scrollContainer = rootRef.current?.parentElement;
          if (scrollContainer) {
            prevScrollHeightRef.current = scrollContainer.scrollHeight;
            prevScrollTopRef.current = scrollContainer.scrollTop;
          }

          onLoadOlder();
        }
      },
      { threshold: 0.1 }, // 只要看到一點點就觸發
    );
    if (topObserverRef.current) observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [onLoadOlder, hasMoreHistory, isLoadingOlder, shouldFocus]);

  useEffect(() => {
    const scrollContainer = rootRef.current?.parentElement;
    if (!scrollContainer) return;

    const handleScroll = () => {
      prevScrollTopRef.current = scrollContainer.scrollTop;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // 如果載入了舊訊息，把捲軸往下推
  useLayoutEffect(() => {
    const scrollContainer = rootRef.current?.parentElement;
    if (!scrollContainer || messageHistoryList.length === 0) return;

    const currentFirstMsgId = messageHistoryList[0].id;

    // 如果最頂部的訊息 ID 變了，代表我們載入了舊訊息
    if (prevFirstMsgIdRef.current && prevFirstMsgIdRef.current !== currentFirstMsgId) {
      const currentScrollHeight = scrollContainer.scrollHeight;
      const heightDiff = currentScrollHeight - prevScrollHeightRef.current;

      // 將捲動軸往下推移 舊訊息的高度 讓畫面保持在原本閱讀的訊息上
      scrollContainer.scrollTo({
        top: prevScrollTopRef.current + heightDiff,
        behavior: 'auto',
      });
    }

    // 更新紀錄
    prevScrollHeightRef.current = scrollContainer.scrollHeight;
    prevFirstMsgIdRef.current = currentFirstMsgId;
  }, [messageHistoryList]);

  return (
    <div ref={rootRef} className="flex flex-col w-full gap-4 relative">
      <div ref={topObserverRef} className="h-4 w-full shrink-0 bg-transparent" />
      {isLoadingOlder && (
        <div className="text-center text-xs text-slate-500 my-2">載入更早的訊息中...</div>
      )}

      {messageHistoryList.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-slate-400 mt-10">
          目前沒有訊息，來打個招呼吧！
        </div>
      ) : (
        messageHistoryList.map((messageText, index) => {
          const isMyMessage = messageText.user_id === user?.id;
          const currentDate = new Date(messageText.raw_timestamp).toLocaleDateString('zh-TW');
          const prevDate =
            index > 0
              ? new Date(messageHistoryList[index - 1].raw_timestamp).toLocaleDateString('zh-TW')
              : null;
          const isNewDay = currentDate !== prevDate;

          // 判斷這則訊息是不是上次讀到的最後一則
          const isLastRead = messageText.id === dividerMessageId;
          const showUnreadDivider =
            shouldShowDivider && isLastRead && index !== messageHistoryList.length - 1;

          return (
            // 加上 id 讓剛進來時可以定位到
            <Fragment key={messageText.id}>
              <div
                id={`msg-${messageText.id}`}
                className={`flex flex-col w-full ${isMyMessage ? 'items-end' : 'items-start'}`}
              ></div>
              {isNewDay && (
                <div className="flex items-center gap-4 my-6 opacity-40">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-xs font-medium tracking-widest text-slate-400">
                    {currentDate}
                  </span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
              )}

              {/* 聊天訊息本體 */}
              <div className={`flex flex-col w-full ${isMyMessage ? 'items-end' : 'items-start'}`}>
                <div
                  className={`flex items-baseline gap-2 mb-1 px-1 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <span className="text-lg text-slate-400">{messageText.sender}</span>
                  <span className="text-sm text-slate-600">{messageText.timestamp}</span>
                </div>

                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word ${
                    isMyMessage
                      ? 'bg-[#ffb347]/10 border border-[#ffb347]/30 text-[#ffb347] rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  {messageText.content}
                </div>
              </div>

              {/* 未讀分隔線 */}
              {showUnreadDivider && (
                <div className="flex items-center gap-4 my-2">
                  <div className="h-px flex-1 bg-red-500/50" />
                  <span className="text-xs font-bold tracking-widest text-red-400">
                    以下為未讀新訊息
                  </span>
                  <div className="h-px flex-1 bg-red-500/50" />
                </div>
              )}
            </Fragment>
          );
        })
      )}
      {/* 用來搭配 IntersectionObserver */}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
