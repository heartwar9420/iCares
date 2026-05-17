'use client';

import { useCallback, useMemo, useRef, useEffect } from 'react';
import TimerSettingButton from '../Timer/TimerSettingButton';
import TimerConfigPanel from '../Timer/TimerConfigPanel';
import FocusMatrix from '../Stats/FocusMatrix';
import ActionIconButton from '../UI/ActionIconButton';
import { TimerReset } from 'lucide-react';
import { useTimerStore } from '@/src/stores/useTimerStore';
import { useProfileContext } from '@/src/contexts/ProfileContext';
import { useChatContext } from '@/src/contexts/ChatContext';
import { TimerProgress } from '../Timer/TimerProgress';

function StatusMessage() {
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const isTimerRunning = useTimerStore((s) => s.isTimerRunning);
  const mode = useTimerStore((s) => s.mode);
  const isReplayingNow = useTimerStore((s) => s.isReplayingNow);

  const modeText = { work: '專注中', rest: '短休息', long_rest: '長休息' };
  const currentModeText = modeText[mode as keyof typeof modeText] || '狀態讀取中';
  const statusMessage = remainingSeconds === 0 && !isTimerRunning ? '準備開始' : currentModeText;

  if (isReplayingNow && mode === 'work' && isTimerRunning) {
    return (
      <p className="text-blue-400 font-bold text-lg tracking-widest animate-pulse drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
        神經重放中，請閉眼10秒
      </p>
    );
  }

  return (
    <p className="text-slate-500 font-bold text-lg tracking-[0.4em]">當前階段：{statusMessage}</p>
  );
}

export default function FocusCore() {
  const { user } = useProfileContext();
  const { updateStatus } = useChatContext();

  const updateStatusRef = useRef(updateStatus);
  useEffect(() => {
    updateStatusRef.current = updateStatus;
  }, [updateStatus]);

  const isTimerRunning = useTimerStore((s) => s.isTimerRunning);
  const mode = useTimerStore((s) => s.mode);
  const toggleTimer = useTimerStore((s) => s.toggleTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const timerDurationConfigs = useTimerStore((s) => s.timerDurationConfigs);
  const completedRounds = useTimerStore((s) => s.completedRounds);

  const hasStarted = isTimerRunning || useTimerStore.getState().remainingSeconds > 0;

  const handleResetClick = useCallback(() => {
    const stableUpdateStatus = (s: string) =>
      updateStatusRef.current?.(s as '專注中' | '閒置中' | '離線中');
    resetTimer(user?.id, stableUpdateStatus);
  }, [resetTimer, user?.id]);

  const handleToggleClick = useCallback(() => {
    const stableUpdateStatus = (s: string) =>
      updateStatusRef.current?.(s as '專注中' | '閒置中' | '離線中');
    toggleTimer(user?.id, stableUpdateStatus, undefined);
  }, [toggleTimer, user?.id]);

  const renderedDots = useMemo(() => {
    const totalRounds = timerDurationConfigs.roundsToLongRest;
    return Array.from({ length: totalRounds }).map((_, index) => {
      const isCompleted = index < completedRounds;
      const isCurrent = index === completedRounds && mode === 'work';
      return (
        <span
          key={index}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${isCompleted ? 'bg-[#ffb347]' : isCurrent ? 'bg-[#ffb347] animate-pulse ' : 'bg-white/30'}`}
        ></span>
      );
    });
  }, [timerDurationConfigs.roundsToLongRest, completedRounds, mode]);

  const renderedResetButton = useMemo(
    () => (
      <ActionIconButton onClick={handleResetClick}>
        <TimerReset
          className={`w-10 h-10 text-slate-500 hover:text-white transition-colors duration-200 opacity-0 ${hasStarted ? 'opacity-100' : ''}`}
        />
      </ActionIconButton>
    ),
    [handleResetClick, hasStarted],
  );

  const renderedMainButton = useMemo(
    () => (
      <ActionIconButton onClick={handleToggleClick} className="flex group relative shrink-0">
        <div
          className={`absolute -inset-1 rounded-full blur opacity-60 group-hover:opacity-90 transition duration-500 group-hover:duration-200 ${isTimerRunning ? 'bg-linear-to-r from-red-500 to-rose-600' : 'bg-linear-to-r from-[#ffb347] to-orange-600'}`}
        ></div>
        <div
          className={`relative px-8 md:px-16 py-2 md:py-5 rounded-full font-bold text-xl tracking-[0.25rem] hover:scale-105 active:scale-95 transition-all duration-300 ${isTimerRunning ? 'bg-red-500 text-white' : 'bg-[#ffb347] text-[#0a0e17]'}`}
        >
          {isTimerRunning ? '暫停專注' : !hasStarted ? '開始專注' : '繼續專注'}
        </div>
      </ActionIconButton>
    ),
    [handleToggleClick, isTimerRunning, hasStarted],
  );

  return (
    <div className="flex flex-col items-center justify-between relative min-h-0 w-full h-full overflow-y-auto custom-scrollbar">
      {/* 計時區塊 */}
      <div className="flex flex-col flex-1 items-center justify-center w-full ">
        <div className="text-center">
          <TimerProgress size={300} strokeWidth={30} />
        </div>

        <div className="h-4 flex flex-col items-center justify-center mt-2 transition-all">
          <StatusMessage />
        </div>

        {/* 進度點點 */}
        <div className="flex items-center justify-center gap-2 my-2">{renderedDots}</div>

        {/* 三個按鈕區塊 */}
        <div className="my-4 flex items-center justify-center text-center gap-6">
          {/* 重置按鈕 */}
          {renderedResetButton}

          {/* 主按鈕 */}
          {renderedMainButton}

          {/* 設定按鈕 & Panel */}
          <div className="relative group flex items-center justify-center shrink-0">
            <TimerSettingButton />
            {hasStarted && (
              <div
                className={`absolute bottom-full mb-3 px-3 py-2 bg-slate-800 text-white text-base rounded-lg whitespace-nowrap shadow-xl border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none right-0`}
              >
                只有重置計時器後才能開啟設定頁面！
              </div>
            )}
            <TimerConfigPanel />
          </div>
        </div>
      </div>

      {/* 熱力圖 */}
      <div className="w-full max-w-5xl shrink-0 min-h-60 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-4 flex ">
        <FocusMatrix />
      </div>
    </div>
  );
}
