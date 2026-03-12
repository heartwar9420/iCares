import { useEffect, useState, useCallback, useRef } from 'react';
import { useFocus } from '@/Context/FocusContext';

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
  // timerCombo 用來記錄現在使用者選擇的 方案為何
  const [timerCombo, setTimerCombo] = useState<
    'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo'
  >('iCares');
  // Replay 的計時邏輯 用useRef 來記住數字
  const nextReplayTargetSeconds = useRef<null | number>(null);
  // isReplay 設定是否要神經重放
  const [isReplay, setIsReplay] = useState(true);

  const isProcessingEnd = useRef(false);

  const { markCellAsFocused } = useFocus();

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
        return fetchedTimerData.mode;
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
      // 如果已經在處理結束邏輯，就不要再進來了（防止響兩聲）
      if (isProcessingEnd.current) return;

      // 鎖上鎖頭，代表「我正在處理結束囉，其他重複的觸發請擋在門外」
      isProcessingEnd.current = true;
      // 如果剛剛結束的模式是 專注， 就要點亮格子
      if (mode === 'work') {
        // 算出目前的時間對應的格子
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        const currentCellId = Math.floor(currentTotalMinutes / 10);

        markCellAsFocused(currentCellId);
      }
      const nextMode = mode === 'work' ? 'rest' : 'work';
      setTimeout(async () => {
        const actualNextMode = await startNewTimer(nextMode);

        // 1. 判斷剛結束的是什麼，以及接下來是什麼
        if (mode === 'work') {
          // 專注結束了！
          if (actualNextMode === 'long_rest') {
            playAudio(longRestSound, 1.0); // 下一個是長休息，播長休息音效
          } else {
            playAudio(finishSound, 1.0); // 下一個是短休息，播一般結束音效
          }
        } else {
          // 休息結束了，準備開始工作
          playAudio(startSound, 1.0);
        }
        isProcessingEnd.current = false;
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
  }, [isTimerRunning, remainingSeconds, mode, startNewTimer, markCellAsFocused]);
  // 網頁初次載入時，讀取 localStorage 的紀錄
  useEffect(() => {
    // 確保只在瀏覽器端執行
    if (typeof window !== 'undefined') {
      // 🔥 加上 setTimeout，將狀態更新推遲到下一個事件循環，完美避開 React 的同步渲染警告
      const initTimer = setTimeout(() => {
        const lastMode = localStorage.getItem('icares_last_mode') as
          | 'iCares'
          | 'Immersion'
          | 'TomatoClock'
          | 'CustomCombo'
          | null;

        if (lastMode) {
          setTimerCombo(lastMode);

          if (lastMode === 'CustomCombo') {
            const savedConfig = localStorage.getItem('icares_custom_config');
            const savedReplay = localStorage.getItem('icares_custom_replay');
            if (savedConfig) setTimerDurationConfigs(JSON.parse(savedConfig));
            if (savedReplay) setIsReplay(JSON.parse(savedReplay));
          } else if (lastMode === 'TomatoClock') {
            setTimerDurationConfigs({
              work_time_minutes: 20,
              short_rest_time_seconds: 300,
              long_rest_time_minutes: 30,
              rounds_to_long_rest: 4,
            });
            setIsReplay(false);
          } else if (lastMode === 'Immersion') {
            setTimerDurationConfigs({
              work_time_minutes: 0.1,
              short_rest_time_seconds: 3,
              long_rest_time_minutes: 0.1,
              rounds_to_long_rest: 2,
            });
            setIsReplay(false);
          } else {
            setTimerDurationConfigs({
              work_time_minutes: 20,
              short_rest_time_seconds: 20,
              long_rest_time_minutes: 20,
              rounds_to_long_rest: 5,
            });
            setIsReplay(true);
          }
        }
      }, 0);

      // 清除計時器，避免元件卸載時發生記憶體洩漏
      return () => clearTimeout(initTimer);
    }
  }, []);

  // toggleTimer 暫停 / 開始切換器
  const toggleTimer = async () => {
    // 如果不是正在倒數中 (暫停中)
    if (!isTimerRunning) {
      // 如果時間剩餘時間 = 0 (未開始的第一次)
      if (remainingSeconds === 0) {
        // 開啟一個新的計時器
        startNewTimer();
        // 關閉設定panel
        setIsTimerConfigOpen(false);
        // 播放開始音效
        playAudio(startSound);
      } else {
        // 如果時間剩餘時間 != 0 (已經不是開始第一次了)
        // 開始倒數
        setIsTimerRunning(true);
        // 關閉設定panel
        setIsTimerConfigOpen(false);
        // 播放開始音效
        playAudio(startSound);
      }
    } else {
      // 如果正在倒數中
      // 暫停倒數
      setIsTimerRunning(false);
      // 關閉設定panel
      setIsTimerConfigOpen(false);
      // 播放暫停音效
      playAudio(finishSound);
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
  };
}
