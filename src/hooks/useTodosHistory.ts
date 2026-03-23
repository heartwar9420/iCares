import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Todo } from '@/src/types/todo';
import { useProfileContext } from '../contexts/ProfileContext';

// 假設你的 todoMapper 已經放在某個共用檔案，或是你可以直接寫在這裡
// 為了簡化，這裡我先直接用 db 的格式轉換

interface GroupedTodos {
  [dateLabel: string]: Todo[];
}

export function useTodosHistory() {
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useProfileContext();

  const fetchCompletedTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true) // ⭐️ 關鍵：只抓已完成的
        .order('completed_at', { ascending: false }); // 依照完成時間新到舊排序

      if (error) throw error;

      if (data) {
        // 轉換成前端格式
        const formatted = data.map((dbTodo) => ({
          id: dbTodo.id,
          userId: dbTodo.user_id,
          taskName: dbTodo.task_name,
          iconName: dbTodo.icon_name,
          iconColor: dbTodo.icon_color,
          isCompleted: dbTodo.is_completed,
          completedAt: dbTodo.completed_at,
        }));
        setCompletedTodos(formatted);
      }
    } catch (error) {
      console.error('讀取已完成任務失敗', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 刪除功能
  const deleteCompletedTodo = async (id: string) => {
    if (!window.confirm('確定要刪除此紀錄嗎？')) return;
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (!error) {
        setCompletedTodos((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('刪除失敗', error);
    }
  };

  // 資料分組與統計 (使用 useMemo 避免無謂計算)
  const { groupedTodos, todayCount, totalCount } = useMemo(() => {
    const groups: GroupedTodos = {};
    let today = 0;

    const todayStr = new Date().toLocaleDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString();

    completedTodos.forEach((todo) => {
      // 確保有 completedAt，否則用 createdAt 當作備用
      const dateStr = new Date(todo.completedAt || new Date()).toLocaleDateString();

      let label = dateStr;
      if (dateStr === todayStr) {
        label = '今日';
        today++;
      } else if (dateStr === yesterdayStr) {
        label = '昨天';
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(todo);
    });

    return {
      groupedTodos: groups,
      todayCount: today,
      totalCount: completedTodos.length,
    };
  }, [completedTodos]);

  return {
    isLoading,
    fetchCompletedTodos,
    deleteCompletedTodo,
    groupedTodos,
    todayCount,
    totalCount,
  };
}
