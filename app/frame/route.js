import { NextResponse } from "next/server";

// Next.js otomatik olarak BASE_URL'i alır, ancak Frame'ler için mutlak URL zorunludur.
// Bu değişkeni kendi Vercel domain'inizle değiştirin.
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app";
const FRAME_PATH = "/frame"; // Yeni FRAME rotası

// İlk Frame: Oyun başlatma ekranı
export async function GET() {
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster</title>
        <meta name="fc:frame" content="vNext" />
        
        <!-- KRİTİK: Mutlak URL ve public klasöründeki başlangıç görseli -->
        <meta name="fc:frame:image" content="${BASE_URL}/start-image.png" />
        
        <meta name="fc:frame:button:1" content="Play Now" />
        <meta name="fc:frame:button:1:action" content="post" />
        
        <!-- DÜZELTME: POST İSTEĞİ ARTIK YENİ FRAME YOLU OLAN /frame'e GİTMELİ -->
        <meta name="fc:frame:post_url" content="${BASE_URL}${FRAME_PATH}" />
      </head>
      <body>Frame başlangıç sayfası</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}

// Kullanıcı butona bastığında POST handler çalışır (Oyun Başladı)
export async function POST() {
  // Eğer butona basıldığında başka bir Frame göstermek istiyorsanız:
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster - Game Started</title>
        <meta name="fc:frame" content="vNext" />
        
        <!-- KRİTİK: Yeni oluşturduğunuz game.png görseli -->
        <meta name="fc:frame:image" content="${BASE_URL}/game.png" />
        
        <meta name="fc:frame:button:1" content="Open Game" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="${BASE_URL}" />
      </head>
      <body>Oyun başlıyor...</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}
