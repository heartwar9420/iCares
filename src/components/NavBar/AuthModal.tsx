'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import ActionIconButton from '../UI/ActionIconButton';
import { Check, X } from 'lucide-react';

interface AuthModalProps {
  onCloseAuthModal: () => void;
  initialMode?: 'signin' | 'signup'; // 讓父層決定點開時先顯示哪一個
}

export default function AuthModal({ onCloseAuthModal, initialMode = 'signin' }: AuthModalProps) {
  // 目前是登入還是註冊模式
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isSignIn = mode === 'signin';

  // 檢查條件的邏輯
  const validations = [
    { label: '長度至少 6 位元', met: password.length >= 6 },
    //  test = 檢查是否有 a-z or A-Z , 如果有就回傳 true
    { label: '包含英文字母', met: /[a-zA-Z]/.test(password) },
    // \d = Digit (數字) , !@#$%^&* = 自訂的特殊符號
    { label: '包含數字或特殊符號', met: /[\d!@#$%^&*]/.test(password) },
  ];

  // 進度條的邏輯 只是 validations 的 met = true , 就留下
  const strengthScore = validations.filter((v) => v.met).length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignIn) {
      // 登入邏輯
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`登入失敗：${error.message}`);
      } else {
        setMessage('登入成功！');
        onCloseAuthModal(); // 關閉彈窗
        router.push('dashboard');
      }
    } else {
      // 註冊邏輯
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: displayName }, // 這會觸發資料庫 Trigger 寫入 profiles
        },
      });
      if (error) {
        setMessage(`註冊失敗：${error.message}`);
      } else {
        setMessage('註冊成功！歡迎使用帳號登入');
        setMode('signin');
      }
    }
    setLoading(false);
  };

  const AuthContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (AuthContainerRef.current && !AuthContainerRef.current.contains(e.target as Node)) {
        onCloseAuthModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCloseAuthModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={AuthContainerRef}
        className="relative w-full max-w-md p-8 bg-[#161b26] rounded-2xl border border-slate-800 shadow-2xl"
      >
        {/* 標題切換 */}
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          {isSignIn ? '登入 iCares' : '建立新帳號'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 註冊模式下才顯示暱稱輸入框 */}
          {!isSignIn && (
            <div>
              <label className="text-sm block mb-1">顯示名稱</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0E1117] border border-slate-700 p-3 rounded-lg focus:border-[#2ED8C3] outline-none"
                placeholder="你想被怎麼稱呼？"
              />
            </div>
          )}

          <div>
            <label className="text-base block mb-2">電子信箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0E1117] border border-slate-700 p-3 rounded-lg focus:border-[#2ED8C3] outline-none"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label className="text-base block mb-2">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0E1117] border border-slate-700 p-3 rounded-lg focus:border-[#2ED8C3] outline-none"
              placeholder="••••••••"
            />
          </div>
          {!isSignIn ? (
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
          ) : (
            <></>
          )}

          {message && <p className={`text-base text-red-400`}>{message}</p>}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#2ED8C3] text-black font-bold py-3 rounded-lg mt-4 cursor-pointer hover:bg-[#25b5a4] transition-colors"
          >
            {loading ? '處理中...' : isSignIn ? '立即登入' : '註冊帳號'}
          </button>
        </form>

        {/* 模式切換器 */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isSignIn ? (
            <p>
              還沒有帳號嗎？{' '}
              <ActionIconButton
                onClick={() => {
                  setMode('signup');
                  setMessage('');
                }}
                className="text-[#2ED8C3] hover:underline"
              >
                立即註冊
              </ActionIconButton>
            </p>
          ) : (
            <p>
              已經有帳號了？{' '}
              <ActionIconButton
                onClick={() => {
                  setMode('signin');
                  setMessage('');
                }}
                className="text-[#2ED8C3] hover:underline"
              >
                返回登入
              </ActionIconButton>
            </p>
          )}
        </div>

        <ActionIconButton
          onClick={onCloseAuthModal}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          ✕
        </ActionIconButton>
      </div>
    </div>
  );
}
