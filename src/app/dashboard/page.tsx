'use client';

import NavBar from '@/src/components/NavBar/NavBar';
import DashboardContent from '@/src/components/Layout/DashboardContent';
import { useProfileContext } from '@/src/contexts/ProfileContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashBoardPage() {
  // 判斷是否有登入 , 如果沒有就返回首頁
  const { user, loading, profile } = useProfileContext();
  const router = useRouter();
  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, router, loading]);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e17] text-slate-400">
        載入中，請稍候...
      </div>
    );
  }

  return (
    <>
      <div className="relative flex flex-col min-h-screen bg-[#0a0e17] ">
        <NavBar />
        <DashboardContent />
      </div>
    </>
  );
}
