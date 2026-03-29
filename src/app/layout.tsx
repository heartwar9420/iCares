import { FocusProvider } from '@/src/contexts/FocusContext';
import { TimerProvider } from '@/src/contexts/TimerContext';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { MemberCenterProvider } from '@/src/contexts/MemberCenterContext';
import { TodoProvider } from '../contexts/TodoContext';
import { TodosHistoryProvider } from '../contexts/TodosHistoryContext';
import { ChatProvider } from '../contexts/ChatContext';
import { ProfileProvider } from '../contexts/ProfileContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'iCares',
  description:
    'iCares 是一款結合護眼機制與科學化休息的生產力工具。透過神經重放與 20-20-20 法則，幫助長時間工作者在維持高效率專注的同時，保護眼睛健康。',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ProfileProvider>
          <ChatProvider>
            <MemberCenterProvider>
              <TodosHistoryProvider>
                <FocusProvider>
                  <TodoProvider>
                    <TimerProvider>{children}</TimerProvider>
                  </TodoProvider>
                </FocusProvider>
              </TodosHistoryProvider>
            </MemberCenterProvider>
          </ChatProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
