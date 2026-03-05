import { useEffect, useState, useCallback, useRef } from 'react';

interface BackupData {
  timerCombo: 'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo';
  timerDurationConfigs: {
    work_time_minutes: number;
    short_rest_time_seconds: number;
    long_rest_time_minutes: number;
    rounds_to_long_rest: number;
  };
  isReplay: boolean;
}

// 在 typeof window !== 'undefined' 的檢查下建立，避免報錯
const replaySound = typeof window !== 'undefined' ? new Audio('/RandomBeep.mp3') : null;
const startSound = typeof window !== 'undefined' ? new Audio('/start.mp3') : null;
const finishSound = typeof window !== 'undefined' ? new Audio('finish.mp3') : null;

export default function useTimer() {
  // 剩餘時間有多少？ 預設 0
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  // 計時器是否在倒數中 預設是否
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // 設定狀態，只能接受'work'和'rest'和'long_rest'，預設是('work')
  const [mode, setMode] = useState<'work' | 'rest' | 'long_rest'>('work');
  // 設定是否是 自訂模式
  const [isCustomMode, setIsCustomMode] = useState(false);
  // 設定計時設定頁面是否開啟
  const [isTimerConfigOpen, setIsTimerConfigOpen] = useState(false);
  // 用來記錄使用者的原始設定
  const [originTimerMode, setOriginTimerMode] = useState<BackupData>();
  // timerCombo 用來記錄現在使用者選擇的 方案為何
  const [timerCombo, setTimerCombo] = useState<
    'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo'
  >('iCares');
  // Replay 的計時邏輯 用useRef 來記住數字
  const nextReplayTargetSeconds = useRef<null | number>(null);
  // isReplay 設定是否要神經重放
  const [isReplay, setIsReplay] = useState(true);

  // 取得隨機 180~300秒
  const getRandomReplaySeconds = () => {
    const rawReplaySeconds = Math.random() * 120 + 180;
    const roundedReplaySeconds = Math.floor(rawReplaySeconds);
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
        nextReplayTargetSeconds.current = remainingSeconds - getRandomReplaySeconds();
      }
    }
  }, [remainingSeconds, isReplay, mode]);

  // 設定計時時間的預設時間
  const [timerDurationConfigs, setTimerDurationConfigs] = useState({
    work_time_minutes: 20,
    short_rest_time_seconds: 20,
    long_rest_time_minutes: 20,
    rounds_to_long_rest: 5,
  });

  const startNewTimer = useCallback(
    async (targetMode = mode, targetConfigs = timerDurationConfigs, useCustom = isCustomMode) => {
      const apiParams: Record<string, string> = {
        mode: targetMode,
      };
      apiParams.work_time_minutes = String(targetConfigs.work_time_minutes);
      apiParams.short_rest_time_seconds = String(targetConfigs.short_rest_time_seconds);
      apiParams.long_rest_time_minutes = String(targetConfigs.long_rest_time_minutes);
      apiParams.rounds_to_long_rest = String(targetConfigs.rounds_to_long_rest);
      const URLString = new URLSearchParams(apiParams).toString();
      const URL = `${process.env.NEXT_PUBLIC_API_URL}/api/timer?${URLString}`;
      // const URL = `${process.env.NEXT_PUBLIC_API_URL}/api/timer?mode=${targetMode}`;
      // const URL = `http://127.0.0.1:8000/api/timer?mode=${targetMode}`;
      // 因為要上線，後端的網址就不會是固定的
      // 而 NEXT_PUBLIC 是固定寫法 , _API_URL 是自已取名的

      try {
        // fetchAPI
        const response = await fetch(URL);
        // 轉成json格式
        const fetchedTimerResult = await response.json();
        const fetchedTimerData = fetchedTimerResult.data;

        setMode(fetchedTimerData.mode);
        setRemainingSeconds(fetchedTimerData.duration_seconds);
        setIsTimerRunning(true);
        // useRef的值會存在 .current 中
        nextReplayTargetSeconds.current =
          fetchedTimerData.duration_seconds - getRandomReplaySeconds();
      } catch (error) {
        console.log('Failed to fetch timer:', error);
        setIsTimerRunning(false);
      }
    },
    // 當 底下的參數發生 改變時才需要重新產生此函式
    [mode, timerDurationConfigs, isCustomMode],
  );
  useEffect(() => {
    if (isTimerRunning && remainingSeconds === 0) {
      const nextMode = mode === 'work' ? 'rest' : 'work';
      setTimeout(() => {
        startNewTimer(nextMode);
        if (finishSound && startSound) {
          const newFinishSound = finishSound.cloneNode(true) as HTMLAudioElement;
          const newStartSound = startSound.cloneNode(true) as HTMLAudioElement;
          if (mode === 'work') {
            newFinishSound.volume = 0.3;
            newFinishSound.play();
          }
          if (mode === 'rest' || mode === 'long_rest') {
            newStartSound.play();
          }
        }
      }, 0);
      return;
    }
    if (!isTimerRunning || remainingSeconds <= 0) {
      return;
    }
    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerRunning, remainingSeconds, mode, startNewTimer]);

  // toggleTimer 暫停 / 開始切換器
  const toggleTimer = async () => {
    if (!isTimerRunning) {
      // 判斷是否為「全新開始」：只有歸零時才向後端拿新時間
      if (remainingSeconds === 0) {
        startNewTimer();
        setIsTimerConfigOpen(false);
        if (startSound) {
          const newStartSound = startSound.cloneNode(true) as HTMLAudioElement;
          newStartSound.play();
        }
      } else {
        setIsTimerRunning(true);
        setIsTimerConfigOpen(false);
        if (startSound) {
          const newStartSound = startSound.cloneNode(true) as HTMLAudioElement;
          newStartSound.play();
        }
      }
    } else {
      setIsTimerRunning(false);
      setIsTimerConfigOpen(false);
      if (finishSound) {
        const newFinishSound = finishSound.cloneNode(true) as HTMLAudioElement;
        newFinishSound.volume = 0.3;
        newFinishSound.play();
      }
    }
  };
  // resetTimer 長按重置 計時器
  const resetTimer = async () => {
    setIsTimerRunning(false);
    setRemainingSeconds(0);
    setMode('work');
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
    originTimerMode,
    setOriginTimerMode,
  };
}
