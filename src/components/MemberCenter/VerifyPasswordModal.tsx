import { useState } from 'react';
import { useMemberCenterContext } from '@/src/contexts/MemberCenterContext';
import ActionIconButton from '../UI/ActionIconButton';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function VerifyPasswordModal() {
  const { isLoading, handleUpdatePassword, isUpdating } = useMemberCenterContext();

  // 綁定三個 Input
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  // 顯示密碼
  const [showPassword, setShowPassword] = useState(false);

  // 檢查條件的邏輯
  const validations = [
    { label: '長度至少 6 位元', met: newPwd.length >= 6 },
    //  test = 檢查是否有 a-z or A-Z , 如果有就回傳 true
    { label: '包含英文字母', met: /[a-zA-Z]/.test(newPwd) },
    // \d = Digit (數字) , !@#$%^&* = 自訂的特殊符號
    { label: '包含數字或特殊符號', met: /[\d!@#$%^&*]/.test(newPwd) },
  ];

  // 進度條的邏輯 只是 validations 的 met = true , 就留下
  const strengthScore = validations.filter((v) => v.met).length;

  // 處理點擊
  const handleSubmit = () => {
    handleUpdatePassword(oldPwd, newPwd, confirmPwd);
  };

  const inputStyle =
    'w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200  disabled:cursor-not-allowed';

  const labelStyle = 'text-slate-400 font-medium mb-2';
  return (
    <div className="w-full mx-auto p-10 flex flex-col">
      <div className="space-y-6">
        {/* 舊密碼 */}
        <div className="flex flex-col">
          <label className={labelStyle}>舊密碼</label>
          <input
            disabled={isLoading}
            type={showPassword ? 'text' : 'password'}
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            placeholder="請輸入目前使用的密碼"
            className={inputStyle}
          />
        </div>

        {/* 新密碼 */}
        <div className="flex flex-col">
          <label className={labelStyle}>新密碼</label>
          <input
            disabled={isLoading}
            type={showPassword ? 'text' : 'password'}
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="請輸入 6 位數以上新密碼"
            className={inputStyle}
          />
        </div>

        {/* 確認新密碼 */}
        <div className="flex flex-col">
          <label className={labelStyle}>確認新密碼</label>
          <input
            disabled={isLoading}
            type={showPassword ? 'text' : 'password'}
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="再次輸入新密碼以確認"
            className={inputStyle}
          />
        </div>
        {/* 切換顯示按鈕 */}
        <ActionIconButton
          onClick={() => setShowPassword(!showPassword)}
          className="text-slate-400 flex items-center text-center justify-center w-full"
        >
          {showPassword ? (
            <div className="flex gap-3 items-center">
              隱藏密碼
              <EyeOff size={20} />
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              顯示密碼
              <Eye size={20} />
            </div>
          )}
        </ActionIconButton>
      </div>

      <div className="mt-8">
        <ActionIconButton
          onClick={handleSubmit}
          disabled={isLoading || !oldPwd || !newPwd}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98]"
        >
          <div className="text-center w-full">{isUpdating ? '處理中...' : '確定修改'}</div>
        </ActionIconButton>
      </div>

      {/* 安全要求 */}
      <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
        <p className="text-sm text-slate-500 mb-2 font-medium">安全要求：</p>
        <ul className="space-y-1.5">
          {validations.map((v, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm transition-colors duration-300"
            >
              {v.met ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <X size={14} className="text-slate-600" />
              )}
              <span className={v.met ? 'text-green-400' : 'text-slate-500'}>{v.label}</span>
            </li>
          ))}
        </ul>

        {/* 強度進度條 */}
        <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              strengthScore <= 0
                ? ''
                : strengthScore <= 1
                  ? 'bg-red-500 w-1/3'
                  : strengthScore <= 2
                    ? 'bg-orange-500 w-2/3'
                    : 'bg-green-500 w-full'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
