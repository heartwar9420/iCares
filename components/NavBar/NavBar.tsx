'use client';
import { LogIn, Menu, UserPlus } from 'lucide-react';
import ActionIconButton from '../UI/ActionIconButton';
import { CircleUser, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  const isLoggedIn = !!user;

  return (
    <nav className="relative flex text-slate-400 bg-[#161b26] justify-between text-center items-center p-5 border-b border-yellow-300/40 shadow-[0_4px_20px_-5px_rgba(255,179,71,0.2)]">
      <div className="flex">
        <ActionIconButton>
          <Menu />
        </ActionIconButton>
      </div>
      {!isLoggedIn ? (
        <div className="flex gap-10">
          <div>
            <ActionIconButton
              onClick={() => {
                setIsModalOpen(true);
                setInitialMode('signin');
              }}
              className="text-xl flex gap-3 items-center"
            >
              <LogIn />
              登入
            </ActionIconButton>
          </div>
          <div>
            <ActionIconButton
              onClick={() => {
                setIsModalOpen(true);
                setInitialMode('signup');
              }}
              className="text-xl flex gap-3 items-center"
            >
              <UserPlus />
              註冊
            </ActionIconButton>
          </div>
        </div>
      ) : (
        <div className="flex gap-10">
          <div>
            <ActionIconButton className="text-xl flex gap-3 items-center">
              <CircleUser />
              會員中心
            </ActionIconButton>
          </div>
          <div>
            <ActionIconButton onClick={handleSignOut} className="text-xl flex gap-3 items-center">
              <LogOut />
              登出
            </ActionIconButton>
          </div>
        </div>
      )}

      {isModalOpen && (
        <AuthModal onCloseModal={() => setIsModalOpen(false)} initialMode={initialMode} />
      )}
    </nav>
  );
}
