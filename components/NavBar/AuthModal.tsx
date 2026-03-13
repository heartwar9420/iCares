'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ActionIconButton from '../UI/ActionIconButton';

interface AuthModalProps {
  onCloseModal: () => void;
  initialMode?: 'signin' | 'signup'; // 讓父層決定點開時先顯示哪一個
}

export default function AuthModal({ onCloseModal, initialMode = 'signin' }: AuthModalProps) {
  // 目前是登入還是註冊模式
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isSignIn = mode === 'signin';

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
        onCloseModal(); // 關閉彈窗
        router.refresh(); // 刷新頁面狀態
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
        setMessage('註冊成功！請檢查信箱或直接嘗試登入。');
      }
    }
    setLoading(false);
  };

  const AuthContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (AuthContainerRef.current && !AuthContainerRef.current.contains(e.target as Node)) {
        onCloseModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCloseModal]);

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
                onClick={() => setMode('signup')}
                className="text-[#2ED8C3] hover:underline"
              >
                立即註冊
              </ActionIconButton>
            </p>
          ) : (
            <p>
              已經有帳號了？{' '}
              <ActionIconButton
                onClick={() => setMode('signin')}
                className="text-[#2ED8C3] hover:underline"
              >
                返回登入
              </ActionIconButton>
            </p>
          )}
        </div>

        <ActionIconButton
          onClick={onCloseModal}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          ✕
        </ActionIconButton>
      </div>
    </div>
  );
}
