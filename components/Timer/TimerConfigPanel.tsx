interface Props {
  label: string;
  timeKey:
    | 'work_time_minutes'
    | 'short_rest_time_seconds'
    | 'long_rest_time_minutes'
    | 'rounds_to_long_rest';
  value: number;
  isDisabled: boolean;
  onUpdate: (
    timeKey:
      | 'work_time_minutes'
      | 'short_rest_time_seconds'
      | 'long_rest_time_minutes'
      | 'rounds_to_long_rest',
    value: number,
  ) => void;
}

import { useTimerContext } from '@/Context/TimerContext';
import ActionIconButton from '../UI/ActionIconButton';
import { CircleMinus, CirclePlus, Square, SquareCheck, SquareX } from 'lucide-react';
import { useEffect, useRef } from 'react';

const SettingRow = ({ label, timeKey, value, onUpdate, isDisabled }: Props) => {
  return (
    <div className="p-3 items-center flex gap-5">
      <div className="flex-1 text-2xl">
        {label}：{value}
      </div>
      <ActionIconButton onClick={() => onUpdate(timeKey, value - 1)} disabled={isDisabled}>
        <CircleMinus size={24} />
      </ActionIconButton>
      <input
        className="w-10 flex bg-amber-300 rounded-2xl text-center [&::-webkit-inner-spin-button]:appearance-none"
        type="number"
        value={value}
        onChange={(e) => onUpdate(timeKey, Number(e.target.value))}
        disabled={isDisabled}
      />
      <input
        type="range"
        min={'1'}
        max={
          timeKey === 'rounds_to_long_rest'
            ? '5'
            : timeKey === 'short_rest_time_seconds'
              ? '600'
              : '60'
        }
        // 條件A ? 結果A : (條件B ? 結果B : 預設的結果)
        value={value}
        onChange={(e) => onUpdate(timeKey, Number(e.target.value))}
        disabled={isDisabled}
      />

      <ActionIconButton onClick={() => onUpdate(timeKey, value + 1)} disabled={isDisabled}>
        <CirclePlus size={24} />
      </ActionIconButton>
    </div>
  );
};

