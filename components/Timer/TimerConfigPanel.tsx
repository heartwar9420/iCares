import { useTimerContext } from '@/Context/TimerContext';
import ActionIconButton from '../UI/ActionIconButton';
import { CircleMinus, CirclePlus, Square, SquareCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

// ==========================================
// 1. 單行設定組件 (SettingRow) 質感升級
// ==========================================
type TimerKey =
  | 'work_time_minutes'
  | 'short_rest_time_seconds'
  | 'long_rest_time_minutes'
  | 'rounds_to_long_rest';

interface Props {
  label: string;
  timeKey: TimerKey; // 這裡也可以直接套用
  value: number;
  isDisabled: boolean;
  // 👇 把原本的 any 換成 TimerKey
  onUpdate: (key: TimerKey, value: number) => void;
}

const SettingRow = ({ label, timeKey, value, onUpdate, isDisabled }: Props) => {
  const maxLimit =
    timeKey === 'rounds_to_long_rest' ? 5 : timeKey === 'short_rest_time_seconds' ? 600 : 60;
  return (
    <div
      className={`flex items-center justify-between gap-4 group transition-opacity ${isDisabled ? 'opacity-40' : 'opacity-100'}`}
    >
      {/* 標題 */}
      <div className="text-sm font-medium text-slate-400 w-32 group-hover:text-slate-300 transition-colors">
        {label}
      </div>

      {/* 控制區 */}
      <div className="flex flex-1 items-center gap-3">
        {/* 減號 */}
        <ActionIconButton
          className="p-1 text-slate-500 hover:text-[#ffb347] transition-colors"
          onClick={() => onUpdate(timeKey, value - 1)}
          disabled={isDisabled}
        >
          <CircleMinus size={18} />
        </ActionIconButton>

        {/* 範圍拉桿 (使用 accent 改變原生的顏色) */}
        <input
          type="range"
          className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ffb347]"
          min={'1'}
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
          <CirclePlus size={18} />
        </ActionIconButton>

        {/* 數字輸入框 (深色背景、無上下箭頭) */}
        <input
          min={1}
          max={maxLimit}
          className="w-12 bg-black/30 border border-white/10 rounded-lg text-center text-slate-200 text-sm py-1 focus:outline-none focus:border-[#ffb347]/50 [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          value={value === 0 ? '' : value}
          onChange={(e) => {
            if (e.target.value === '') {
              onUpdate(timeKey, 0);
              return;
            }
            let newValue = Number(e.target.value);
            if (newValue > maxLimit) {
              newValue = maxLimit;
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

// ==========================================
// 2. 主設定面板 (TimerConfigPanel) 質感升級
// ==========================================
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
  } = useTimerContext();

  const isInputsLocked = timerCombo !== 'CustomCombo';
  const panelRef = useRef<HTMLDivElement>(null);

  // 點擊外面關閉面板
  // 點擊外面關閉面板並自動存檔
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 如果點擊的目標不在 panel 裡面
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsTimerConfigOpen(false); // 1. 關閉面板

        // 2. 🔥 面板關閉的瞬間，把當下的狀態無縫存入 localStorage
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

  const updateTime = (key: TimerKey, newValue: number) => {
    setTimerDurationConfigs((prev) => ({ ...prev, [key]: newValue }));
  };

  if (!isTimerConfigOpen) return null;

  const selectedCombo = (key: 'iCares' | 'Immersion' | 'TomatoClock' | 'CustomCombo') => {
    setTimerCombo(key);

    // 先準備好要切換的設定參數
    let newConfig = {
      work_time_minutes: 20,
      short_rest_time_seconds: 20,
      long_rest_time_minutes: 20,
      rounds_to_long_rest: 5,
    };
    let newReplay = false;

    if (key === 'iCares') {
      newConfig = {
        work_time_minutes: 20,
        short_rest_time_seconds: 20,
        long_rest_time_minutes: 20,
        rounds_to_long_rest: 5,
      };
      newReplay = true;
    } else if (key === 'Immersion') {
      newConfig = {
        work_time_minutes: 0.1,
        short_rest_time_seconds: 3,
        long_rest_time_minutes: 0.1,
        rounds_to_long_rest: 2,
      };
      newReplay = false;
    } else if (key === 'TomatoClock') {
      newConfig = {
        work_time_minutes: 20,
        short_rest_time_seconds: 300,
        long_rest_time_minutes: 30,
        rounds_to_long_rest: 4,
      };
      newReplay = false;
    } else if (key === 'CustomCombo') {
      const savedConfig = localStorage.getItem('icares_custom_config');
      const savedReplay = localStorage.getItem('icares_custom_replay');
      if (savedConfig) {
        newConfig = JSON.parse(savedConfig); // 有紀錄就用紀錄
      } else {
        newConfig = {
          work_time_minutes: 20,
          short_rest_time_seconds: 20,
          long_rest_time_minutes: 20,
          rounds_to_long_rest: 5,
        };
      }
      newReplay = savedReplay ? JSON.parse(savedReplay) : false;
    }

    // 1. 更新畫面當下的狀態
    setTimerDurationConfigs(newConfig);
    setIsReplay(newReplay);
  };

  // 產生上方模式按鈕的樣式邏輯
  const getModeBtnClass = (modeKey: string) => {
    const isSelected = timerCombo === modeKey;
    return `flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
      isSelected
        ? 'bg-[#ffb347]/15 text-[#ffb347] border border-[#ffb347]/30 shadow-[0_0_10px_rgba(255,179,71,0.15)]'
        : 'bg-transparent text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-200'
    }`;
  };

  return (
    <div
      ref={panelRef}
      // 毛玻璃外框設定
      className="bg-[#0a0e17]/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-50 rounded-3xl p-6 w-[420px] flex flex-col gap-6"
    >
      {/* 頂部四個模式選擇按鈕 */}
      <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
        <button
          className={getModeBtnClass('iCares')}
          onClick={() => {
            resetTimer();
            selectedCombo('iCares');
          }}
        >
          iCares
        </button>
        <button
          className={getModeBtnClass('Immersion')}
          onClick={() => {
            resetTimer();
            selectedCombo('Immersion');
          }}
        >
          沉浸專注
        </button>
        <button
          className={getModeBtnClass('TomatoClock')}
          onClick={() => {
            resetTimer();
            selectedCombo('TomatoClock');
          }}
        >
          番茄鐘
        </button>
        <button
          className={getModeBtnClass('CustomCombo')}
          onClick={() => {
            resetTimer();
            selectedCombo('CustomCombo');
          }}
        >
          自訂模式
        </button>
      </div>

      {/* 四條時間設定拉桿 */}
      <div className="flex flex-col gap-4">
        <SettingRow
          label="專注時間 (分)"
          timeKey="work_time_minutes"
          value={timerDurationConfigs.work_time_minutes}
          onUpdate={updateTime}
          isDisabled={isInputsLocked}
        />
        <SettingRow
          label="短休息 (秒)"
          timeKey="short_rest_time_seconds"
          value={timerDurationConfigs.short_rest_time_seconds}
          onUpdate={updateTime}
          isDisabled={isInputsLocked}
        />
        <SettingRow
          label="長休息 (分)"
          timeKey="long_rest_time_minutes"
          value={timerDurationConfigs.long_rest_time_minutes}
          onUpdate={updateTime}
          isDisabled={isInputsLocked}
        />
        <SettingRow
          label="循環次數 (回)"
          timeKey="rounds_to_long_rest"
          value={timerDurationConfigs.rounds_to_long_rest}
          onUpdate={updateTime}
          isDisabled={isInputsLocked}
        />
      </div>

      {/* 神經重放模式切換 */}
      <div
        className={`flex items-center justify-between gap-4 pt-4 border-t border-white/5 transition-opacity ${isInputsLocked ? 'opacity-40' : 'opacity-100'}`}
      >
        <div className="text-sm font-medium text-slate-400 w-32">神經重放模式</div>
        <div className="flex flex-1 items-center gap-6">
          <button
            disabled={isInputsLocked}
            onClick={() => setIsReplay(true)}
            className={`flex items-center gap-2 text-sm transition-colors ${isReplay ? 'text-[#ffb347]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {isReplay ? <SquareCheck size={18} /> : <Square size={18} />} <span>開啟</span>
          </button>
          <button
            disabled={isInputsLocked}
            onClick={() => setIsReplay(false)}
            className={`flex items-center gap-2 text-sm transition-colors ${!isReplay ? 'text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {!isReplay ? <SquareCheck size={18} /> : <Square size={18} />} <span>關閉</span>
          </button>
        </div>
      </div>
    </div>
  );
}
