'use client';

import { useEffect, useCallback } from 'react';
import {
  useTimerStore,
  timerRefs,
  calculateReplaySeconds,
  playAudio,
  replaySound,
  longRestSound,
  finishSound,
  startSound,
  TimerComboType,
} from '../stores/useTimerStore';
import { useChatContext } from '../contexts/ChatContext';
import { useProfileContext } from '../contexts/ProfileContext';
import { useFocusContext } from '../contexts/FocusContext';

interface TimerOrchestratorProps {
  onWorkEnd?: (startTime: Date, endTime: Date, durationSeconds: number) => void;
}

export default function TimerOrchestrator({ onWorkEnd }: TimerOrchestratorProps) {
  const { user } = useProfileContext();
  const { updateStatus } = useChatContext();
  const { saveFocusToDatabase, activeId } = useFocusContext();

  const safeUpdateStatus = useCallback(
    (s: string) => {
      updateStatus(s as '專注中' | '閒置中' | '離線中');
    },
    [updateStatus],
  );

  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const isTimerRunning = useTimerStore((s) => s.isTimerRunning);
  const mode = useTimerStore((s) => s.mode);
  const isReplay = useTimerStore((s) => s.isReplay);
  const isDemo = useTimerStore((s) => s.isDemo);
  const isReplayingNow = useTimerStore((s) => s.isReplayingNow);

  const setRemainingSeconds = useTimerStore((s) => s.setRemainingSeconds);
  const setIsTimerRunning = useTimerStore((s) => s.setIsTimerRunning);
  const setMode = useTimerStore((s) => s.setMode);
  const setIsReplayingNow = useTimerStore((s) => s.setIsReplayingNow);
  const startNewTimer = useTimerStore((s) => s.startNewTimer);
  const applyComboSettings = useTimerStore((s) => s.applyComboSettings);

  useEffect(() => {
    if (!user?.id) return;
    const fetchServerTimerState = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timer/state/${user.id}`);
        const { status, data } = await res.json();
        if (status === 'success' && data) {
          setMode(data.mode || 'work');
          if (data.is_running && data.target_end_time) {
            const targetEndMs = new Date(data.target_end_time).getTime();
            const timeLeft = Math.round((targetEndMs - Date.now()) / 1000);
            if (timeLeft > 0) {
              timerRefs.targetEndTimeRef = targetEndMs;
              setRemainingSeconds(timeLeft);
              setIsTimerRunning(true);
              updateStatus(data.mode === 'work' ? '專注中' : '閒置中');
            } else {
              setRemainingSeconds(0);
              setIsTimerRunning(false);
            }
          } else {
            setRemainingSeconds(Number(data.remaining_seconds) || 0);
            setIsTimerRunning(false);
            timerRefs.targetEndTimeRef = null;
          }
        }
      } catch (error) {
        console.error('取得伺服器計時狀態失敗:', error);
      }
    };
    fetchServerTimerState();
  }, [user?.id, setMode, setRemainingSeconds, setIsTimerRunning, updateStatus]);

  useEffect(() => {
    if (!isReplay || mode !== 'work') {
      setIsReplayingNow(false);
      return;
    }
    if (remainingSeconds > 0 && remainingSeconds === timerRefs.nextReplayTargetSeconds) {
      if (!isDemo && remainingSeconds <= 180) return;
      setIsReplayingNow(true);
      playAudio(replaySound);
      const nextInterval = isDemo ? 15 : calculateReplaySeconds(Math.random());
      timerRefs.nextReplayTargetSeconds = remainingSeconds - nextInterval;
    }
  }, [remainingSeconds, isReplay, mode, isDemo, setIsReplayingNow]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isReplayingNow) {
      timer = setTimeout(() => {
        setIsReplayingNow(false);
        playAudio(replaySound);
      }, 10000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isReplayingNow, setIsReplayingNow]);

  useEffect(() => {
    if (isTimerRunning && remainingSeconds === 0) {
      if (timerRefs.isProcessingEnd) return;
      timerRefs.isProcessingEnd = true;

      if (mode === 'work') {
        const endTime = new Date();
        const startTime = timerRefs.sessionStartTimeRef || new Date();
        const finalDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        saveFocusToDatabase(startTime, endTime, finalDuration, activeId);
      }

      const nextMode = mode === 'work' ? 'rest' : 'work';
      setTimeout(async () => {
        try {
          const actualNextMode = await startNewTimer(
            user?.id,
            safeUpdateStatus,
            onWorkEnd,
            nextMode,
          );
          if (mode === 'work') {
            if (actualNextMode === 'long_rest') playAudio(longRestSound);
            else playAudio(finishSound);
            updateStatus('閒置中');
          } else {
            playAudio(startSound);
            updateStatus('專注中');
          }
        } catch (error) {
          console.error('切換階段失敗:', error);
        } finally {
          timerRefs.isProcessingEnd = false;
        }
      }, 400);
      return;
    }

    if (!isTimerRunning || remainingSeconds <= 0) return;

    const intervalId = setInterval(() => {
      if (timerRefs.targetEndTimeRef) {
        const timeLeft = Math.round((timerRefs.targetEndTimeRef - Date.now()) / 1000);
        setRemainingSeconds(timeLeft <= 0 ? 0 : timeLeft);
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
    user?.id,
    setRemainingSeconds,
    safeUpdateStatus,
    activeId,
    saveFocusToDatabase,
  ]);

  useEffect(() => {
    const lastMode = localStorage.getItem('icares_last_mode');

    if (lastMode) applyComboSettings(lastMode as TimerComboType);
  }, [applyComboSettings]);

  return null;
}
