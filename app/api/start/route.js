import { NextResponse } from "next/server";

const BASE_URL = "https://solitaire-farcaster-frame.vercel.app";

// İlk embed check için GET handler (Preview tool burayı GET ile çağırır)
export async function GET() {
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster</title>
        <meta name="fc:frame" content="vNext" />
        
        <!-- DÜZELTME: Dosya adınız start-image.png olduğu varsayıldı -->
        <meta name="fc:frame:image" content="${BASE_URL}/start-image.png" />
        
        <meta name="fc:frame:button:1" content="Play Now" />
        <meta name="fc:frame:button:1:action" content="post" />
        
        <!-- DÜZELTME: Butona basıldığında, bu dosyadaki POST handler'ının çalışması için BASE_URL'e POST yapıyoruz. -->
        <meta name="fc:frame:post_url" content="${BASE_URL}" />
      </head>
      <body>Frame başlangıç sayfası</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}

// Kullanıcı butona bastığında POST handler çalışır
export async function POST() {
  // Eğer butona basıldığında başka bir Frame göstermek istiyorsanız:
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster - Game Started</title>
        <meta name="fc:frame" content="vNext" />
        
        <!-- DÜZELTME: İkinci görsel için de mutlak URL kullanın ve dosya adını kontrol edin. -->
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
