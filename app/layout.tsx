// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// VERCEL'DEN ALDIĞINIZ GERÇEK CANLI URL'Yİ BURAYA YAPIŞTIRIN!
// Örn: https://solitaire-farcaster-frame-xxxx.vercel.app
const FRAME_URL = "https://vercel.com/arcanturkays-projects/solitaire-farcaster-frame"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata objesini güncelleyin: Farcaster Frame etiketleri burada tanımlanır.
export const metadata: Metadata = {
  title: "Farcaster Solitaire Frame",
  description: "Play Solitaire right inside a Farcaster Frame.",
  
  // FRAME META ETİKETLERİ: Frame'in ana işlevi bu alanda tanımlanır.
  other: {
    'fc:frame': 'vNext',
    
    // public klasöründeki görseli gösterir.
    'fc:frame:image': `${FRAME_URL}/start-image.png`, 
    
    // Kullanıcı butona tıkladığında isteği göndereceği API yolu.
    'fc:frame:post_url': `${FRAME_URL}/api/start-game`, 
    
    // Frame'deki buton metni.
    'fc:frame:button:1': 'Start Game (Farcaster Login)', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}