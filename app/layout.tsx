// app/layout.tsx
import { Providers } from './providers';
import type { Metadata } from 'next';

const FRAME_BASE_URL = "https://solitaire-farcaster-frame.vercel.app";

export const metadata: Metadata = {
    title: "Solitaire on Farcaster",
    openGraph: {
        images: [`${FRAME_BASE_URL}/start-image.png`],
    },
    other: {
        "fc:frame": "vNext",
        "fc:frame:image": `${FRAME_BASE_URL}/start-image.png`,
        "fc:frame:button:1": "Play Now",
        "fc:frame:post_url": `${FRAME_BASE_URL}/app/.well-known/farcaster`,
        "fc:miniapp": FRAME_BASE_URL,
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}
