import { NextResponse } from "next/server";

// Next.js otomatik olarak BASE_URL'i alır, ancak Frame'ler için mutlak URL zorunludur.
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app";
// KRİTİK DÜZELTME: Butona basıldığında Frame Mantığını işleyecek olan API rotası.
const FRAME_POST_PATH = "/api/farcaster"; 

// İlk Frame: Oyun başlatma ekranı (GET)
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
        
        <!-- DÜZELTME: POST İSTEĞİ ARTIK MANTIĞI İŞLEYEN /api/farcaster'a GİTMELİ -->
        <meta name="fc:frame:post_url" content="${BASE_URL}${FRAME_POST_PATH}" />
      </head>
      <body>Frame başlangıç sayfası</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}

// Kullanıcı butona bastığında POST handler çalışır (Bu metot artık kullanılmayacak, istek /api/farcaster'a gidecek)
// Bu metodu korumak yerine, butonu doğru yere yönlendirmemiz gerekiyor.
export async function POST() {
  // Bu metot artık Frame POST mantığı için kullanılmayacağı için,
  // kullanıcının gönderdiği eski POST yanıtını koruyarak bu dosya içindeki
  // POST'un bir Link aksiyonu döndürme amacına uygun bırakıyoruz.
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
        
        <!-- Oyunun tamamını oynamak için link veriliyor. Bu doğru. -->
        <meta name="fc:frame:button:1:target" content="${BASE_URL}" />
      </head>
      <body>Oyun başlıyor...</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}
