import { NextResponse } from "next/server";

// Next.js otomatik olarak BASE_URL'i alır, ancak Frame'ler için mutlak URL zorunludur.
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app";
// KRİTİK DÜZELTME: Butona basıldığında Frame Mantığını işleyecek olan API rotası.
// ARTIK İSTEK /api/start-game'E GİDECEK
const FRAME_POST_PATH = "/api/start-game"; 

// İlk Frame: Oyun başlatma ekranı (GET) - Farcaster'ın ilk baktığı yer burasıdır.
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
        
        <!-- KRİTİK: POST İSTEĞİ ARTIK MANTIĞI İŞLEYEN /api/start-game'E GİTMELİ -->
        <meta name="fc:frame:post_url" content="${BASE_URL}${FRAME_POST_PATH}" />
      </head>
      <body>Frame başlangıç sayfası</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}

// Bu POST metodu, istek /api/start-game'e yönlendirildiği için artık kullanılmayacaktır.
// Ancak dosyada bulunması, Next.js'in rota tanımı için bir güvenlik katmanı sağlar.
export async function POST() {
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster - Game Started</title>
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="${BASE_URL}/game.png" />
        <meta name="fc:frame:button:1" content="Open Game" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="${BASE_URL}" />
      </head>
      <body>Yönlendirme bekleniyor...</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}
