import { Palette, SquareArrowRightExit, SquareCheck } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';

export default function TodoInput() {
  const size = 36;
  return (
    <div className="flex w-full gap-3 py-3">
      <ActionIconButton>
        <SquareArrowRightExit size={size} />
      </ActionIconButton>
      <textarea
        className="flex flex-1 py-2 bg-amber-100 rounded-2xl border-2 border-transparent text-center outline-none hover:border-2 hover:border-red-200 focus:border-red-400 placeholder:text-blue-950"
        placeholder="請輸入待完成的事項"
        rows={1}
      />
      <ActionIconButton>
        <Palette size={size} />
      </ActionIconButton>
      <ActionIconButton>
        <SquareCheck size={size} />
      </ActionIconButton>
    </div>
  );
}
