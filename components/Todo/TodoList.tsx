import { useEffect, useState } from 'react';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';

// drag and drop
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { useFocus } from '@/Context/FocusContext';

interface Todo {
  id: string;
  title: string;
  icon_name: string;
  color: string;
  isFinished: boolean;
}

// 用來判斷抓取到的位置在哪的函式
function DroppableBasket({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-1 w-full flex flex-col shrink-0">
      {children}
    </div>
  );
}

export default function TodoList() {
  // 用來裝 TodoItem 的 useState , Todo[] 代表 只能裝Todo的陣列 預設是空陣列 ([])
  const [todos, setTodos] = useState<Todo[]>([]);
  // 用來判斷是否已經更新頁面 (舊的todo-list)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('TODO_STORAGE_KEY');
    const initialTodos = saved ? JSON.parse(saved) : [];
    // 使用timeout 確保是在完成後才發生的同步更新
    setTimeout(() => {
      setTodos(initialTodos);
      setIsMounted(true);
    }, 0);
  }, []);
  // 用來 Add todo 的箭頭函式
  const handleAddTodo = (
    title: string,
    incoming_icon_name: string,
    incoming_color_class: string,
  ) => {
    const newTodo = {
      id: crypto.randomUUID(), // 生成隨機的ID
      title: title,
      icon_name: incoming_icon_name || 'TreePine', // 用 || 來預設值
      color: incoming_color_class || 'bg-green-500',
      isFinished: false,
    };
    setTodos([newTodo, ...todos]);
  };
  // 刪除Todo
  const handleDeleteTodo = (id: string) => {
    const newTodo = todos.filter((todo) => {
      if (todo.id !== id) {
        return true;
      }
    });
    setTodos(newTodo);
  };
  // 完成Todo
  const handleToggleTodo = (id: string) => {
    const newTodo = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isFinished: !todo.isFinished };
      }
      return todo;
    });
    setTodos(newTodo);
  };
  // 當todos 更新 把他存進 localStorage中
  useEffect(() => {
    localStorage.setItem('TODO_STORAGE_KEY', JSON.stringify(todos));
  }, [todos]);

  // 更新Todo
  const handleUpdateTodo = (
    id: string,
    updates: { title?: string; icon_name?: string; color?: string },
  ) => {
    const updateTodos = todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo, // 先展開舊的
          ...updates, // 再展開新的 (會取代舊的)
          title: updates.title ?? todo.title,
          icon_name: updates.icon_name ?? todo.icon_name,
          color: updates.color ?? todo.color,
        };
      } else return todo; // map 是建立一個新的陣列，所以要回傳舊的陣列 (id不相同的陣列) 到新的陣列中
    });
    setTodos(updateTodos); //更新資料
  };
  // 把TodoItem 分成 已完成 和 未完成
  const activeItems = todos.filter((todo) => !todo.isFinished);
  const completedItems = todos.filter((todo) => todo.isFinished);

  // 把 Hook 拿出來
  const { setActiveTask } = useFocus();

  // 偵測器
  useEffect(() => {
    // 如果activeItem > 0  (有未完成事項)
    if (activeItems.length > 0) {
      // 把第一個設為 firstTask
      const firstTask = activeItems[0];
      // 把 firstTask 的 icon 和 color 存起來
      setActiveTask(firstTask.icon_name, firstTask.color);
    } else {
      // 如果沒東西 就用預設的項目
      setActiveTask('TreePine', 'text-emerald-500');
    }
  }, [todos, activeItems, setActiveTask]);

  // 定義感應器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  // 用來看 是哪一個 id 被抓了 (被選取了) 預設是 字串格式的null
  const [activeId, setActiveId] = useState<string | null>(null);
  // 找到目前 被抓到的 Todo 的完整資料
  const activeTodo = todos.find((t) => t.id === activeId);
  // start = 抓取開始
  const handleDragStart = (event: DragStartEvent) => {
    // 用 as string 告訴系統拿到的資料一定會是 字串 (就不會報錯了)
    setActiveId(event.active.id as string);
  };
  // over = 抓取中間
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const isOverABasket = over.id === 'activeBasket' || over.id === 'completedBasket';
    if (isOverABasket) {
      const activeIndex = todos.findIndex((t) => t.id === active.id);
      const newStatus = over.id === 'completedBasket';
      if (todos[activeIndex].isFinished !== newStatus) {
        setTodos((prev) => {
          const newOrder = [...prev];
          newOrder[activeIndex] = { ...newOrder[activeIndex], isFinished: newStatus };
          return newOrder;
        });
      }
      return;
    }

    const activeIndex = todos.findIndex((t) => t.id === active.id);
    const overIndex = todos.findIndex((t) => t.id === over.id);

    if (todos[activeIndex].isFinished !== todos[overIndex].isFinished) {
      setTodos((prev) => {
        const newOrder = [...prev];
        newOrder[activeIndex] = {
          ...newOrder[activeIndex],
          isFinished: prev[overIndex].isFinished,
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

        // --- 這裡是新增的防呆區塊 ---
        // 如果 newIndex 是 -1，代表 over.id 是籃子（例如 "completedBasket"）
        if (newIndex === -1) {
          const item = prev[oldIndex];
          const newStatus = over.id === 'completedBasket';

          // 先把舊的刪掉，再把改好狀態的塞到最後面
          const filtered = prev.filter((t) => t.id !== active.id);
          return [...filtered, { ...item, isFinished: newStatus }];
        }
        // --------------------------

        // 這是原本的邏輯：如果是在有鄰居的地方換位置
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        newOrder[newIndex] = {
          ...newOrder[newIndex],
          isFinished: prev[newIndex].isFinished,
        };
        return newOrder;
      });
    }

    // 記得清除影子
    setActiveId(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <DragOverlay>
        {activeId && activeTodo ? (
          <div className="opacity-90 scale-105 rotate-2 shadow-2xl transition-transform">
            <TodoItem
              id={activeTodo.id}
              isFinished={activeTodo.isFinished}
              TodoItemTitle={activeTodo.title}
              TodoItemColor={activeTodo.color}
              TodoItemIcon={activeTodo.icon_name}
              // 由於不需要互動，所以傳入空函式
              onUpdateTodo={() => {}}
              onDeleteTodo={() => {}}
              onToggleTodo={() => {}}
              className={activeTodo.isFinished ? 'bg-gray-600' : ''}
            />
          </div>
        ) : null}
      </DragOverlay>
      <div className="relative bg-teal-100/80 mt-5 mx-10 px-10 flex flex-col justify-center items-center h-fit rounded-2xl z-10 ">
        <TodoInput onAddTodo={handleAddTodo} />
        {isMounted && (
          <div className=" flex flex-col gap-3 overflow-y-auto overflow-x-hidden max-h-[30vh] flex-1 w-full pb-2 ">
            <DroppableBasket id="activeBasket">
              <SortableContext items={activeItems}>
                {activeItems.map((todo) => (
                  <TodoItem
                    onUpdateTodo={handleUpdateTodo}
                    key={todo.id}
                    TodoItemTitle={todo.title}
                    TodoItemColor={todo.color}
                    TodoItemIcon={todo.icon_name}
                    onDeleteTodo={handleDeleteTodo}
                    id={todo.id}
                    onToggleTodo={handleToggleTodo}
                    isFinished={todo.isFinished}
                  />
                ))}
              </SortableContext>
            </DroppableBasket>
            <div className="shrink-0 h-px bg-black my-1 w-full" />
            <DroppableBasket id="completedBasket">
              <SortableContext items={completedItems}>
                {completedItems.map((todo) => (
                  <TodoItem
                    className="bg-gray-600"
                    onUpdateTodo={handleUpdateTodo}
                    key={todo.id}
                    TodoItemTitle={todo.title}
                    TodoItemColor={todo.color}
                    TodoItemIcon={todo.icon_name}
                    onDeleteTodo={handleDeleteTodo}
                    id={todo.id}
                    onToggleTodo={handleToggleTodo}
                    isFinished={todo.isFinished}
                  />
                ))}
              </SortableContext>
            </DroppableBasket>
          </div>
        )}
      </div>
    </DndContext>
  );
}
