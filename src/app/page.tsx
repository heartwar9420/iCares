'use client';

import { useEffect, useState } from 'react';
import { LogIn, UserPlus, SquareChevronRight } from 'lucide-react';
import { useMemberCenterContext } from '../contexts/MemberCenterContext';
import ActionIconButton from '../components/UI/ActionIconButton';
import AuthModal from '../components/NavBar/AuthModal';
import HomePageButton from '../components/UI/HomePageButton';
import { useRouter } from 'next/navigation';
import ScrollReveal from '../components/HomePage/ScrollReveal';
import HowItWorksSection from '../components/HomePage/HowItWorksSection';
import FocusModeSection from '../components/HomePage/FocusModeSection';
import ScienceSection from '../components/HomePage/ScienceSection';
import HeroSections from '../components/HomePage/HeroSection';

export default function LandingPage() {
  const { setIsAuthModalOpen, setInitialMode, initialMode, isAuthModalOpen, isLoggedIn } =
    useMemberCenterContext();

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;

        // 當前滾動位置大於上次記錄的位置 (代表往下滑) 且不在最頂部時 -> 隱藏 Navbar
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setShowNavbar(false);
        } else {
          // 往上滑動時 -> 顯示 Navbar
          setShowNavbar(true);
        }

        // 判斷是否離開最頂部，用來加上文字背景效果，避免文字與頁面內容重疊
        if (currentScrollY > 20) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }

        // 更新最後的滾動位置
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // 清除監聽器
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-200 font-sans">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          // 0 = 回到原位 , -y-full = 向上100%的高度 , 也就是往上隱藏
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'bg-[#0a0e17]/80 backdrop-blur-md border-b border-white/10 shadow-lg'
            : 'bg-transparent py-2'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <HomePageButton />

          {!isLoggedIn ? (
            <div className="flex gap-5">
              <div className="flex">
                <ActionIconButton
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setInitialMode('signin');
                  }}
                  className="flex items-center bg-[#ffb347] hover:bg-orange-500 text-[#0a0e17] px-2 py-2 text-xs md:px-5 md:py-2 rounded-full md:text-sm font-bold transition"
                >
                  <LogIn className="mr-3" size={16} />
                  登入
                </ActionIconButton>
              </div>
              <div className="flex">
                <ActionIconButton
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setInitialMode('signup');
                  }}
                  className="flex items-center bg-[#ffb347] hover:bg-orange-500 text-[#0a0e17] px-2 py-2 text-xs md:px-5 md:py-2 rounded-full md:text-sm font-bold transition"
                >
                  <UserPlus className="mr-3" size={16} />
                  註冊
                </ActionIconButton>
              </div>
            </div>
          ) : (
            <ActionIconButton
              onClick={() => {
                router.push('dashboard');
              }}
              className="flex items-center bg-[#ffb347] hover:bg-orange-500 text-[#0a0e17] px-5 py-2 rounded-full text-sm font-bold transition"
            >
              <SquareChevronRight className="mr-3" />
              繼續專注
            </ActionIconButton>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto md:px-8 px-4 pt-24">
        <HeroSections />

        <ScrollReveal direction="left">
          <HowItWorksSection />
        </ScrollReveal>

        <ScrollReveal direction="right">
          <FocusModeSection />
        </ScrollReveal>

        {/* Science Section */}
        <ScrollReveal direction="left">
          <ScienceSection />
        </ScrollReveal>
      </main>

      {isAuthModalOpen && (
        <AuthModal onCloseAuthModal={() => setIsAuthModalOpen(false)} initialMode={initialMode} />
      )}
    </div>
  );
}
