import { NextResponse } from "next/server";

// Next.js otomatik olarak BASE_URL'i alır, ancak Frame'ler için mutlak URL zorunludur.
// Bu değişkeni kendi Vercel domain'inizle değiştirin.
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app";
// DÜZELTME YAPILDI: POST isteğinin gideceği, layout.js'te tanımlanan /api/farcaster yolu kullanılıyor.
// Not: Bu, app/api/farcaster/route.ts dosyanızın butona basılma mantığını işlediği anlamına gelir.
const FRAME_POST_PATH = "/api/farcaster"; 

// İlk Frame: Oyun başlatma ekranı (GET)
// Bu rota (https://solitaire-farcaster-frame.vercel.app/frame) Frame'i başlatır.
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
        
        <!-- KRİTİK DÜZELTME: POST İSTEĞİ ARTIK LAYOUT'TAKİ İLE EŞLEŞECEK ŞEKİLDE /api/farcaster'a GİTMELİ -->
        <meta name="fc:frame:post_url" content="${BASE_URL}${FRAME_POST_PATH}" />
      </head>
      <body>Frame başlangıç sayfası</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}

// Kullanıcı butona bastığında POST handler çalışır (Oyun Başladı)
// Bu POST handler'ı butona basılma mantığını içeren app/api/farcaster/route.ts dosyanız tarafından işlenmelidir.
export async function POST() {
  // Bu POST metodu artık kullanılmayacak, istek /api/farcaster'a yönlendirilecek.
  // Bu metot, /frame URL'sine POST geldiğinde çalışır, ancak Frame artık /api/farcaster'a yönlendirildiği için buraya gelmemelidir.
  
  // Frame mantığını /api/farcaster'a taşıdığınızı varsayarak, burayı sadece Link aksiyonu için kullanıyoruz.
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
