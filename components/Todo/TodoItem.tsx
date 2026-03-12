import { Check, Pencil, Square, SquareCheck, Trash2, TreePine, X } from 'lucide-react';
import { iconOptions } from './iconConstants';
import { useEffect, useRef, useState } from 'react';
import PalettePanel from './PalettePanel';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ActionIconButton from '../UI/ActionIconButton';

interface Props {
  TodoItemTitle: string;
  onDeleteTodo: (id: string) => void;
  id: string;
  onToggleTodo: (id: string) => void;
  isFinished: boolean;
  TodoItemColor: string;
  TodoItemIcon: string;
  onUpdateTodo: (
    id: string,
    updates: { title?: string; icon_name?: string; color?: string },
  ) => void;
  className?: string;
}

export default function TodoItem({
  TodoItemTitle,
  onDeleteTodo,
  id,
  onToggleTodo,
  isFinished,
  TodoItemColor,
  TodoItemIcon,
  onUpdateTodo,
  className,
}: Props) {
  const matchedIconConfig = iconOptions.find((item) => item.name === TodoItemIcon);
  const TodoIcon = matchedIconConfig ? matchedIconConfig.icon : TreePine;

  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [editTitleBuffer, setEditTitleBuffer] = useState(TodoItemTitle);
  const [isOpenPalettePanel, setIsOpenPalettePanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditModeActive && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
    if (editTitleBuffer.trim() !== '') {
      onUpdateTodo(id, { title: editTitleBuffer.trim() });
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
      // 科技風卡片樣式：group 用來控制內部按鈕的 hover 顯示
      className={`group flex gap-3 items-center w-full p-3 mb-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 border-[#ffb347] border-dashed' : ''} ${className}`}
    >
      {/* 左側：圖示 (點擊可開啟調色盤，但要阻擋事件冒泡避免觸發拖曳) */}
      <div className="relative shrink-0" onPointerDown={(e) => e.stopPropagation()}>
        <ActionIconButton
          onClick={() => setIsOpenPalettePanel(!isOpenPalettePanel)}
          className={`p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors ${isFinished ? 'opacity-40' : ''}`}
        >
          <TodoIcon size={18} className={`${TodoItemColor}`} />
        </ActionIconButton>
        {isOpenPalettePanel && (
          <PalettePanel
            currentColor={TodoItemColor}
            onColorSelect={(color) => onUpdateTodo(id, { color })}
            onIconSelect={(icon) => onUpdateTodo(id, { icon_name: icon })}
            className="top-10 left-0"
          />
        )}
      </div>

      {/* 中間：標題與輸入框 */}
      <div
        className="flex-1 min-w-0"
        onPointerDown={(e) => isEditModeActive && e.stopPropagation()}
      >
        {isEditModeActive ? (
          <input
            ref={inputRef}
            value={editTitleBuffer}
            onChange={(e) => setEditTitleBuffer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') setIsEditModeActive(false);
            }}
            className="w-full bg-black/50 text-slate-200 text-sm rounded px-2 py-1 outline-none border border-[#ffb347]/50"
          />
        ) : (
          <span
            className={`block truncate text-sm font-medium ${isFinished ? 'line-through text-slate-500' : 'text-slate-200'}`}
          >
            {TodoItemTitle}
          </span>
        )}
      </div>

      {/* 右側：編輯/刪除按鈕 (平時隱藏，Hover 顯示) + 打勾按鈕 */}
      <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
        {isEditModeActive ? (
          <>
            <ActionIconButton
              onClick={saveEdit}
              className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <Check size={16} />
            </ActionIconButton>
            <button
              onClick={() => setIsEditModeActive(false)}
              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 mr-2">
            <ActionIconButton
              onClick={() => setIsEditModeActive(true)}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Pencil size={14} />
            </ActionIconButton>
            <ActionIconButton
              onClick={() => onDeleteTodo(id)}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </ActionIconButton>
          </div>
        )}

        {/* 狀態切換按鈕 (設計稿中的方形 Checkbox) */}
        <ActionIconButton
          onClick={() => onToggleTodo(id)}
          className="p-1 hover:scale-110 transition-transform"
        >
          {isFinished ? (
            <SquareCheck size={20} className="text-[#ffb347]" />
          ) : (
            <Square size={20} className="text-slate-600 hover:text-slate-400" />
          )}
        </ActionIconButton>
      </div>
    </div>
  );
}
