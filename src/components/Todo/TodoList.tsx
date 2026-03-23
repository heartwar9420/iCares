import { useTodoContext } from '@/src/contexts/TodoContext';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';

import { DndContext, closestCenter, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

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
  const {
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
  } = useTodoContext();
  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden min-h-0 flex-1">
      {/* 標題 */}
      <div className="text-lg font-bold tracking-widest text-slate-500 uppercase mb-4 shrink-0">
        待辦事項
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
      >
        {/* 影子效果 */}
        <DragOverlay>
          {activeId && activeTodo ? (
            <div className="opacity-90 scale-105 rotate-2 shadow-2xl transition-transform">
              <TodoItem
                id={activeTodo.id}
                isCompleted={activeTodo.isCompleted}
                taskName={activeTodo.taskName}
                TodoItemColor={activeTodo.iconColor}
                TodoItemIcon={activeTodo.iconName}
                onUpdateTodo={() => {}}
                onDeleteTodo={() => {}}
                onToggleTodo={() => {}}
                className={
                  activeTodo.isCompleted
                    ? 'opacity-50 grayscale'
                    : 'border-[#ffb347]/50 shadow-[0_0_15px_rgba(255,179,71,0.2)]'
                }
              />
            </div>
          ) : null}
        </DragOverlay>

        <div className="shrink-0 mb-4">
          <TodoInput onAddTodo={handleAddTodo} />
        </div>

        {/* 未完成區 */}
        {isMounted && (
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-2">
            <DroppableBasket id="activeBasket">
              <SortableContext items={activeItems}>
                {activeItems.map((todo) => (
                  <TodoItem
                    onUpdateTodo={handleUpdateTodo}
                    key={todo.id}
                    taskName={todo.taskName}
                    TodoItemColor={todo.iconColor}
                    TodoItemIcon={todo.iconName}
                    onDeleteTodo={handleDeleteTodo}
                    id={todo.id}
                    onToggleTodo={handleToggleTodo}
                    isCompleted={todo.isCompleted}
                  />
                ))}
              </SortableContext>
            </DroppableBasket>

            {/* 完成與未完成的分界線 */}
            {completedItems.length > 0 && (
              <div className="shrink-0 flex items-center gap-4 my-4 opacity-50">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                  已完成
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            )}

            {/* 已完成區 */}
            <DroppableBasket id="completedBasket">
              <SortableContext items={completedItems}>
                {completedItems.map((todo) => (
                  <TodoItem
                    className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                    onUpdateTodo={handleUpdateTodo}
                    key={todo.id}
                    taskName={todo.taskName}
                    TodoItemColor={todo.iconColor}
                    TodoItemIcon={todo.iconName}
                    onDeleteTodo={handleDeleteTodo}
                    id={todo.id}
                    onToggleTodo={handleToggleTodo}
                    isCompleted={todo.isCompleted}
                  />
                ))}
              </SortableContext>
            </DroppableBasket>
          </div>
        )}
      </DndContext>
    </div>
  );
}
