import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { DbTodo, Todo } from '@/src/types/todo';
import { useFocusContext } from '@/src/contexts/FocusContext';
// drag and drop
import {
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useProfileContext } from '../contexts/ProfileContext';

const todoMapper = {
  toFrontend: (dbTodo: DbTodo): Todo => ({
    id: dbTodo.id,
    userId: dbTodo.user_id,
    taskName: dbTodo.task_name,
    iconName: dbTodo.icon_name,
    iconColor: dbTodo.icon_color,
    isCompleted: dbTodo.is_completed,
    completedAt: dbTodo.completed_at,
  }),
  toDatabase: (todo: Partial<Todo>) => ({
    user_id: todo.userId,
    task_name: todo.taskName,
    icon_name: todo.iconName,
    icon_color: todo.iconColor,
    is_completed: todo.isCompleted,
    completed_at: todo.completedAt,
  }),
};
export function useTodoList() {
  // 用來裝 TodoItem 的 useState , Todo[] 代表 只能裝Todo的陣列 預設是空陣列 ([])
  const [todos, setTodos] = useState<Todo[]>([]);
  // 用來判斷是否已經更新頁面 (舊的todo-list)
  const [isMounted, setIsMounted] = useState(false);
  // 用來看 是哪一個 id 被抓了 (被選取了) 預設是 字串格式的null
  const [activeId, setActiveId] = useState<string | null>(null);
  // 把 Hook 從Context中 拿出來
  const { setActiveTask } = useFocusContext();
  const { user } = useProfileContext();

  // 初始化 和 資料讀取
  useEffect(() => {
    const fetchTodos = async () => {
      // 目前登入的使用者

      if (!user) return;

      // toISOString = 把時間轉成 ISO 標準格式 會輸入 "2026-03-14T08:00:00.000Z"
      // split ('T')[0] 會把他從 T 分開 拿前面的 2026-03-14
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        // gte 是 Greater Than or Equal (大於等於)
        .or(`is_completed.eq.false,completed_at.gte.${today}T00:00:00Z`)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase 新增失敗：', error.message, error.details);
      }

      if (!error && data) {
        // 利用 map 將每一筆資料經過轉換器後變成正確的格式
        const formattedTodos = data.map(todoMapper.toFrontend);
        setTodos(formattedTodos);
      }
      setIsMounted(true);
    };
    fetchTodos();
  }, [user]);

  // 衍生的狀態
  // 把TodoItem 分成 已完成 和 未完成
  const activeItems = todos.filter((todo) => !todo.isCompleted);
  const completedItems = todos.filter((todo) => todo.isCompleted);
  // 找到目前 被抓到的 Todo 的完整資料
  const activeTodo = todos.find((t) => t.id === activeId);

  // 先把第一筆任務單獨拉出來
  const firstActiveTask = activeItems[0];

  useEffect(() => {
    if (firstActiveTask) {
      setActiveTask(
        firstActiveTask.iconName || 'TreePine',
        firstActiveTask.iconColor || 'text-emerald-500',
        firstActiveTask.taskName,
        firstActiveTask.id,
      );
    } else {
      setActiveTask('TreePine', 'text-emerald-500', '一般專注', '');
    }
  }, [
    // 只要第一筆任務的狀態 改變 就更新
    firstActiveTask?.id,
    firstActiveTask?.taskName,
    firstActiveTask?.iconColor,
    firstActiveTask?.iconName,
    firstActiveTask,
    setActiveTask,
  ]);

  // CRUD 邏輯
  // 用來 Add todo
  const handleAddTodo = async (
    taskName: string,
    incomingIconName: string,
    incomingIconColor: string,
  ) => {
    if (!user) return;

    const newTodoDraft: Partial<Todo> = {
      userId: user.id,
      taskName: taskName,
      iconName: incomingIconName || 'TreePine',
      iconColor: incomingIconColor || 'text-emerald-500',
      isCompleted: false,
    };
    // 透過 Mapper 轉換成資料庫格式
    const dbData = todoMapper.toDatabase(newTodoDraft);

    // single = supabase 原本回傳的是陣列[{id:1 , ...}] 會變成物件 {id:1 , ...}
    const { data, error } = await supabase.from('todos').insert([dbData]).select().single();
    if (!error && data) {
      // 透過 Mapper 轉換成前端格式
      const formattedNewTodo = todoMapper.toFrontend(data);
      setTodos([formattedNewTodo, ...todos]); // 完成後更新畫面
    }
  };

  // 完成Todo
  const handleToggleTodo = async (id: string) => {
    const targetTodo = todos.find((t) => t.id === id);
    if (!targetTodo) return;
    const nextStatus = !targetTodo.isCompleted;
    const nextCompletedAt = nextStatus ? new Date().toISOString() : null;

    const dbUpdateData = todoMapper.toDatabase({
      isCompleted: nextStatus,
      completedAt: nextCompletedAt,
    });

    const { error } = await supabase
      .from('todos')
      .update(dbUpdateData)
      // eq = Equal (等於)
      .eq('id', id);
    // 防禦性編程 , 先寫 if (!error) 如果沒有問題 再繼續下一步
    if (!error) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, isCompleted: nextStatus, completedAt: nextCompletedAt }
            : todo,
        ),
      );
    }
  };

  // 刪除Todo
  const handleDeleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  // 更新Todo
  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    const dbUpdateData = todoMapper.toDatabase(updates);

    const { error } = await supabase.from('todos').update(dbUpdateData).eq('id', id);

    if (!error) {
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)));
    } else {
      console.error('資料更新失敗', error.message);
    }
  };

  // 拖曳邏輯
  // 定義感應器 需要移到 >5 才會算是被拖曳
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  // start = 抓取開始
  const handleDragStart = (event: DragStartEvent) => {
    // 用 as string 告訴系統拿到的資料一定會是 字串 (就不會報錯了)
    setActiveId(event.active.id as string);
  };
  // over = 抓取結束
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const isOverABasket = over.id === 'activeBasket' || over.id === 'completedBasket';
    if (isOverABasket) {
      const activeIndex = todos.findIndex((t) => t.id === active.id);
      const newStatus = over.id === 'completedBasket';
      if (todos[activeIndex].isCompleted !== newStatus) {
        setTodos((prev) => {
          const newOrder = [...prev];
          newOrder[activeIndex] = { ...newOrder[activeIndex], isCompleted: newStatus };
          return newOrder;
        });
      }
      return;
    }

    const activeIndex = todos.findIndex((t) => t.id === active.id);
    const overIndex = todos.findIndex((t) => t.id === over.id);

    if (todos[activeIndex].isCompleted !== todos[overIndex].isCompleted) {
      setTodos((prev) => {
        const newOrder = [...prev];
        newOrder[activeIndex] = {
          ...newOrder[activeIndex],
          isCompleted: prev[overIndex].isCompleted,
        };
        return newOrder;
      });
    }
  };
  // end = 抓取結束
  // handleDragEnd 用來寫 drag and drop 的箭頭函式
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // 只有當位置真的改變時才執行
    if (active.id !== over.id) {
      setTodos((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);

        // 如果 newIndex 是 -1，代表 over.id 是籃子
        if (newIndex === -1) {
          const item = prev[oldIndex];
          const newStatus = over.id === 'completedBasket';

          // 先把舊的刪掉，再把改好狀態的塞到最後面
          const filtered = prev.filter((t) => t.id !== active.id);
          return [...filtered, { ...item, isCompleted: newStatus }];
        }

        // 如果是在有鄰居的地方換位置
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        return newOrder;
      });
    }

    // 清除影子
    setActiveId(null);
  };
  return {
    isMounted,
    activeItems,
    completedItems,
    activeId,
    activeTodo,
    sensors,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleUpdateTodo,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
