import { Check, Pencil, Square, SquareCheck, Trash2, TreePine, X } from 'lucide-react';
import { iconOptions } from './iconConstants';
import { useEffect, useRef, useState } from 'react';
import PalettePanel from './PalettePanel';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ActionIconButton from '../UI/ActionIconButton';
import { Todo } from '@/src/types/todo';

interface Props {
  id: string;
  taskName: string;
  isCompleted: boolean;
  TodoItemColor: string;
  TodoItemIcon: string;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  className?: string;
}

export default function TodoItem({
  taskName,
  onDeleteTodo,
  id,
  onToggleTodo,
  isCompleted,
  TodoItemColor,
  TodoItemIcon,
  onUpdateTodo,
  className,
}: Props) {
  const matchedIconConfig = iconOptions.find((item) => item.name === TodoItemIcon);
  const TodoIcon = matchedIconConfig ? matchedIconConfig.icon : TreePine;

  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [editTaskNameBuffer, setEditTaskNameBuffer] = useState(taskName);
  const [isOpenPalettePanel, setIsOpenPalettePanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditModeActive && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditModeActive]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpenPalettePanel && itemRef.current && !itemRef.current.contains(e.target as Node)) {
        setIsOpenPalettePanel(false);
      }
    };
    if (isOpenPalettePanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpenPalettePanel]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
  };

  const saveEdit = () => {
    if (editTaskNameBuffer.trim() !== '') {
      onUpdateTodo(id, { taskName: editTaskNameBuffer.trim() });
      setIsEditModeActive(false);
    }
  };

  return (
    <div
      ref={(node) => {
        itemRef.current = node;
        setNodeRef(node);
      }}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex gap-3 items-center w-full p-3 mb-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 border-[#ffb347] border-dashed' : ''} ${className}`}
    >
      {/* 點擊 Icon 開啟調色盤 */}
      <div className="relative shrink-0" onPointerDown={(e) => e.stopPropagation()}>
        <ActionIconButton
          onClick={() => setIsOpenPalettePanel(!isOpenPalettePanel)}
          className={`p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors ${isCompleted ? 'opacity-40' : ''}`}
        >
          <TodoIcon size={18} className={`${TodoItemColor}`} />
        </ActionIconButton>
        {isOpenPalettePanel && (
          <PalettePanel
            currentColor={TodoItemColor}
            onColorSelect={(iconColor) => onUpdateTodo(id, { iconColor })}
            onIconSelect={(iconName) => onUpdateTodo(id, { iconName })}
            className="top-10 left-0"
          />
        )}
      </div>

      {/* 標題與輸入框 */}
      <div
        className="flex-1 min-w-0"
        onPointerDown={(e) => isEditModeActive && e.stopPropagation()}
      >
        {isEditModeActive ? (
          <textarea
            ref={textareaRef}
            value={editTaskNameBuffer}
            onChange={(e) => setEditTaskNameBuffer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') setIsEditModeActive(false);
            }}
            className="w-full bg-black/50 text-slate-200 text-sm rounded px-2 py-1 outline-none border border-[#ffb347]/50"
          />
        ) : (
          <span
            className={`wrap-break-word line-clamp-3 text-sm font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}
          >
            {taskName}
          </span>
        )}
      </div>

      {/* 編輯/刪除/打勾按鈕*/}
      <div
        className="flex md:flex-row lg:flex-col xl:flex-row items-center shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {isEditModeActive ? (
          <div className="flex flex-col">
            <ActionIconButton
              onClick={saveEdit}
              className="p-1 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <Check size={16} />
            </ActionIconButton>
            <button
              onClick={() => setIsEditModeActive(false)}
              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex md:flex-row lg:flex-col xl:flex-row  opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 lg:gap-1 mb-1">
            <ActionIconButton
              onClick={() => setIsEditModeActive(true)}
              className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Pencil size={14} />
            </ActionIconButton>
            <ActionIconButton
              onClick={() => onDeleteTodo(id)}
              className="p-1  text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </ActionIconButton>
          </div>
        )}

        {/* 完成按鈕 */}
        <ActionIconButton
          onClick={() => onToggleTodo(id)}
          className="p-1 hover:scale-110 transition-transform"
        >
          {isCompleted ? (
            <SquareCheck size={20} className="text-[#ffb347]" />
          ) : (
            <Square size={20} className="text-slate-600 hover:text-slate-400" />
          )}
        </ActionIconButton>
      </div>
    </div>
  );
}
