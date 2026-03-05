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

import { Check, Circle, CircleCheck, Pencil, Trash2, TreePine, X } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import { iconOptions } from './iconConstants';
import { useEffect, useRef, useState } from 'react';
import PalettePanel from './PalettePanel';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const size = 30;
  // 從iconOptions 中找到 名字等於 icon的
  const matchedIconConfig = iconOptions.find((item) => item.name === TodoItemIcon);
  // 如果有選的話就用選的，如果沒有就用預設的 樹
  const TodoIcon = matchedIconConfig ? matchedIconConfig.icon : TreePine;
  // 用來記錄現在是否是編輯模式
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  // 用來暫存使用者修改的title
  const [editTitleBuffer, setEditTitleBuffer] = useState(TodoItemTitle);
  // isOpenPalettePanel 用來判斷開啟 panel
  const [isOpenPalettePanel, setIsOpenPalettePanel] = useState(false);

  // 從 Hook 中解構出需要的零件
  const {
    setNodeRef, // 告訴系統誰要動
    attributes, // 讓系統辨識這是拖拉中的零件
    listeners, // 等待滑鼠的命令
    transform, // 即時座標
    transition, // 過渡動畫
    isDragging, //是否正在被抓取中
  } = useSortable({ id: id });

  // 把座標的數字轉換成字串
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
  };

  // 用來監聽 panel
  const itemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpenPalettePanel && itemRef.current) {
        if (!itemRef.current.contains(e.target as Node)) {
          setIsOpenPalettePanel(false);
        }
      }
    };
    if (isOpenPalettePanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenPalettePanel]);

  return (
    <div
      ref={(node) => {
        itemRef.current = node;
        setNodeRef(node);
      }}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-0' : ''} flex gap-5 items-center border-b-2 min-w-100 pb-1 w-full mt-1 px-3 bg-amber-300 rounded-2xl hover:cursor-pointer ${className}`}
    >
      <ActionIconButton className="shrink-0" onClick={() => onToggleTodo(id)}>
        {isFinished ? <CircleCheck size={size} /> : <Circle size={size} />}
      </ActionIconButton>
      {isEditModeActive ? (
        <input
          value={editTitleBuffer}
          onChange={(e) => {
            setEditTitleBuffer(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (editTitleBuffer !== '') {
                onUpdateTodo(id, { title: editTitleBuffer });
                setIsEditModeActive(false);
              }
            }
            if (e.key === 'Escape') {
              setIsEditModeActive(false);
            }
          }}
          className="text-xl flex-1  wrap-break-word min-w-0 my-1 bg-gray-200 rounded-2xl text-center"
          placeholder={`${TodoItemTitle}`}
        />
      ) : (
        <span
          className={`text-xl flex-1  wrap-break-word min-w-0 py-1 ${isFinished ? 'line-through opacity-60' : ''}`}
          title={`${TodoItemTitle}`}
        >
          {TodoItemTitle}
        </span>
      )}

      <div className="flex shrink-0">
        {isEditModeActive ? (
          <div className="flex gap-3">
            <ActionIconButton
              onClick={() => {
                if (editTitleBuffer !== '') {
                  onUpdateTodo(id, { title: editTitleBuffer });
                  setIsEditModeActive(false);
                }
              }}
            >
              <Check className="text-green-700 hover:scale-120" size={size} />
            </ActionIconButton>
            <ActionIconButton
              onClick={() => {
                setIsEditModeActive(false);
              }}
            >
              <X className="text-red-500 hover:scale-120" size={size} />
            </ActionIconButton>
          </div>
        ) : (
          <ActionIconButton
            onClick={() => {
              setIsEditModeActive(!isEditModeActive);
            }}
          >
            <Pencil className=" hover:scale-120" size={size} />
          </ActionIconButton>
        )}
      </div>
      <ActionIconButton onClick={() => setIsOpenPalettePanel(!isOpenPalettePanel)}>
        <TodoIcon size={size} className={` hover:scale-120 ${TodoItemColor}`} />
      </ActionIconButton>
      {isOpenPalettePanel && (
        <PalettePanel
          currentColor={TodoItemColor}
          onColorSelect={(selectedColor) => {
            onUpdateTodo(id, { color: selectedColor });
          }}
          onIconSelect={(selectedIcon) => {
            onUpdateTodo(id, { icon_name: selectedIcon });
          }}
        />
      )}

      <ActionIconButton className="pr-5" onClick={() => onDeleteTodo(id)}>
        <Trash2 size={size} className="text-red-500  hover:scale-120" />
      </ActionIconButton>
    </div>
  );
}
