// app/layout.js
import './globals.css';

// VERCEL'DEN ALDIĞINIZ GERÇEK CANLI URL'Yİ BURAYA YAPIŞTIRIN!
// Örn: https://solitaire-farcaster-frame-xxxx.vercel.app
const FRAME_URL = "https://solitaire-farcaster-frame.vercel.app/"; 

export const metadata = {
  title: 'Farcaster Solitaire',
  description: 'Play Solitaire right inside a Farcaster Frame.',
  
  // FRAME META TAGS: Farcaster'a oyunun başlangıcını bildirir.
  other: {
    'fc:frame': 'vNext',
    
    // Projenizin public klasöründeki start-image.png dosyasını gösterir.
    'fc:frame:image': `${FRAME_URL}/start-image.png`, 
    
    // Kullanıcı butona tıkladığında isteği göndereceği API yolu (route.js).
    'fc:frame:post_url': `${FRAME_URL}/api/farcaster`, 
    
    // Frame'deki ilk butonun metni.
    'fc:frame:button:1': 'Start Game (Farcaster Login)', 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Next.js, metadata objesindeki tüm tag'leri otomatik olarak <head> içine yerleştirir. 
        Bu yüzden ekstra bir <head> etiketi yazmamıza gerek yok.
      */}
      <body>{children}</body>
    </html>
  );
}