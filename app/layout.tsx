// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}

// ⚠ Mutlak URL, Vercel deploy sonrası değiştirin
const FRAME_BASE_URL = "https://solitaire-farcaster-frame.vercel.app";

export const metadata = {
    title: "Solitaire on Farcaster",
    openGraph: {
        images: [`${FRAME_BASE_URL}/start-image.png`],
    },
    other: {
        "fc:frame": "vNext",
        "fc:frame:image": `${FRAME_BASE_URL}/start-image.png`,
        "fc:frame:button:1": "Play Now",
        "fc:frame:post_url": `${FRAME_BASE_URL}/.well-known/farcaster`,
        "fc:miniapp": FRAME_BASE_URL,
    },
};
