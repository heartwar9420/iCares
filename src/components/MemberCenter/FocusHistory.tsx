'use client';

import { useFocusContext } from '@/src/contexts/FocusContext';
import { useEffect, useMemo } from 'react';
import ActionIconButton from '../UI/ActionIconButton';
import { Trash2 } from 'lucide-react';

export default function FocusHistory() {
  const { groupedHistory, fetchFocusHistory, isLoadingHistory, deleteFocusRecord } =
    useFocusContext();

  // 1. 初次載入時抓取資料
  useEffect(() => {
    fetchFocusHistory();
  }, [fetchFocusHistory]);

  // 2. 計算頂部數據 (使用 useMemo 優化效能)
  const stats = useMemo(() => {
    let todaySeconds = 0;
    let totalSeconds = 0;

    // 遍歷所有分組計算總秒數
    Object.entries(groupedHistory).forEach(([label, records]) => {
      records.forEach((r) => {
        totalSeconds += r.duration_seconds;
        if (label === '今天') {
          todaySeconds += r.duration_seconds;
        }
      });
    });

    // 轉換格式： 125 -> "2h 5m"
    const format = (s: number) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return {
      today: format(todaySeconds),
      total: format(totalSeconds),
    };
  }, [groupedHistory]);

  // 3. 輔助函式：格式化時間範圍 (如 10:00 - 10:25)
  const formatTimeRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString([], options)}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* --- 數據總覽 --- */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1e2433] rounded-2xl p-8 border border-slate-700/50 flex flex-col items-center justify-center">
          <div className=" text-slate-400 font-medium tracking-wider mb-2 uppercase">
            今日專注 (Today&apos;s Focus)
          </div>
          <div className="text-4xl font-bold text-orange-400">{stats.today}</div>
        </div>

        <div className="bg-[#1e2433] rounded-2xl p-8 border border-slate-700/50 flex flex-col items-center justify-center">
          <div className=" text-slate-400 font-medium tracking-wider mb-2 uppercase">
            累積專注 (Total Focus)
          </div>
          <div className="text-4xl font-bold text-orange-400">{stats.total}</div>
        </div>
      </div>

      {/* --- 專注紀錄 --- */}
      <div className="bg-[#1e2433] rounded-2xl p-8 border border-slate-700/50 min-h-75">
        <h3 className="text-3xl font-bold text-slate-200 mb-2">專注紀錄</h3>

        {isLoadingHistory ? (
          <div className="flex justify-center items-center py-20 text-slate-500 text-2xl">
            讀取紀錄中...
          </div>
        ) : Object.keys(groupedHistory).length === 0 ? (
          <div className="flex justify-center items-center py-20 text-slate-500 text-2xl">
            尚無專注紀錄，先開始專注吧！
          </div>
        ) : (
          <div className="flex flex-col">
            {/* 動態渲染分組 */}
            {Object.entries(groupedHistory).map(([dateLabel, records]) => (
              <div key={dateLabel}>
                {/* 日期分隔線 */}
                <div className="flex items-center my-6">
                  <div className="grow border-t border-slate-700/30"></div>
                  <span className="mx-4 font-medium text-slate-500">{dateLabel}</span>
                  <div className="grow border-t border-slate-700/30"></div>
                </div>

                {/* 紀錄項目清單 */}
                <div className="flex flex-col gap-2">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-3 group hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-200 text-base">
                          {/* 如果之後有 todo 名稱就顯示，沒有就顯示預設 */}
                          {record.todos?.task_name || '一般專注'}
                        </span>
                        <span className="text-sm text-slate-500 font-mono">
                          {formatTimeRange(record.start_time, record.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-orange-400 font-medium">
                          {Math.floor(record.duration_seconds / 60)} min
                        </span>
                        <ActionIconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFocusRecord(record.id);
                          }}
                          className="text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-4"
                        >
                          <Trash2 size={20} />
                        </ActionIconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
