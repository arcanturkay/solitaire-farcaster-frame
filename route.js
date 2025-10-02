import { NextResponse } from 'next/server';
import { URLSearchParams } from 'url';

// GÜNCELLENDİ: Ana domain adınız
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app";
const API_ROUTE = `${BASE_URL}/api/start-game`;

// Yeşil arka plan rengi (Daha önce konuştuğumuz kırçıllı yeşil)
const GREEN_COLOR = "#38761D";

// Frame görseli artık bir SVG olarak API içinde oluşturuluyor.
function getStartFrameSVG() {
  const WIDTH = 1200; // Farcaster standart genişlik
  const HEIGHT = 630; // Farcaster standart yükseklik

  // Kırçıllı yeşil arka plan ve beyaz metin içeren SVG
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="${GREEN_COLOR}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" fill="white">
        Farcaster Solitaire Başlangıç Ekranı
      </text>
      <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#EEEEEE">
        Oyuna Başlamak İçin Butona Tıklayın
      </text>
    </svg>
  `;

  // SVG içeriğini Base64 olarak kodlayıp bir data URL'si oluştururuz
  const svgBase64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${svgBase64}`;
}


function getStartFrameHTML(imageUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster</title>
        
        <!-- TÜRKÇE KARAKTER DÜZELTMESİ -->
        <meta charset="UTF-8">

        <!-- Frame Sürümü -->
        <meta property="fc:frame" content="vNext" />
        
        <!-- BAŞLANGIÇ GÖRSELİ (Şimdi SVG Base64 URL'sini kullanıyor) -->
        <meta property="fc:frame:image" content="${imageUrl}" />
        
        <!-- POST EDİLECEK ADRES -->
        <meta property="fc:frame:post_url" content="${API_ROUTE}" />
        
        <!-- BUTON: Oyuna Başla -->
        <meta property="fc:frame:button:1" content="Oyuna Başla" />
        <meta property="fc:frame:button:1:action" content="post" />

      </head>
      <body>Farcaster Solitaire Başlangıç Ekranı</body>
    </html>
  `;
}

// 1. GET İŞLEYİCİSİ (Frame'in İlk Yüklenmesi ve Preview Tool için)
export async function GET() {
    // Görseli SVG olarak oluştur
    const svgDataUrl = getStartFrameSVG();
    
    // SVG URL'sini kullanarak HTML oluştur ve döndür
    return new NextResponse(getStartFrameHTML(svgDataUrl), {
        headers: {
            'Content-Type': 'text/html', 
        },
    });
}

// 2. POST İŞLEYİCİSİ (Kullanıcı "Oyuna Başla" butonuna tıkladıktan sonra)
export async function POST(request) {
    // Kullanıcı butona tıkladığında onu oyunun gerçek URL'sine yönlendirir.
    return NextResponse.redirect(BASE_URL, { 
        status: 302, 
    });
}