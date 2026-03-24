import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // 關閉嚴格模式
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dcntwimrizwnvpvpiwek.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