export default function TimerConfigPanel() {
  const {
    isTimerConfigOpen,
    setIsTimerConfigOpen,
    timerDurationConfigs,
    setTimerDurationConfigs,
    timerCombo,
    setTimerCombo,
    setIsReplay,
    resetTimer,
    isReplay,
    originTimerMode,
  } = useTimerContext();
  const isInputsLocked = timerCombo !== 'CustomCombo';
  // Ref 監聽 panel
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originTimerMode && panelRef.current) {
        // e.target 在 TypeScript 預設是 EventTarget 類型，需轉型為 Node 才能給 contains 使用
        if (!panelRef.current.contains(e.target as Node)) {
          setIsTimerConfigOpen(false);
          setIsReplay(originTimerMode.isReplay);
          setTimerDurationConfigs(originTimerMode?.timerDurationConfigs);
          setTimerCombo(originTimerMode?.timerCombo);
        }
      }
    };
    if (isTimerConfigOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    isTimerConfigOpen,
    originTimerMode,
    setIsReplay,
    setIsTimerConfigOpen,
    setTimerDurationConfigs,
    setTimerCombo,
  ]);
  const updateTime = (
    key:
      | 'work_time_minutes'
      | 'short_rest_time_seconds'
      | 'long_rest_time_minutes'
      | 'rounds_to_long_rest',
    newValue: number,
  ) => {
    if (newValue < 1) {
      return;
    }
    setTimerDurationConfigs((prev) => ({ ...prev, [key]: newValue }));
  };

  if (!isTimerConfigOpen) {
    return null;
  }
  const selectedCombo = (key: 'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo') => {
    if (key === 'iCares') {
      setTimerDurationConfigs({
        work_time_minutes: 20,
        short_rest_time_seconds: 20,
        long_rest_time_minutes: 20,
        rounds_to_long_rest: 5,
      });
      setTimerCombo('iCares');
      setIsReplay(true);
    }
    if (key === 'Immersion') {
      setTimerDurationConfigs({
        work_time_minutes: 0.1,
        short_rest_time_seconds: 1,
        long_rest_time_minutes: 0.1,
        rounds_to_long_rest: 2,
      });
      setTimerCombo('Immersion');
      setIsReplay(false);
    }
    if (key === 'TomatoClock') {
      setTimerDurationConfigs({
        work_time_minutes: 20,
        short_rest_time_seconds: 300,
        long_rest_time_minutes: 30,
        rounds_to_long_rest: 4,
      });
      setTimerCombo('TomatoClock');
      setIsReplay(false);
    }
    if (key === 'CustomCombo') {
      setTimerDurationConfigs({
        work_time_minutes: 20,
        short_rest_time_seconds: 20,
        long_rest_time_minutes: 20,
        rounds_to_long_rest: 5,
      });
      setTimerCombo('CustomCombo');
      setIsReplay(false);
    }
  };

  return (
    <div className="absolute bg-blue-300 z-50 rounded-2xl p-2 w-fit mb-100" ref={panelRef}>
      <div className="grid grid-cols-4 gap-5 ">
        <ActionIconButton
          className="bg-amber-100 rounded-2xl p-2"
          onClick={() => {
            resetTimer();
            selectedCombo('iCares');
          }}
        >
          iCares
        </ActionIconButton>

        <ActionIconButton
          className="bg-amber-100 rounded-2xl p-2"
          onClick={() => {
            resetTimer();
            selectedCombo('Immersion');
          }}
        >
          沉浸專注
        </ActionIconButton>
        <ActionIconButton
          className="bg-amber-100 rounded-2xl p-2"
          onClick={() => {
            resetTimer();
            selectedCombo('TomatoClock');
          }}
        >
          番茄鐘
        </ActionIconButton>
        <ActionIconButton
          className="bg-amber-100 rounded-2xl p-2"
          onClick={() => {
            resetTimer();
            selectedCombo('CustomCombo');
          }}
        >
          自訂模式
        </ActionIconButton>
      </div>
      <SettingRow
        label="專注時間(分鐘)"
        timeKey="work_time_minutes"
        value={timerDurationConfigs.work_time_minutes}
        onUpdate={updateTime}
        isDisabled={isInputsLocked}
      />
      <SettingRow
        label="短休息(秒鐘)"
        timeKey="short_rest_time_seconds"
        value={timerDurationConfigs.short_rest_time_seconds}
        onUpdate={updateTime}
        isDisabled={isInputsLocked}
      />
      <SettingRow
        label="長休息(分鐘)"
        timeKey="long_rest_time_minutes"
        value={timerDurationConfigs.long_rest_time_minutes}
        onUpdate={updateTime}
        isDisabled={isInputsLocked}
      />
      <SettingRow
        label="循環次數"
        timeKey="rounds_to_long_rest"
        value={timerDurationConfigs.rounds_to_long_rest}
        onUpdate={updateTime}
        isDisabled={isInputsLocked}
      />
      <div className="flex items-center gap-5">
        <div className="text-2xl p-3 flex">神經重放模式</div>
        <div className="text-2xl">開啟</div>
        <ActionIconButton disabled={isInputsLocked} onClick={() => setIsReplay(true)}>
          {isReplay ? <SquareCheck size={32} /> : <Square size={32} />}
        </ActionIconButton>
        <div className="text-2xl">關閉</div>
        <ActionIconButton disabled={isInputsLocked} onClick={() => setIsReplay(false)}>
          {isReplay ? <Square size={32} /> : <SquareCheck size={32} />}
        </ActionIconButton>
      </div>
      <div className="flex justify-center gap-30">
        <ActionIconButton
          onClick={() => {
            setIsTimerConfigOpen(false);
            resetTimer();
          }}
          className="flex items-center text-green-700 gap-3"
        >
          <span className="text-2xl ">確認</span>
          <SquareCheck size={36} />
        </ActionIconButton>

        <ActionIconButton
          onClick={() => {
            setIsTimerConfigOpen(false);
            if (originTimerMode) {
              setTimerCombo(originTimerMode.timerCombo);
              setIsReplay(originTimerMode.isReplay);
              setTimerDurationConfigs(originTimerMode.timerDurationConfigs);
            }
          }}
          className="flex items-center text-red-700 gap-3"
        >
          <span className="text-2xl ">取消</span>
          <SquareX size={36} />
        </ActionIconButton>
      </div>
    </div>
  );
}
