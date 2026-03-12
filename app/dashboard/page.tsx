'use client';

import NavBar from '@/components/NavBar/NavBar';
import DashboardContent from '@/components/Layout/DashboardContent';

export default function Page() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0e17] ">
      <NavBar />
      <DashboardContent />
    </div>
  );
}
