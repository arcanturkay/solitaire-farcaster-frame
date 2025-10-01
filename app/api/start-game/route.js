import { NextResponse } from 'next/server';

// ⚠️ DİKKAT: Bu URL'yi uygulamanızın gerçek canlı domain adresiyle güncelleyin.
// VERCEL'DEN ALDIĞINIZ GERÇEK CANLI URL'Yİ BURAYA YAPIŞTIRIN!
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app/";
// Kullanıcı butona tıkladığında isteğin gideceği API yolu. Kendi yolu olduğu için BASE_URL'de kalabilir.
const API_ROUTE = `${BASE_URL}/api/start-game`;

// Oyunun başlangıç görselinin URL'si (Bu görselin projenizin 'public' klasöründe olduğundan emin olun.)
// Frame'in ilk yüklendiğinde göstereceği görseldir.
const IMAGE_URL = `${BASE_URL}/start-image.png`; 

// Farcaster Frame meta etiketlerini içeren HTML'i oluşturur.
function getStartFrameHTML() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster</title>
        
        <!-- Frame'i okuyabilmesi için Farcaster protokol sürümü -->
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
// Bir Frame, bir sohbette paylaşıldığında, Farcaster client'ı önce bu GET isteğini gönderir.
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
// Frame'de butona tıklandığında bu POST isteği tetiklenir.
export async function POST(request) {
    const body = await request.json();
    
    // Farcaster, kullanıcının butona tıkladıktan sonra oyunun gerçek URL'sine yönlendirilmesini sağlar (Mini App).
    // Bu Frame'i oyunun ana URL'sine (BASE_URL) yönlendirir.
    console.log('POST isteği alındı, kullanıcı oyuna yönlendiriliyor.');
    
    return NextResponse.redirect(BASE_URL, { 
        status: 302, // 302: Geçici olarak başka bir adrese yönlendir.
    });
}
