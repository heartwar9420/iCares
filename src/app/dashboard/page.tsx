'use client';

import NavBar from '@/src/components/NavBar/NavBar';
import DashboardContent from '@/src/components/Layout/DashboardContent';

export default function DashBoardPage() {
  return (
    <>
      <div className="relative flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-[#0a0e17] ">
        <NavBar />
        <DashboardContent />
      </div>
    </>
  );
}
