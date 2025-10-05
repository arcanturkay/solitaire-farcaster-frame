// app/layout.tsx
import { Providers } from './providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Solitaire on Farcaster",
    other: {
        "fc:frame": "vNext",
        "fc:frame:image": "https://solitaire-farcaster-frame.vercel.app/start-image.png",
        "fc:frame:button:1": "Play Now",
        "fc:frame:post_url": "https://solitaire-farcaster-frame.vercel.app/app/.well-known/farcaster",
        "fc:miniapp": "https://solitaire-farcaster-frame.vercel.app",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head />
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
