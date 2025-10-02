/** @type {import('next').NextConfig} */
const nextConfig = {
    // --- Yönlendirmeyi Rewrites olarak değiştiriyoruz ---
    async rewrites() {
        return [
            {
                // Manifest yolu her zaman bu şekilde olmalıdır.
                source: '/.well-known/farcaster.json',
                // Destination URL'si Farcaster Hosted Manifest adresinizdir.
                destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/0199a180-010f-d7c0-f073-6dcfbba5ed9c',
            },
        ];
    },
    // Farcaster Mini Uygulamasının iFrame'e alınmasını sağlayan KRİTİK güvenlik başlıkları.
    async headers() {
        return [
            {
                // Tüm yollara uygulanır
                source: '/(.*)',
                headers: [
                    // GEREKLİ: Uygulamanın iFrame'e alınmasına izin verir.
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOWALL', 
                    },
                    {
                        // GEREKLİ: Mini Uygulama için CSP'yi esnetir ve Farcaster/Warpcast adreslerine izin verir.
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors 'self' https://warpcast.com https://miniapps.vercel.app https://frames.warpcast.com",
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                ],
            },
        ];
    },
    // redirects fonksiyonunu kaldırıyoruz.
};

module.exports = nextConfig;
