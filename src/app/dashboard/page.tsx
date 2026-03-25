'use client';

import NavBar from '@/src/components/NavBar/NavBar';
import DashboardContent from '@/src/components/Layout/DashboardContent';
import { useProfileContext } from '@/src/contexts/ProfileContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashBoardPage() {
  // 判斷是否有登入 , 如果沒有就返回首頁
  const { user, loading } = useProfileContext();
  const router = useRouter();
  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, router, loading]);
  // 在讀取中顯示 空白頁
  if (loading || !user) {
    return null;
  }

  return (
    <>
      <div className="relative flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-[#0a0e17] ">
        <NavBar />
        <DashboardContent />
      </div>
    </>
  );
}
