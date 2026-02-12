import { useEffect } from 'react';

interface Props {
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  // 等同於 setSeconds: (val: number | ((prev: number) => number)) => void;
  isActive: boolean;
}

export default function CountdownTimer({ seconds, setSeconds, isActive }: Props) {
  // Math.floor = 把小數點後面的數字全部切掉
  const minutes = Math.floor(seconds / 60);
  // % = 取餘數
  const remainSeconds = seconds % 60;

  useEffect(() => {
    if (!isActive || seconds <= 0) return;

    // setInterval((),1000) = 每隔 1000 毫秒執行一次前面的動作
    const timerId = setInterval(() => {
      // setSeconds((先去看一下目前的數字) => 把目前的數字 -1 再放回來)
      setSeconds((prev) => prev - 1);
      // 每隔1秒做一次
    }, 1000);

    // 撤銷這張號碼牌對應的計時任務，確保舊的計時器被清乾淨，不浪費記憶體。
    return () => clearInterval(timerId);
  }, [seconds, isActive]); // 依賴陣列 當秒數變更或 開始專注後 就重新執行一次這個 useEffect

  return (
    <div className="text-4xl font-mono text-amber-50">
      {/* 當秒數小於 10 ， 在前面加一個 0 ， 三元運算子 */}
      {minutes}:{remainSeconds < 10 ? `0${remainSeconds}` : remainSeconds}
    </div>
  );
}
