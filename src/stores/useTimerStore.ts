import { create } from 'zustand';

export interface TimerConfig {
  workTimeMinutes: number;
  shortRestTimeSeconds: number;
  longRestTimeMinutes: number;
  roundsToLongRest: number;
}

export type TimerComboType = 'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo';
export type WorkerType = (startTime: Date, endTime: Date, durationSeconds: number) => void;

export const DEFAULT_CONFIGS: Record<string, TimerConfig> = {
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
    workTimeMinutes: 20,
    shortRestTimeSeconds: 20,
    longRestTimeMinutes: 20,
    roundsToLongRest: 5,
  },
};

const replaySound = typeof window !== 'undefined' ? new Audio('/RandomBeep.mp3') : null;
const startSound = typeof window !== 'undefined' ? new Audio('/start.mp3') : null;
const finishSound = typeof window !== 'undefined' ? new Audio('/finish.mp3') : null;
const longRestSound = typeof window !== 'undefined' ? new Audio('/longRest.mp3') : null;

const playAudio = (audioNode: HTMLAudioElement | null, targetVolume: number = 1.0) => {
  if (audioNode) {
    const clonedSound = audioNode.cloneNode(true) as HTMLAudioElement;
    clonedSound.volume = targetVolume;
    clonedSound.play();
  }
};

export const calculateReplaySeconds = (randomValue: number): number => {
  const safeRandom = Math.max(0, Math.min(1, randomValue));
  return Math.floor(180 + safeRandom * 120);
};

export const timerRefs = {
  nextReplayTargetSeconds: null as null | number,
  isProcessingEnd: false,
  sessionStartTimeRef: null as null | Date,
  targetEndTimeRef: null as null | number,
};

interface TimerStore {
  remainingSeconds: number;
  isTimerRunning: boolean;
  mode: 'work' | 'rest' | 'long_rest';
  isTimerConfigOpen: boolean;
  timerCombo: TimerComboType;
  isReplay: boolean;
  isDemo: boolean;
  completedRounds: number;
  isReplayingNow: boolean;
  timerDurationConfigs: TimerConfig;

  setRemainingSeconds: (secs: number) => void;
  setIsTimerRunning: (running: boolean) => void;
  setMode: (mode: 'work' | 'rest' | 'long_rest') => void;
  setIsTimerConfigOpen: (open: boolean) => void;
  setIsReplay: (replay: boolean) => void;
  setIsDemo: (demo: boolean) => void;
  setIsReplayingNow: (replaying: boolean) => void;
  setTimerDurationConfigs: (configs: TimerConfig) => void;

  applyComboSettings: (key: TimerComboType) => void;
  syncTimerAction: (
    userId: string | undefined,
    action: 'start' | 'pause' | 'reset' | 'complete',
    currentRemaining: number,
    currentMode: string,
  ) => Promise<void>;

  startNewTimer: (
    userId: string | undefined,
    updateStatus: (s: string) => void,
    onWorkEnd?: WorkerType,
    targetMode?: 'work' | 'rest' | 'long_rest',
  ) => Promise<string | undefined>;

  toggleTimer: (
    userId: string | undefined,
    updateStatus: (s: string) => void,
    onWorkEnd?: WorkerType,
  ) => Promise<void>;

  resetTimer: (userId: string | undefined, updateStatus: (s: string) => void) => Promise<void>;
}

