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
  // Sadece web sitesi başlığı ve openGraph bilgileri kalmalı.
  title: "Solitaire on Farcaster",
  openGraph: {
    images: ["https://solitaire-farcaster-frame.vercel.app/start-image.png"],
  },
  
  // Farcaster Frame etiketleri buradan tamamen kaldırılmıştır
  // çünkü bu işlevi app/frame/route.js (veya root klasördeki Frame handler) üstlenmiştir.
  // 'other' objesinin tamamı bu dosyadan silinmelidir.
  // other: { ... } kısmı silindi.
};
