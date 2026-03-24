import { CircleUserRound, ListTodo, LogOut, NotepadText } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import { supabase } from '@/src/lib/supabase';
import { useMemberCenterContext } from '@/src/contexts/MemberCenterContext';

interface Props {
  onCloseSettingModal: () => void;
}

export default function SettingModal({ onCloseSettingModal }: Props) {
  // 從 Context 取得方法
  const { openMemberCenter, setActiveTab } = useMemberCenterContext();

  // 登出
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onCloseSettingModal();
      window.location.href = '/';
    } catch (error) {
      console.error('登出失敗', error);
    }
  };
  return (
    <div className="absolute top-14 right-5 w-fit h-fit flex flex-col gap-5 bg-[#161b26] p-5 rounded-2xl border border-slate-500 z-50">
      <div className="flex ">
        <ActionIconButton
          className="flex justify-between w-full gap-5 text-xl"
          onClick={() => {
            onCloseSettingModal();
            setActiveTab('profile');
            openMemberCenter();
          }}
        >
          個人設定
          <CircleUserRound />
        </ActionIconButton>
      </div>
      <div className="flex ">
        <ActionIconButton
          className="flex justify-between w-full gap-5 text-xl"
          onClick={() => {
            onCloseSettingModal();
            setActiveTab('focus');
            openMemberCenter();
          }}
        >
          專注紀錄
          <NotepadText />
        </ActionIconButton>
      </div>
      <div className="flex ">
        <ActionIconButton
          className="flex justify-between w-full gap-5 text-xl"
          onClick={() => {
            onCloseSettingModal();
            setActiveTab('todos');
            openMemberCenter();
          }}
        >
          完成待辦
          <ListTodo />
        </ActionIconButton>
      </div>
      <div className="flex ">
        <ActionIconButton
          className="flex justify-between text-xl w-full text-center"
          onClick={handleSignOut}
        >
          登出
          <LogOut />
        </ActionIconButton>
      </div>
    </div>
  );
}