export const useTimerStore = create<TimerStore>()((set, get) => ({
  remainingSeconds: 0,
  isTimerRunning: false,
  mode: 'work',
  isTimerConfigOpen: false,
  timerCombo: 'iCares',
  isReplay: true,
  isDemo: false,
  completedRounds: 0,
  isReplayingNow: false,
  timerDurationConfigs: {
    workTimeMinutes: 20,
    shortRestTimeSeconds: 20,
    longRestTimeMinutes: 20,
    roundsToLongRest: 5,
  },

  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
  setIsTimerRunning: (isTimerRunning) => set({ isTimerRunning }),
  setMode: (mode) => set({ mode }),
  setIsTimerConfigOpen: (isTimerConfigOpen) => set({ isTimerConfigOpen }),
  setIsReplay: (isReplay) => set({ isReplay }),
  setIsDemo: (isDemo) => set({ isDemo }),
  setIsReplayingNow: (isReplayingNow) => set({ isReplayingNow }),
  setTimerDurationConfigs: (timerDurationConfigs) => set({ timerDurationConfigs }),

  applyComboSettings: (key) => {
    set({
      timerCombo: key,
      isTimerRunning: false,
      remainingSeconds: 0,
      mode: 'work',
      completedRounds: 0,
      isReplayingNow: false,
    });
    timerRefs.targetEndTimeRef = null;

    if (key === 'CustomCombo') {
      const savedConfig = localStorage.getItem('icares_custom_config');
      const savedReplay = localStorage.getItem('icares_custom_replay');
      if (savedConfig) set({ timerDurationConfigs: JSON.parse(savedConfig) });
      set({ isReplay: savedReplay ? JSON.parse(savedReplay) : false });
    } else if (DEFAULT_CONFIGS[key]) {
      set({
        timerDurationConfigs: DEFAULT_CONFIGS[key],
        isReplay: key === 'iCares',
      });
    }
  },

  syncTimerAction: async (userId, action, currentRemaining, currentMode) => {
    if (!userId) return;
    const safeRemaining = isNaN(currentRemaining) ? 0 : Math.round(currentRemaining);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timer/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action,
          mode: currentMode,
          remaining_seconds: safeRemaining,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('同步計時器狀態失敗:', error);
    }
  },

  startNewTimer: async (userId, updateStatus, onWorkEnd, targetMode) => {
    if (!userId) return;
    const { mode, timerDurationConfigs, isDemo, syncTimerAction } = get();
    const nextTargetMode = targetMode ?? mode;

    const apiParams = new URLSearchParams({
      user_id: userId,
      mode: nextTargetMode,
      work_time_minutes: String(timerDurationConfigs.workTimeMinutes),
      short_rest_time_seconds: String(timerDurationConfigs.shortRestTimeSeconds),
      long_rest_time_minutes: String(timerDurationConfigs.longRestTimeMinutes),
      rounds_to_long_rest: String(timerDurationConfigs.roundsToLongRest),
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timer?${apiParams.toString()}`,
      );
      const result = await response.json();
      if (!response.ok || !result.data) return;

      const { data } = result;
      set({
        remainingSeconds: data.duration_seconds,
        mode: data.mode,
        completedRounds: data.completed_work_count || 0,
        isTimerRunning: true,
      });

      timerRefs.targetEndTimeRef = Date.now() + data.duration_seconds * 1000;

      if (isDemo) {
        set({ isReplayingNow: true });
        playAudio(replaySound);
        timerRefs.nextReplayTargetSeconds = data.duration_seconds - 15;
      } else {
        timerRefs.nextReplayTargetSeconds =
          data.duration_seconds - calculateReplaySeconds(Math.random());
      }

      if (data.mode === 'work') {
        timerRefs.sessionStartTimeRef = new Date();
      }

      syncTimerAction(userId, 'start', data.duration_seconds, data.mode);
      return data.mode;
    } catch (error) {
      console.error('Failed to fetch timer:', error);
      set({ isTimerRunning: false });
    }
  },

  toggleTimer: async (userId, updateStatus, onWorkEnd) => {
    const {
      isTimerRunning,
      remainingSeconds,
      timerDurationConfigs,
      startNewTimer,
      mode,
      syncTimerAction,
    } = get();
    if (!userId) return;

    if (!isTimerRunning) {
      if (remainingSeconds === 0) {
        const totalSeconds = timerDurationConfigs.workTimeMinutes * 60;
        set({ remainingSeconds: totalSeconds, isTimerRunning: true, isTimerConfigOpen: false });
        playAudio(startSound);
        updateStatus('專注中');
        await startNewTimer(userId, updateStatus, onWorkEnd);
      } else {
        timerRefs.targetEndTimeRef = Date.now() + remainingSeconds * 1000;
        syncTimerAction(userId, 'start', remainingSeconds, mode);
        set({ isTimerRunning: true, isTimerConfigOpen: false });
        playAudio(startSound);
        updateStatus('專注中');
      }
    } else {
      set({ isTimerRunning: false, isTimerConfigOpen: false, isReplayingNow: false });
      timerRefs.targetEndTimeRef = null;
      syncTimerAction(userId, 'pause', remainingSeconds, mode);
      playAudio(finishSound);
      updateStatus('閒置中');
    }
  },

  resetTimer: async (userId, updateStatus) => {
    const { syncTimerAction } = get();
    set({
      isTimerRunning: false,
      remainingSeconds: 0,
      mode: 'work',
      completedRounds: 0,
      isReplayingNow: false,
    });
    timerRefs.targetEndTimeRef = null;
    updateStatus('閒置中');
    if (userId) syncTimerAction(userId, 'reset', 0, 'work');
  },
}));

export { playAudio, replaySound, startSound, finishSound, longRestSound };
