import { Providers } from './providers';
import type { Metadata } from 'next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Solitaire on Farcaster",
  openGraph: {
    images: ["https://solitaire-farcaster-frame.vercel.app/splash.png"],
  },
  other: {
    // Farcaster Frame tagleri
    "fc:frame": "vNext",
    "fc:frame:image": "https://solitaire-farcaster-frame.vercel.app/splash.png",
    "fc:frame:button:1": "Play Now",
    "fc:frame:post_url": "https://solitaire-farcaster-frame.vercel.app/api/start",
  },
};
