import { useEffect, useState, useCallback, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { useProfileContext } from '../contexts/ProfileContext';

interface TimerConfig {
  workTimeMinutes: number;
  shortRestTimeSeconds: number;
  longRestTimeMinutes: number;
  roundsToLongRest: number;
}

interface UseTimerProps {
  onWorkEnd?: (startTime: Date, endTime: Date, durationSeconds: number) => void;
}

// 映射類型 Record < Key 的型別 , Value 的型別 >
const DEFAULT_CONFIGS: Record<string, TimerConfig> = {
  iCares: {
    workTimeMinutes: 20,
    shortRestTimeSeconds: 20,
    longRestTimeMinutes: 20,
    roundsToLongRest: 5,
  },
  TomatoClock: {
    workTimeMinutes: 20,
    shortRestTimeSeconds: 300,
    longRestTimeMinutes: 30,
    roundsToLongRest: 4,
  },
  Immersion: {
    workTimeMinutes: 0.1,
    shortRestTimeSeconds: 3,
    longRestTimeMinutes: 1,
    roundsToLongRest: 5,
  },
};

// 在 typeof window !== 'undefined' 的檢查下建立，避免報錯
const replaySound = typeof window !== 'undefined' ? new Audio('/RandomBeep.mp3') : null;
const startSound = typeof window !== 'undefined' ? new Audio('/start.mp3') : null;
const finishSound = typeof window !== 'undefined' ? new Audio('/finish.mp3') : null;
const longRestSound = typeof window !== 'undefined' ? new Audio('/longRest.mp3') : null;

// 用來複製音效、設定音量、播放
const playAudio = (audioNode: HTMLAudioElement | null, targetVolume: number = 1.0) => {
  if (audioNode) {
    const clonedSound = audioNode.cloneNode(true) as HTMLAudioElement;
    clonedSound.volume = targetVolume;
    clonedSound.play();
  }
};
export type TimerComboType = 'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo'; // 定義 Combo 的型別

export default function useTimer({ onWorkEnd }: UseTimerProps = {}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0); // 剩餘時間有多少？ 預設 0
  const [isTimerRunning, setIsTimerRunning] = useState(false); // 計時器是否在倒數中 預設是否
  const [mode, setMode] = useState<'work' | 'rest' | 'long_rest'>('work'); // 設定狀態，只能接受'work'和'rest'和'long_rest'，預設是('work')
  const [isTimerConfigOpen, setIsTimerConfigOpen] = useState(false); // 設定計時設定頁面是否開啟
  // timerCombo 用來記錄現在使用者選擇的 方案為何
  const [timerCombo, setTimerCombo] = useState<
    'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo'
  >('iCares');
  const nextReplayTargetSeconds = useRef<null | number>(null); // Replay 的計時邏輯 用useRef 來記住數字
  const [isReplay, setIsReplay] = useState(true); // isReplay 設定是否要神經重放
  const isProcessingEnd = useRef(false); // 處理結束了嗎？
  const sessionStartTimeRef = useRef<Date | null>(null); // 用來記住專注起始時間
  const [completedRounds, setCompletedRounds] = useState(0); //用來記住完成幾次專注

  const targetEndTimeRef = useRef<number | null>(null); // 用來記住預計結束的真實時間戳 (毫秒)

  const [isReplayingNow, setIsReplayingNow] = useState(false);
  const replayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { updateStatus } = useChatContext();
  const { user, profile } = useProfileContext();

  // 發送目前計時器狀態給資料庫
  const syncTimerAction = useCallback(
    async (
      action: 'start' | 'pause' | 'reset' | 'complete',
      currentRemaining: number,
      currentMode: string,
    ) => {
      if (!user?.id) return;
      try {
        const payload = {
          user_id: user.id,
          action: action,
          mode: currentMode,
          remaining_seconds: currentRemaining,
        };

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timer/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('同步計時器狀態失敗:', error);
      }
    },
    [user?.id],
  );

  // 當開啟網頁時 讀取舊的資料
  const fetchServerTimerState = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timer/state/${user.id}`);
      const { status, data } = await res.json();

      if (status === 'success' && data) {
        setMode(data.mode || 'work');

        // 如果正在倒數中
        if (data.is_running && data.target_end_time) {
          // 把後端時間轉成前端時間
          const targetEndMs = new Date(data.target_end_time).getTime();
          const nowMs = Date.now();
          const timeLeft = Math.round((targetEndMs - nowMs) / 1000);

          if (timeLeft > 0) {
            // 還沒倒數完就繼續跑
            targetEndTimeRef.current = targetEndMs;
            setRemainingSeconds(timeLeft);
            setIsTimerRunning(true);
            if (data.mode === 'work') {
              updateStatus('專注中');
            } else {
              updateStatus('閒置中');
            }
          } else {
            // 如果已經倒數完了就暫停
            setRemainingSeconds(0);
            setIsTimerRunning(false);
          }
        } else {
          // 如果不是正在倒數中
          const safeSeconds = Number(data.remaining_seconds) || 0; //為了不要顯示出 nan 強制把拿到的資料轉成Number
          setRemainingSeconds(safeSeconds);
          setIsTimerRunning(false);
          targetEndTimeRef.current = null;
        }
      }
    } catch (error) {
      console.error('取得伺服器計時狀態失敗:', error);
    }
  }, [user?.id]);

  // 網頁初次載入 且 有登入時 讀取儲存的計時紀錄
  useEffect(() => {
    if (user?.id) {
      fetchServerTimerState();
    }
  }, [fetchServerTimerState, user?.id]);

  // 設定計時時間的預設時間
  const [timerDurationConfigs, setTimerDurationConfigs] = useState({
    workTimeMinutes: 20,
    shortRestTimeSeconds: 20,
    longRestTimeMinutes: 20,
    roundsToLongRest: 5,
  });

  const applyComboSettings = useCallback((key: TimerComboType) => {
    setTimerCombo(key);
    setIsTimerRunning(false);
    setRemainingSeconds(0);
    setMode('work');
    setCompletedRounds(0); // 切換模式時把專注次數歸零

    if (key === 'CustomCombo') {
      const savedConfig = localStorage.getItem('icares_custom_config');
      const savedReplay = localStorage.getItem('icares_custom_replay');
      if (savedConfig) {
        setTimerDurationConfigs(JSON.parse(savedConfig));
      }
      setIsReplay(savedReplay ? JSON.parse(savedReplay) : false);
    } else if (DEFAULT_CONFIGS[key]) {
      setTimerDurationConfigs(DEFAULT_CONFIGS[key]);
      setIsReplay(key === 'iCares');
    }
  }, []);

  // 取得隨機 180~300秒
  const getRandomReplaySeconds = () => {
    const rawReplaySeconds = Math.random() * 120 + 180;
    // const rawReplaySeconds = 15;
    const roundedReplaySeconds = Math.floor(rawReplaySeconds);
    // console.log(roundedReplaySeconds);
    return roundedReplaySeconds;
  };

  // 隨機提示
  useEffect(() => {
    if (!isReplay || mode !== 'work') {
      return;
    }
    if (remainingSeconds > 0) {
      if (remainingSeconds === nextReplayTargetSeconds.current) {
        if (replaySound) {
          const newReplaySound = replaySound.cloneNode(true) as HTMLAudioElement;
          newReplaySound.play();
        }
        // 開啟神經重放的提醒，並設定 10 秒後自動關閉
        setIsReplayingNow(true);
        if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = setTimeout(() => {
          setIsReplayingNow(false);
        }, 10000); // 10000 毫秒 = 10 秒

        nextReplayTargetSeconds.current = remainingSeconds - getRandomReplaySeconds();
      }
    }
  }, [remainingSeconds, isReplay, mode]);

  const startNewTimer = useCallback(
    async (targetMode = mode, targetConfigs = timerDurationConfigs) => {
      const apiParams = new URLSearchParams({
        mode: targetMode,
        work_time_minutes: String(targetConfigs.workTimeMinutes),
        short_rest_time_seconds: String(targetConfigs.shortRestTimeSeconds),
        long_rest_time_minutes: String(targetConfigs.longRestTimeMinutes),
        rounds_to_long_rest: String(targetConfigs.roundsToLongRest),
      });

      // const URLString = new URLSearchParams(apiParams).toString();
      // const URL = `${process.env.NEXT_PUBLIC_API_URL}/api/timer?${URLString}`;
      const URL = `${process.env.NEXT_PUBLIC_API_URL}/api/timer?${apiParams.toString()}`;
      // const URL = `${process.env.NEXT_PUBLIC_API_URL}/api/timer?mode=${targetMode}`;
      // const URL = `http://127.0.0.1:8000/api/timer?mode=${targetMode}`;
      // 因為要上線，後端的網址就不會是固定的
      // 而 NEXT_PUBLIC 是固定寫法 , _API_URL 是自已取名的

      try {
        // fetchAPI
        const response = await fetch(URL);
        // 轉成json格式
        const { data } = await response.json();

        setRemainingSeconds(data.duration_seconds);
        setMode(data.mode);
        setCompletedRounds(data.completed_work_count || 0); //把後端傳來的次數接起來, 如果沒回傳就預設0

        targetEndTimeRef.current = Date.now() + data.duration_seconds * 1000; // 算出預計結束的時間

        setIsTimerRunning(true);
        // useRef的值會存在 .current 中
        nextReplayTargetSeconds.current = data.duration_seconds - getRandomReplaySeconds();

        // 如果從後端傳來 下一個要開始的mode 是 'work' 的話 就把時間記下來
        if (data.mode === 'work') {
          sessionStartTimeRef.current = new Date();
        }

        syncTimerAction('start', data.duration_seconds, data.mode); //告訴伺服器 開始 , 剩餘時間 , 模式
        return data.mode;
      } catch (error) {
        console.log('Failed to fetch timer:', error);
        setIsTimerRunning(false);
      }
    },
    // 當 底下的參數發生 改變時才需要重新產生此函式
    [mode, timerDurationConfigs, syncTimerAction],
  );
  useEffect(() => {
    if (isTimerRunning && remainingSeconds === 0) {
      // 如果已經在處理結束邏輯，就不要再進來了（防止響兩聲）
      if (isProcessingEnd.current) return;

      // 鎖上鎖頭，代表 我正在處理"結束"，其他重複的觸發請擋在門外
      isProcessingEnd.current = true;
      // 如果剛剛結束的模式是 專注， 就要點亮格子
      if (mode === 'work') {
        // 現在時間存入 endTime
        const endTime = new Date();
        // 把開始時間 (sessionStartTimeRef) 存入 startTime , 由於可能為null 所以使用new Date 當作保險
        const startTime = sessionStartTimeRef.current || new Date();
        // 計算時間差
        const finalDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        if (onWorkEnd) {
          onWorkEnd(startTime, endTime, finalDuration);
        }
      }
      const nextMode = mode === 'work' ? 'rest' : 'work';
      setTimeout(async () => {
        try {
          const actualNextMode = await startNewTimer(nextMode);
          // 判斷剛結束的是什麼，以及接下來是什麼
          // 專注結束了！
          if (mode === 'work') {
            // 下一個是長休息，播長休息音效
            if (actualNextMode === 'long_rest') {
              playAudio(longRestSound, 1.0);
            } else {
              playAudio(finishSound, 1.0); // 下一個是短休息，播一般結束音效
            }
            updateStatus('閒置中');
          } else {
            // 休息結束了，準備開始工作
            playAudio(startSound, 1.0);
            updateStatus('專注中');
          }
        } catch (error) {
          console.log('切換階段失敗,可能是連線中斷', error);
        } finally {
          isProcessingEnd.current = false;
        }
      }, 400);
      return;
    }
    if (!isTimerRunning || remainingSeconds <= 0) {
      return;
    }
    const intervalId = setInterval(() => {
      if (targetEndTimeRef.current) {
        // 用真實時間計算還剩下幾秒
        const timeLeft = Math.round((targetEndTimeRef.current - Date.now()) / 1000);

        if (timeLeft <= 0) {
          setRemainingSeconds(0);
        } else {
          setRemainingSeconds(timeLeft);
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [
    isTimerRunning,
    remainingSeconds,
    mode,
    startNewTimer,
    onWorkEnd,
    updateStatus,
    profile?.privacy_mode,
  ]);

  // 網頁初次載入時，讀取 localStorage 的紀錄
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initTimer = setTimeout(() => {
      const lastMode = localStorage.getItem('icares_last_mode') as TimerComboType;
      if (lastMode) {
        applyComboSettings(lastMode);
      }
    }, 0);
    return () => clearTimeout(initTimer);
  }, [applyComboSettings]);

  // toggleTimer 暫停 / 開始切換器
  const toggleTimer = async () => {
    // 如果不是正在倒數中 (也就是暫停中)
    if (!isTimerRunning) {
      // 如果時間剩餘時間 = 0 (未開始的第一次)
      if (remainingSeconds === 0) {
        const totalSeconds = timerDurationConfigs.workTimeMinutes * 60;
        setRemainingSeconds(totalSeconds);
        setIsTimerRunning(true);
        await startNewTimer(); // 開啟一個新的計時器
        setIsTimerConfigOpen(false); // 關閉設定panel
        playAudio(startSound); // 播放開始音效
        updateStatus('專注中');
        syncTimerAction('start', totalSeconds, 'work'); // 傳送當前模式, 開始 及預計時間給後端
      } else {
        // 如果時間剩餘時間 != 0 (已經不是開始第一次了) 繼續倒數
        targetEndTimeRef.current = Date.now() + remainingSeconds * 1000; // 如果是繼續倒數 重新計算結束時間
        syncTimerAction('start', remainingSeconds, mode);
        setIsTimerRunning(true); // 開始倒數
        setIsTimerConfigOpen(false); // 關閉設定panel
        playAudio(startSound); // 播放開始音效
        updateStatus('專注中');
      }
    } else {
      // 如果正在倒數中
      setIsTimerRunning(false); // 暫停倒數
      targetEndTimeRef.current = null; // 清除預計結束時間
      syncTimerAction('pause', remainingSeconds, mode);
      setIsTimerConfigOpen(false); // 關閉設定panel
      playAudio(finishSound); // 播放暫停音效
      updateStatus('閒置中');
    }
  };

  // resetTimer 長按重置 計時器
  const resetTimer = async () => {
    setIsTimerRunning(false);
    setRemainingSeconds(0);
    setMode('work');
    setCompletedRounds(0);
    updateStatus('閒置中');
    syncTimerAction('reset', 0, 'work');
  };

  return {
    remainingSeconds,
    setRemainingSeconds,
    isTimerRunning,
    setIsTimerRunning,
    mode,
    setMode,
    startNewTimer,
    timerDurationConfigs,
    setTimerDurationConfigs,
    isTimerConfigOpen,
    setIsTimerConfigOpen,
    toggleTimer,
    resetTimer,
    timerCombo,
    setTimerCombo,
    isReplay,
    setIsReplay,
    DEFAULT_CONFIGS,
    applyComboSettings,
    completedRounds,
    isReplayingNow,
  };
}
