interface Props {
  title: string;
}

import { Circle, GripVertical, TreePine } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';

export default function TodoItem({ title }: Props) {
  const size = 30;
  return (
    <div className="flex gap-3 items-center border-b-2 min-w-100 pb-1 w-full ">
      <ActionIconButton>
        <GripVertical size={size} />
      </ActionIconButton>
      <ActionIconButton>
        <Circle size={size} />
      </ActionIconButton>
      <span className="text-xl flex-1">{title}</span>
      <ActionIconButton className="pr-5">
        <TreePine size={size} color="green" />
      </ActionIconButton>
    </div>
  );
}
