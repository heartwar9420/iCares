import { useState } from 'react';

export default function useTimer() {
  // 設定時間，預設數字
  const [seconds, setSeconds] = useState(0);
  // 是否計時，預設暫停
  const [isActive, setIsActive] = useState(false);
  // 設定狀態，預設是'work'
  // const [mode, setMode] = useState('work');
  const [mode, setMode] = useState<'work' | 'rest' | 'longRest'>('work');

  // 設定 startNewTimer 函式 targetMode
  //(targetMode = mode) 的意思是：如果不傳參數，就預設使用目前的 mode
  const startNewTimer = async (targetMode = mode) => {
    // 把現在的時間記下來
    const now_time = new Date();

    const URL = `http://127.0.0.1:8000/api/timer?mode=${targetMode}`;
    try {
      // fetchAPI
      const response = await fetch(URL);
      // 轉成json格式
      const result = await response.json();
      const data = result.data;
      // 把後端的時間存到end_time 變數中
      const end_time = new Date(data.end_time);
      // 計算後端的結束時間和現在的時間 / 1000 轉成秒數格式(原本是毫秒)
      const select_time = Math.floor((end_time.getTime() - now_time.getTime()) / 1000);
      // 把時間設成 select_time
      setSeconds(select_time);
      // 開始計時
      setIsActive(true);
    } catch (error) {
      console.log('Failed to fetch timer:', error);
    }
  };
  return { seconds, setSeconds, isActive, setIsActive, mode, setMode, startNewTimer };
}
