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
    try {
      setLoading(true);

      // 如果還沒有人發起請求，我們就建立一個新的請求
      if (!fetchUserPromise) {
        fetchUserPromise = (async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          let profileData = null;

          if (user) {
            const { data, error } = await supabase
              .from('profiles')
              .select('id,display_name,privacy_mode,auto_status')
              .eq('id', user.id)
              .single();

            if (error) {
              console.error('使用者資料讀取失敗', error);
            } else if (data) {
              profileData = data;
            }
          }
          return { user, profileData };
        })();
      }

      // 等待唯一的請求完成
      const result = await fetchUserPromise;
      setUser(result.user);
      setProfile(result.profileData);
    } catch (error) {
      console.error('使用者資料讀取失敗', error);
    } finally {
      // 請求結束後，把全域變數清空，讓未來的操作可以重新請求
      fetchUserPromise = null;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = session?.user;
        setUser(currentUser || null);

        if (currentUser) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id,display_name,privacy_mode,auto_status')
            .eq('id', currentUser.id)
            .single();

          if (error) {
            console.error('使用者資料讀取失敗', error);
          } else if (profileData) {
            setProfile(profileData);
          }
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  return { user, loading, fetchUser, setLoading, profile };
}
