import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  display_name: string;
}

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id,display_name')
          .eq('id', user.id)
          .single();
        if (error) {
          console.error('使用者資料讀取失敗', error);
        } else if (profileData) {
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error('使用者資料讀取失敗', error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchUser();
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
