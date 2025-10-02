import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // YÖNLENDİRMELER: Farcaster Manifest için 307 Redirect kuralı
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster/route.ts',
        // Lütfen bu Destination URL'sinin sizin Farcaster Manifest URL'niz olduğundan emin olun.
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/0199a180-010f-d7c0-f073-6dcfbba5ed9c', 
        permanent: false, // 307 (Temporary) redirect için false olmalı.
        // statusCode: 307, // Next.js 'permanent: false' olduğunda bunu otomatik 307 yapar
      },
    ];
  },

  // CORS ve Güvenlik Başlıkları
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          // Frame'in sadece Farcaster içinde yerleştirilebileceğini belirten kritik güvenlik kuralı
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
