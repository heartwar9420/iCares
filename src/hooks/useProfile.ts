import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  display_name: string;
}

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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
  }, [fetchUser]);

  return { user, loading, fetchUser, setLoading, profile };
}
