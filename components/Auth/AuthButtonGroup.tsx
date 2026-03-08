import ActionIconButton from '../UI/ActionIconButton';

export default function AuthButtonGroup() {
  const isLoggedIn = false;
  return (
    <div className="flex mt-2 mr-2 justify-end">
      {isLoggedIn ? (
        <div className="flex gap-5">
          <div className="bg-amber-200 rounded-2xl p-1">
            <ActionIconButton className="text-xl ">登入</ActionIconButton>
          </div>
          <div className="bg-amber-200 rounded-2xl p-1">
            <ActionIconButton className=" text-xl ">註冊</ActionIconButton>
          </div>
        </div>
      ) : (
        <div className="flex gap-5">
          <div className="bg-amber-200 rounded-2xl p-1">
            <ActionIconButton className="text-xl">會員中心</ActionIconButton>
          </div>
          <div className="bg-amber-200 rounded-2xl p-1">
            <ActionIconButton className="text-xl ">登出</ActionIconButton>
          </div>
        </div>
      )}
    </div>
  );
}
