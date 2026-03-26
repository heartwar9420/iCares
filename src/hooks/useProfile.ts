import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  display_name: string;
  privacy_mode?: 'Public' | 'Hidden';
  auto_status?: '專注中' | '閒置中' | '離線中';
}

// 在 Hook 外部宣告一個全域變數，用來記住 正在執行中的請求
let fetchUserPromise: Promise<{ user: User | null; profileData: UserProfile | null }> | null = null;

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchUser = useCallback(async () => {
    const {
      data: { user: verifiedUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !verifiedUser) {
      console.error('伺服器驗證使用者失敗', error);
      setUser(null);
      setProfile(null);
    } else {
      setUser(verifiedUser);
    }
  }, []);

  useEffect(() => {
    const loadData = async (sessionUser: User | null) => {
      // 如果沒登入，清空資料並解除 loading
      if (!sessionUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(sessionUser);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id,display_name,privacy_mode,auto_status')
          .eq('id', sessionUser.id)
          .single();

        if (data && !error) {
          setProfile(data);
        } else {
          setProfile({
            id: sessionUser.id,
            display_name: '預設使用者',
            privacy_mode: 'Public',
            auto_status: '閒置中',
          });
        }
      } catch (err) {
        console.error('Profile 執行錯誤:', err);
        setProfile({
          id: sessionUser.id,
          display_name: '連線異常使用者',
          privacy_mode: 'Public',
          auto_status: '閒置中',
        });
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadData(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      loadData(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, fetchUser, setLoading, profile };
}
