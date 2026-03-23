import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useProfileContext } from '../contexts/ProfileContext';
export function useMemberCenter() {
  const { user } = useProfileContext();
  const [isMemberCenterOpen, setIsMemberCenterOpen] = useState(false);
  const [isVerifyPasswordModalOpen, setIsVerifyPasswordModalOpen] = useState(false);

  const openMemberCenter = () => setIsMemberCenterOpen(true);
  const closeMemberCenter = () => setIsMemberCenterOpen(false);
  const toggleMemberCenter = () => setIsMemberCenterOpen((prev) => !prev);
  const openVerifyPasswordModal = () => setIsVerifyPasswordModalOpen(true);
  const closeVerifyPasswordModal = () => setIsVerifyPasswordModalOpen(false);

  // 控制目前顯示哪個 Tab
  const [activeTab, setActiveTab] = useState('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'signin' | 'signup'>('signin');

  // !! = 把 user 強制轉成 布林值
  const isLoggedIn = !!user;

  // 資料庫資料庫讀取中
  const [isLoading, setIsLoading] = useState(true);
  // 更新中
  const [isUpdating, setIsUpdating] = useState(false);

  // 在輸入框中的顯示名稱
  const [inputUserName, setInputUserName] = useState('');
  // 使用者的預設資料
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    avatarUrl: '',
  });
  const getFullAvatarUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  // useCallback = 讓函式保持不變 , 如果在 useEffect中放了這個函式可能會變成無窮迴圈, 所以要用useCallback
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles') // 從profile的表
        .select('display_name,email,avatar_url') //拿需要的欄位
        .eq('id', user.id) //id = user的id(本人)
        .single(); //id 是唯一的 , 只要回傳一個物件就好
      if (!error && data) {
        setUserProfile({
          displayName: data.display_name || '未設定名稱',
          email: data.email || '',
          avatarUrl: getFullAvatarUrl(data.avatar_url),
        });
      }
    } catch (error) {
      console.error('取得資料失敗', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]); //這裡放空的 代表函式只會被建立一次

  const handleUpdateAvatar = async (file: File) => {
    try {
      setIsUpdating(true);

      if (!user?.id) return;
      // split = 遇到 . 就切開 , pop = 取出陣列中的最後一個元素 (就能取得副檔名)
      const fileExt = file.name.split('.').pop();
      // 用random 可以避免重複 , 且可以破解快取 (強迫瀏覽器抓最新的圖片)
      const filePath = `${user.id}/${Math.random()}.file${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        // upload (目的地 , 檔案本體 , 額外設定) upsert = update+insert , 如果有了就覆蓋 , 如果沒有就新增
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setUserProfile((prev) => ({ ...prev, avatarUrl: getFullAvatarUrl(filePath) }));
      alert('大頭貼更新成功');
    } catch (error) {
      if (error instanceof Error) {
        alert('更新失敗： ' + error.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsUpdating(true);
      if (!user) return;
      // 先從資料庫中找到檔案路徑
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      const currentPath = profileData?.avatar_url;
      if (currentPath) {
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([currentPath]);
        if (storageError) throw storageError;
      }
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
      if (dbError) throw dbError;
      setUserProfile((prev) => ({
        ...prev,
        avatarUrl: '',
      }));
      alert('大頭貼刪除成功');
    } catch (error) {
      if (error instanceof Error) {
        alert('刪除失敗： ' + error.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateDisplayName = async () => {
    setIsUpdating(true);
    if (!user?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: inputUserName })
      .eq('id', user?.id);
    if (error) {
      alert('更新失敗' + error.message);
      return;
    }
    // 用prev 展開 保留舊的 只更改 displayName = inputUserName
    setUserProfile((prev) => ({
      ...prev,
      displayName: inputUserName,
    }));

    alert('更新成功！');
    setIsUpdating(false);
  };

  const handleUpdatePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    setIsUpdating(true);
    if (newPassword !== confirmPassword) {
      alert('兩次新密碼輸入不一致');
      return;
    }
    if (newPassword.length < 6) {
      alert('密碼至少需要六位數');
      return;
    }
    if (newPassword.trim().length === 0) {
      alert('密碼不能全部都是空白');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password: oldPassword,
    });

    if (signInError) {
      alert('舊密碼輸入錯誤，驗證失敗');
      setIsUpdating(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) {
      alert('更新密碼失敗' + updateError.message);
      return;
    } else {
      alert('密碼更新成功');
      setIsVerifyPasswordModalOpen(false);
    }
    setIsUpdating(false);
  };

  return {
    userProfile,
    isMemberCenterOpen,
    openMemberCenter,
    closeMemberCenter,
    toggleMemberCenter,
    activeTab,
    setActiveTab,
    isLoggedIn,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setInitialMode,
    setIsSettingModalOpen,
    isSettingModalOpen,
    initialMode,
    inputUserName,
    setInputUserName,
    handleUpdateDisplayName,
    isUpdating,
    isLoading,
    isVerifyPasswordModalOpen,
    openVerifyPasswordModal,
    closeVerifyPasswordModal,
    handleUpdatePassword,
    handleUpdateAvatar,
    setIsUpdating,
    handleDeleteAvatar,
  };
}
