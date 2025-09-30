import { NextResponse } from 'next/server';

// Domain adınızı burada güncellerseniz, Frame URL'leri otomatik güncellenecektir.
const BASE_URL = "https://solitaire-farcaster-frame-kzcfo3khp-arcanturkays-projects.vercel.app";
const API_ROUTE = `${BASE_URL}/api/start-game`;

// Oyunun başlangıç görselinin URL'si (Bu görselin projenizin 'public' klasöründe olduğundan emin olun.)
const IMAGE_URL = `${BASE_URL}/splash.png`; 

// Farcaster Frame meta etiketlerini içeren HTML'i oluşturur.
function getStartFrameHTML() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster</title>
        
        <!-- FRAME SÜRÜMÜ -->
        <meta property="fc:frame" content="vNext" />
        
        <!-- BAŞLANGIÇ GÖRSELİ -->
        <meta property="fc:frame:image" content="${IMAGE_URL}" />
        
        <!-- POST EDİLECEK ADRES (Butona tıklandığında buraya POST yapılır) -->
        <meta property="fc:frame:post_url" content="${API_ROUTE}" />
        
        <!-- BUTON TANIMI: Bu butona tıklayınca POST isteği tetiklenir -->
        <meta property="fc:frame:button:1" content="Oyuna Başla" />
        <meta property="fc:frame:button:1:action" content="post" />

      </head>
      <body>Farcaster Solitaire Başlangıç Ekranı</body>
    </html>
  `;
}

// 1. GET İŞLEYİCİSİ (Frame'in İlk Yüklenmesi ve Preview Tool için GEREKLİ)
export async function GET() {
    console.log('GET isteği alındı: Frame meta etiketleri döndürülüyor.');
    return new NextResponse(getStartFrameHTML(), {
        headers: {
            // Farcaster'ın okuması için içerik tipini HTML olarak ayarlıyoruz.
            'Content-Type': 'text/html', 
        },
    });
}

// 2. POST İŞLEYİCİSİ (Kullanıcı "Oyuna Başla" butonuna tıkladıktan sonra çalışır)
export async function POST(request) {
    const body = await request.json();
    console.log('POST isteği alındı, kullanıcı oyuna yönlendiriliyor.', body);
    
    // Farcaster, kullanıcının butona tıkladıktan sonra oyunun gerçek URL'sine yönlendirilmesini sağlar (Mini App).
    return NextResponse.redirect(BASE_URL, { 
        status: 302, // 302: Geçici olarak başka bir adrese yönlendir.
    });
}
