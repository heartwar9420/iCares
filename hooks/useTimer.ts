import { useEffect, useState, useCallback } from 'react';

export default function useTimer() {
  // 剩餘時間有多少？ 預設 0
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  // 計時器是否在倒數中 預設是否
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // 設定狀態，只能接受'work'和'rest'和'long_rest'，預設是('work')
  const [mode, setMode] = useState<'work' | 'rest' | 'long_rest' | 'custom'>('work');

  const [timerDurationConfigs, setTimerDurationConfigs] = useState({
    work_time: 10,
    rest_time: 10,
    long_rest_time: 20,
  }); //demo用，先預設 3 秒

  // 設定 startNewTimer 函式 targetMode
  //(targetMode = mode) 的意思是：如果不傳參數，就預設使用目前的 mode
  const startNewTimer = useCallback(
    async (targetMode = mode, targetConfigs = timerDurationConfigs) => {
      const apiParams: Record<string, string> = {
        mode: targetMode,
      };
      if (targetMode === 'custom') {
        apiParams.work_time = String(targetConfigs.work_time);
        apiParams.rest_time = String(targetConfigs.rest_time);
        apiParams.long_rest_time = String(targetConfigs.long_rest_time);
      }
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
      } catch (error) {
        console.log('Failed to fetch timer:', error);
        setIsTimerRunning(false);
      }
    },
    // 當 mode / timerDurationConfigs 改變時才需要重新產生此函式
    [mode, timerDurationConfigs],
  );
  useEffect(() => {
    if (isTimerRunning && remainingSeconds === 0) {
      const nextMode = mode === 'work' ? 'rest' : 'work';
      setTimeout(() => {
        startNewTimer(nextMode);
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

  return {
    remainingSeconds,
    setRemainingSeconds,
    isTimerRunning,
    setIsTimerRunning,
    mode,
    setMode,
    startNewTimer,
    setTimerDurationConfigs,
  };
}
