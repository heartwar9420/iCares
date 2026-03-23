'use client';
// motion 用來取代 div , Variants 給TypeScript用的型別
import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'left' | 'right';
}

export default function ScrollReveal({ children, direction = 'right' }: ScrollRevealProps) {
  const variants: Variants = {
    // 起始狀態
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0,
    },
    // 終點狀態
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      // 花費1.0秒
      transition: {
        duration: 1.0,
        ease: 'easeOut',
      },
    },
  };

  return (
    // 建立一個 motion的div
    <motion.div
      // initial = 初始狀態
      initial="hidden"
      // whileInView = 當出現在畫面上時 切換成visible 狀態
      whileInView="visible"
      // viewport = 觸發條件 once = 只一次 , amount : 0.2  = 露出 20%
      viewport={{ once: true, amount: 0.1 }}
      // 綁上我們寫好的條件
      variants={variants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
