import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true, // 308
      },
      {
        source: '/temp-path',
        destination: '/new-temp-path',
        permanent: false, // 307
      },
      {
        source: '/custom-path',
        destination: '/new-custom-path',
        statusCode: 302, // manuel
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*', // Tüm sayfalara uygulansın
        headers: [
          // CORS: her yerden erişim
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          // Embed izinleri: Farcaster domain’i
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.farcaster.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
