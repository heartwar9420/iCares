import { useState } from 'react';

export default function useTimer() {
  // 設定時間，預設數字
  const [seconds, setSeconds] = useState(0);
  // 是否計時，預設暫停
  const [isActive, setIsActive] = useState(false);
  // 設定狀態，預設是'work'
  // const [mode, setMode] = useState('work');
  const [mode, setMode] = useState<'work' | 'rest' | 'long_rest'>('work');

  const [workCount, setWorkCount] = useState(0);

  // 設定 startNewTimer 函式 targetMode
  //(targetMode = mode) 的意思是：如果不傳參數，就預設使用目前的 mode
  const startNewTimer = async (targetMode = mode) => {
    setIsActive(false);
    let finalMode = targetMode;
    if (targetMode === 'rest') {
      const nextCount = workCount + 1;
      if (nextCount >= 3) {
        finalMode = 'long_rest';
        setWorkCount(0);
      } else {
        setWorkCount(nextCount);
      }
    }

    const URL = `${process.env.NEXT_PUBLIC_API_URL}/api/timer?mode=${finalMode}`;
    // const URL = `http://127.0.0.1:8000/api/timer?mode=${targetMode}`;
    // 因為要上線，後端的網址就不會是固定的
    // 而 NEXT_PUBLIC 是固定寫法 , _API_URL 是自已取名的
    try {
      // fetchAPI
      const response = await fetch(URL);
      // 轉成json格式
      const result = await response.json();
      const data = result.data;
      setMode(finalMode);
      setSeconds(data.duration_seconds);
      // 開始計時
      setIsActive(true);
    } catch (error) {
      console.log('Failed to fetch timer:', error);
    }
  };
  return { seconds, setSeconds, isActive, setIsActive, mode, setMode, startNewTimer, workCount };
}
