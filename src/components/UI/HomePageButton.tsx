'use client';

import { Copyright } from 'lucide-react';
import ActionIconButton from './ActionIconButton';
import { usePathname, useRouter } from 'next/navigation';

export default function HomePageButton() {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = () => {
    if (pathname === '/') {
      // 如果在首頁，平滑滾動到最上方
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 如果在其他頁面，跳轉回首頁
      router.push('/');
    }
  };

  return (
    <ActionIconButton
      onClick={handleClick}
      className="text-base lg:text-xl font-bold flex items-center text-black bg-[#ffb347] hover:bg-orange-500 px-5 py-2 rounded-full transition"
    >
      <Copyright className="text-black" />
      iCares
    </ActionIconButton>
  );
}
