import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Redirects varsa, embed için final URL kullanın
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },

  // Header ayarları
  async headers() {
    return [
      {
        source: '/:path*', // Tüm sayfalara uygulanacak
        headers: [
          // Her yerden erişim (CORS)
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          // Embed izinleri: sadece Farcaster domain’i
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors https://www.farcaster.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
