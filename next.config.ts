// next.config.ts
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
                statusCode: 302, // custom
            },
        ];
    },
};

export default nextConfig;