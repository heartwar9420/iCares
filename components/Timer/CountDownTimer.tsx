import { useTimerContext } from '@/Context/TimerContext';

export default function CountDownTimer() {
  // Math.floor = 把小數點後面的數字全部切掉
  const { remainingSeconds, mode, timerDurationConfigs } = useTimerContext();
  const minutes = Math.floor(remainingSeconds / 60);
  // % = 取餘數
  const displaySeconds = remainingSeconds % 60;
  const modeText = {
    work: '專注中',
    rest: '短休息中',
    long_rest: '長休息中',
  };
  let defaultTimeString = '';
  if (mode === 'work') {
    defaultTimeString = `${timerDurationConfigs.work_time_minutes}:00`;
  }
  if (mode === 'long_rest') {
    defaultTimeString = `${timerDurationConfigs.long_rest_time_minutes}:00`;
  }
  if (mode === 'rest') {
    defaultTimeString = `00:${timerDurationConfigs.short_rest_time_seconds}`;
  }

  return (
    <div className="flex gap-5 bg-orange-800 rounded-2xl p-3 h-fit min-w-80 w-fit mt-10 mx-10 justify-center">
      <div className="text-4xl font-mono text-amber-50">
        {remainingSeconds === 0 ? '準備開始' : `${modeText[mode]}`}
      </div>
      <div className="text-4xl font-mono text-amber-50 ">
        {/* 當秒數小於 10 ， 在前面加一個 0 ， 三元運算子 */}
        {remainingSeconds > 0
          ? `${minutes}:${displaySeconds < 10 ? `0${displaySeconds}` : displaySeconds}`
          : defaultTimeString}
      </div>
    </div>
  );
}
