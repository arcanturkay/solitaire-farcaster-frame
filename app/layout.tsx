// app/layout.tsx
import { Providers } from './providers';
import type { Metadata } from 'next';
// GamePage import'u RootLayout'ta kullanılmadığı için kaldırıldı.

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <Providers>
            {children} {/* Page.js buraya otomatik render olacak */}
        </Providers>
        </body>
        </html>
    );
}

// ⚠️ DİKKAT: Mutlak URL'niz: https://solitaire-farcaster-frame.vercel.app
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
        "fc:frame:post_url": `${FRAME_BASE_URL}/api/start-game`,
        
        // ✨ YENİ EKLEME: Mini App geçerliliğini ve Frame'in yetkisini onaylar.
        // Bu, alan adınız Warpcast'te doğrulandığı için önemlidir.
        "fc:miniapp": FRAME_BASE_URL, 
    },
};
