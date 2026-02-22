import ActionIconButton from '../UI/ActionIconButton';

export default function AuthButtonGroup() {
  const isLoggedIn = false;
  return (
    <div className="flex gap-5 mt-8 mr-8 justify-end">
      {isLoggedIn ? (
        <>
          <ActionIconButton className="bg-amber-200 text-xl rounded-2xl p-1">登入</ActionIconButton>
          <ActionIconButton className="bg-amber-200 text-xl rounded-2xl p-1">註冊</ActionIconButton>
        </>
      ) : (
        <>
          <ActionIconButton className="bg-amber-200 text-xl rounded-2xl px-2">
            會員中心
          </ActionIconButton>
          <ActionIconButton className="bg-amber-200 text-xl rounded-2xl px-2">
            登出
          </ActionIconButton>
        </>
      )}
    </div>
  );
}
