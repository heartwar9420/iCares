import ActionIconButton from '../UI/ActionIconButton';
import { useState, useRef, useEffect } from 'react';
import { iconOptions } from './iconConstants';
import { Plus, TreePine } from 'lucide-react';
import PalettePanel from './PalettePanel';

interface Props {
  onAddTodo: (taskName: string, iconName: string, iconColor: string) => void;
}

export default function TodoInput({ onAddTodo }: Props) {
  const [todoTaskNameDraft, setTodoTaskNameDraft] = useState<string>('');

  // 狀態與預設值
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>('text-[#ffb347]');
  const [currentIconKey, setCurrentIconKey] = useState<string>('TreePine');

  const matchedIconConfig = iconOptions.find((item) => item.name === currentIconKey);
  const IconPreview = matchedIconConfig ? matchedIconConfig.icon : TreePine;

  // 用來偵測點擊外部的 Ref
  const paletteContainerRef = useRef<HTMLDivElement>(null);

  // 點擊外部自動關閉面板的邏輯
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isPaletteOpen &&
        paletteContainerRef.current &&
        !paletteContainerRef.current.contains(e.target as Node)
      ) {
        setIsPaletteOpen(false);
      }
    };
    if (isPaletteOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPaletteOpen]);

  // 新增任務的邏輯
  const handleAdd = () => {
    if (todoTaskNameDraft.trim() !== '') {
      onAddTodo(todoTaskNameDraft.trim(), currentIconKey, currentColor);
      setTodoTaskNameDraft('');
      setIsPaletteOpen(false); // 新增完畢後關閉面板
    }
  };

  return (
    <div className="flex w-full gap-2 py-3 relative items-center ">
      {/* 輸入框 */}
      <textarea
        rows={2}
        className="flex-1 py-2 pl-4 custom-scrollbar resize-none min-w-0 bg-black/30 text-slate-200 placeholder:text-slate-500 rounded-xl border border-white/10 outline-none transition-all focus:border-[#ffb347]/50 focus:bg-black/50"
        placeholder="新增待辦事項"
        onChange={(e) => setTodoTaskNameDraft(e.target.value)}
        value={todoTaskNameDraft}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
          if (e.key === 'Escape') setTodoTaskNameDraft('');
        }}
      />

      <div className="flex flex-col xl:flex-row shrink-0 items-center gap-2 xl:gap-3">
        {/* icon選擇器  */}
        <div className="relative shrink-0" ref={paletteContainerRef}>
          <ActionIconButton
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className={`flex items-center justify-center p-2 border rounded-xl transition-colors ${
              isPaletteOpen
                ? 'bg-white/10 border-white/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <IconPreview size={20} className={`${currentColor}`} />
          </ActionIconButton>

          {isPaletteOpen && (
            <PalettePanel
              currentColor={currentColor}
              onColorSelect={setCurrentColor}
              onIconSelect={setCurrentIconKey}
            />
          )}
        </div>

        {/* 新增按鈕 */}
        <ActionIconButton
          onClick={handleAdd}
          disabled={!todoTaskNameDraft.trim()}
          className="p-2 shrink-0 bg-[#ffb347]/10 text-[#ffb347] border border-[#ffb347]/20 rounded-xl hover:bg-[#ffb347]/20 disabled:opacity-30 disabled:hover:bg-[#ffb347]/10 transition-colors"
        >
          <Plus size={20} />
        </ActionIconButton>
      </div>
    </div>
  );
}
