'use client';

import { useEffect } from 'react';
import { Check, CircleCheck, Trash2 } from 'lucide-react';

import ActionIconButton from '../UI/ActionIconButton';
import { useTodosHistoryContext } from '@/src/contexts/TodosHistoryContext';

export default function TodosHistory() {
  const {
    isLoading,
    fetchCompletedTodos,
    deleteCompletedTodo,
    groupedTodos,
    todayCount,
    totalCount,
  } = useTodosHistoryContext();

  // 初次載入抓取資料
  useEffect(() => {
    fetchCompletedTodos();
  }, [fetchCompletedTodos]);

  // 格式化時間
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (isLoading) {
    return <div className="text-center py-10 text-slate-500">載入中...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* --- 累積完成 --- */}
      <div className="bg-[#1e2433] rounded-2xl p-6 px-8 border border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0">
            <Check className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-xl  text-slate-100 flex items-center gap-2">
              今日已完成 {todayCount} 項任務！
            </h3>
          </div>
        </div>

        <div className="text-right">
          <div className=" text-slate-400 mb-1">歷史累積完成</div>
          <div className="text-slate-100 font-medium">
            <span className="text-3xl  font-extrabold font-mono">{totalCount} </span>
            <span className=" text-slate-400 ml-1">項</span>
          </div>
        </div>
      </div>

      {/* --- 歷史完成 --- */}
      <div className="bg-[#1e2433] rounded-2xl p-8 border border-slate-700/50">
        <div className="flex flex-col">
          {Object.entries(groupedTodos).map(([dateLabel, todos]) => (
            <div key={dateLabel}>
              {/* 日期分隔線 */}
              <div className="flex items-center my-6 mt-8">
                <div className="grow border-t border-slate-700/50"></div>
                <span className="mx-4 text-xs font-medium text-slate-500 tracking-wider">
                  {dateLabel}
                </span>
                <div className="grow border-t border-slate-700/50"></div>
              </div>

              {/* 日期的清單 */}
              <div className="flex flex-col gap-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="group flex items-center justify-between py-3 px-2 hover:bg-slate-800/30 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CircleCheck className="text-orange-500" />

                      <span className="text-slate-400 line-through">{todo.taskName}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500 font-mono">
                        {formatTime(todo.completedAt ?? undefined)}
                      </span>
                      {/* 刪除按鈕 */}
                      <ActionIconButton
                        onClick={() => deleteCompletedTodo(todo.id)}
                        className="text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                      >
                        <Trash2 size={18} />
                      </ActionIconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {totalCount === 0 && (
            <div className="text-center text-2xl py-10 text-slate-500">
              尚無完成紀錄，繼續加油！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
