import ActionIconButton from '../UI/ActionIconButton';
import { useState } from 'react';
import { iconOptions } from './iconConstants';
import { SquareArrowRightExit, SquareCheck, TreePine } from 'lucide-react';
import PalettePanel from './PalettePanel';

interface Props {
  // 接收 title = string ， 但不用回傳
  onAddTodo: (title: string, icon_name: string, color: string) => void;
}

export default function TodoInput({ onAddTodo }: Props) {
  const size = 36;
  const [todoTitleDraft, setTodoTitleDraft] = useState<string>('');
  // isPaletteOpen 用來顯示調色盤是否開啟
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  // currentColor 用來顯示目前被選擇的顏色
  const [currentColor, setCurrentColor] = useState<string>('text-green-500');
  // currentIconKey 用來顯示目前被選擇的圖標
  const [currentIconKey, setCurrentIconKey] = useState<string>('TreePine');
  // 從iconOptions 中找到 名字等於 icon的
  const matchedIconConfig = iconOptions.find((item) => item.name === currentIconKey);
  // 如果有選的話就用選的，如果沒有就用預設的 樹
  const IconPreview = matchedIconConfig ? matchedIconConfig.icon : TreePine;

  return (
    <div className="flex w-full gap-3 py-3 relative items-center">
      <ActionIconButton>
        <SquareArrowRightExit size={size} />
      </ActionIconButton>
      <textarea
        className="flex flex-1 py-2 bg-amber-100/70 rounded-2xl border-2 border-transparent text-center outline-none  hover:border-2 hover:border-red-200 focus:border-red-400 placeholder:text-blue-950"
        placeholder="請輸入待完成的事項"
        rows={1}
        onChange={(e) => setTodoTitleDraft(e.target.value)}
        value={todoTitleDraft}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (todoTitleDraft !== '') {
              onAddTodo(todoTitleDraft, currentIconKey, currentColor);
              setTodoTitleDraft('');
            }
          }
          if (e.key === 'Escape') {
            setTodoTitleDraft('');
          }
        }}
      />
      <div
        className="relative"
        onMouseEnter={() => {
          setIsPaletteOpen(true);
        }}
        onMouseLeave={() => {
          setIsPaletteOpen(false);
        }}
      >
        <ActionIconButton className="flex">
          <IconPreview size={size} className={`${currentColor}`} />
        </ActionIconButton>

        {isPaletteOpen && (
          <PalettePanel
            currentColor={currentColor}
            onColorSelect={setCurrentColor}
            onIconSelect={setCurrentIconKey}
          />
        )}
      </div>

      <ActionIconButton
        onClick={() => {
          if (todoTitleDraft !== '') {
            onAddTodo(todoTitleDraft, currentIconKey, currentColor);
            setTodoTitleDraft('');
          }
        }}
      >
        <SquareCheck size={size} />
      </ActionIconButton>
    </div>
  );
}
