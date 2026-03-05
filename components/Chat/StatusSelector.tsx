import ActionIconButton from '../UI/ActionIconButton';

interface Props {
  onStatusChange: (privacyMode: 'Public' | 'Hidden', isConnected: boolean) => void;
}
export default function StatusSelector({ onStatusChange }: Props) {
  return (
    <div className="bg-red-200 p-2 rounded-md flex flex-col gap-2">
      <span className="text-sm font-bold text-gray-800">我的狀態設定</span>
      <div className="flex gap-2">
        <ActionIconButton onClick={() => onStatusChange('Public', true)}>
          <span>上線中</span>
        </ActionIconButton>
        <ActionIconButton onClick={() => onStatusChange('Hidden', true)}>
          <span>隱藏中</span>
        </ActionIconButton>
        <ActionIconButton onClick={() => onStatusChange('Hidden', false)}>
          <span>離線中</span>
        </ActionIconButton>
      </div>
    </div>
  );
}
