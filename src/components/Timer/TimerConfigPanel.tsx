import { useTimerContext } from '@/src/contexts/TimerContext';
import type { TimerComboType } from '@/src/hooks/useTimer';
import ActionIconButton from '../UI/ActionIconButton';
import { CircleMinus, CirclePlus, Square, SquareCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

export type TimerKey =
  | 'workTimeMinutes'
  | 'shortRestTimeSeconds'
  | 'longRestTimeMinutes'
  | 'roundsToLongRest';

interface Props {
  label: string;
  timeKey: TimerKey;
  value: number;
  isDisabled: boolean;
  onUpdate: (key: TimerKey, value: number) => void;
}

const SettingRow = ({ label, timeKey, value, onUpdate, isDisabled }: Props) => {
  const maxLimit =
    timeKey === 'roundsToLongRest' ? 10 : timeKey === 'shortRestTimeSeconds' ? 600 : 60;

  // 用來設定時間的最小值不可以低於1使用
  // useEffect(() => {
  //   return () => {
  //     if (value < 1) {
  //       onUpdate(timeKey, 1);
  //     }
  //   };
  // }, [value, timeKey, onUpdate]);
  return (
    <div
      className={`flex items-center justify-between gap-1 md:gap-4 group transition-opacity ${isDisabled ? 'opacity-40' : 'opacity-100'}`}
    >
      {/* 標題 */}
      <div className="text-[12px] sm:text-sm font-medium text-slate-400 w-18 group-hover:text-slate-300 transition-colors shrink-0">
        {label}
      </div>

      {/* 控制區 */}
      <div className="flex flex-1 items-center gap-1.5 sm:gap-3">
        {/* 減號 */}
        <ActionIconButton
          className="p-1 text-slate-500 hover:text-[#ffb347] transition-colors"
          onClick={() => onUpdate(timeKey, value - 1)}
          disabled={isDisabled}
        >
          <CircleMinus size={16} />
        </ActionIconButton>

        {/* 範圍拉桿 */}
        <input
          type="range"
          className={`flex-1 max-w-25 sm:max-w-50 h-1.5 bg-white/10 rounded-lg appearance-none accent-[#ffb347] 
          ${!isDisabled ? 'cursor-pointer ' : 'cursor-not-allowed'}`}
          min={1}
          max={maxLimit}
          value={value}
          onChange={(e) => onUpdate(timeKey, Number(e.target.value))}
          disabled={isDisabled}
        />

        {/* 加號 */}
        <ActionIconButton
          className="p-1 text-slate-500 hover:text-[#ffb347] transition-colors"
          onClick={() => onUpdate(timeKey, value + 1)}
          disabled={isDisabled}
        >
          <CirclePlus size={16} />
        </ActionIconButton>

        {/* 數字輸入框 */}
        <input
          min={1}
          max={maxLimit}
          className={`w-10 sm:w-12 bg-black/30 border border-white/10 rounded-lg text-center text-slate-200 text-xs sm:text-sm py-1 focus:outline-none focus:border-[#ffb347]/50 [&::-webkit-inner-spin-button]:appearance-none
            ${!isDisabled ? '' : 'cursor-not-allowed'}`}
          type="number"
          value={value === 0 ? '' : value}
          onChange={(e) => {
            const stringValue = e.target.value;
            if (stringValue === '') {
              onUpdate(timeKey, 0);
              return;
            }
            let newValue = parseInt(stringValue, 10);
            if (isNaN(newValue)) return;

            if (newValue > maxLimit) {
              newValue = maxLimit;
            }
            if (newValue < 1) {
              newValue = 1;
            }
            onUpdate(timeKey, newValue);
          }}
          onBlur={() => {
            if (value < 1) {
              onUpdate(timeKey, 1);
            }
          }}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export interface TimerConfigPanelUIProps {
  timerCombo: TimerComboType;
  timerDurationConfigs: {
    workTimeMinutes: number;
    shortRestTimeSeconds: number;
    longRestTimeMinutes: number;
    roundsToLongRest: number;
  };
  isReplay: boolean;
  onApplyCombo: (combo: TimerComboType) => void;
  onUpdateDuration: (key: TimerKey, value: number) => void;
  onToggleReplay: (isReplay: boolean) => void;
}

export const TimerConfigPanelUI = ({
  timerCombo,
  timerDurationConfigs,
  isReplay,
  onApplyCombo,
  onUpdateDuration,
  onToggleReplay,
}: TimerConfigPanelUIProps) => {
  const isInputsLocked = timerCombo !== 'CustomCombo';

  const getModeBtnClass = (modeKey: TimerComboType) => {
    const isSelected = timerCombo === modeKey;
    return `flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
      isSelected
        ? 'bg-[#ffb347]/15 text-[#ffb347] border border-[#ffb347]/30 shadow-[0_0_10px_rgba(255,179,71,0.15)]'
        : 'bg-transparent text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-200'
    }`;
  };

  return (
    <div className="bg-[#0a0e17]/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-50 rounded-3xl p-6 w-full max-w-105 flex flex-col gap-6">
      {/* 模式選擇按鈕 */}
      <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
        <button className={getModeBtnClass('iCares')} onClick={() => onApplyCombo('iCares')}>
          iCares
        </button>
        <button className={getModeBtnClass('Immersion')} onClick={() => onApplyCombo('Immersion')}>
          沉浸專注
        </button>
        <button
          className={getModeBtnClass('TomatoClock')}
          onClick={() => onApplyCombo('TomatoClock')}
        >
          番茄鐘
        </button>
        <button
          className={getModeBtnClass('CustomCombo')}
          onClick={() => onApplyCombo('CustomCombo')}
        >
          自訂模式
        </button>
      </div>

      {/* 時間設定拉桿 */}
      <div className="flex flex-col gap-4">
        <SettingRow
          label="專注時間 (分)"
          timeKey="workTimeMinutes"
          value={timerDurationConfigs.workTimeMinutes ?? 20}
          onUpdate={onUpdateDuration}
          isDisabled={isInputsLocked}
        />
        <SettingRow
          label="短休息 (秒)"
          timeKey="shortRestTimeSeconds"
          value={timerDurationConfigs.shortRestTimeSeconds ?? 20}
          onUpdate={onUpdateDuration}
          isDisabled={isInputsLocked}
        />
        <SettingRow
          label="長休息 (分)"
          timeKey="longRestTimeMinutes"
          value={timerDurationConfigs.longRestTimeMinutes ?? 20}
          onUpdate={onUpdateDuration}
          isDisabled={isInputsLocked}
        />
        <SettingRow
          label="循環次數 (回)"
          timeKey="roundsToLongRest"
          value={timerDurationConfigs.roundsToLongRest ?? 5}
          onUpdate={onUpdateDuration}
          isDisabled={isInputsLocked}
        />
      </div>

      {/* 神經重放模式切換 */}
      <div
        className={`flex items-center justify-between pt-4 border-t border-white/5 transition-opacity ${isInputsLocked ? 'opacity-40' : 'opacity-100'}`}
      >
        <div className="text-sm font-medium text-slate-400 w-32">神經重放模式</div>
        <div className="flex flex-1 items-center gap-6">
          <ActionIconButton
            disabled={isInputsLocked}
            onClick={() => onToggleReplay(true)}
            className={`flex items-center gap-2 text-sm transition-colors ${isReplay ? 'text-[#ffb347]' : 'text-slate-500 hover:text-slate-300'} ${!isInputsLocked ? 'cursor-pointer ' : 'cursor-not-allowed'}`}
          >
            {isReplay ? <SquareCheck size={18} /> : <Square size={18} />} <span>開啟</span>
          </ActionIconButton>
          <ActionIconButton
            disabled={isInputsLocked}
            onClick={() => onToggleReplay(false)}
            className={`flex items-center gap-2 text-sm transition-colors ${!isReplay ? 'text-slate-200' : 'text-slate-500 hover:text-slate-300'} ${!isInputsLocked ? 'cursor-pointer ' : 'cursor-not-allowed'}`}
          >
            {!isReplay ? <SquareCheck size={18} /> : <Square size={18} />} <span>關閉</span>
          </ActionIconButton>
        </div>
      </div>
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
    setIsReplay,
    isReplay,
    applyComboSettings,
  } = useTimerContext();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsTimerConfigOpen(false);
        localStorage.setItem('icares_last_mode', timerCombo);
        if (timerCombo === 'CustomCombo') {
          localStorage.setItem('icares_custom_config', JSON.stringify(timerDurationConfigs));
          localStorage.setItem('icares_custom_replay', JSON.stringify(isReplay));
        }
      }
    };

    if (isTimerConfigOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimerConfigOpen, timerCombo, timerDurationConfigs, isReplay, setIsTimerConfigOpen]);

  if (!isTimerConfigOpen) return null;

  const handleUpdateDuration = (key: TimerKey, newValue: number) => {
    setTimerDurationConfigs((prev) => ({ ...prev, [key]: newValue }));
  };

  return (
    <div
      ref={panelRef}
      className="absolute -bottom-70 sm:-bottom-80 right-0 mb-4 z-50 w-[90vw] max-w-105 "
    >
      <TimerConfigPanelUI
        timerCombo={timerCombo}
        timerDurationConfigs={timerDurationConfigs}
        isReplay={isReplay}
        onApplyCombo={applyComboSettings}
        onUpdateDuration={handleUpdateDuration}
        onToggleReplay={setIsReplay}
      />
    </div>
  );
}
