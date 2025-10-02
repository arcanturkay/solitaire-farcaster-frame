import { NextResponse } from 'next/server';

// Next.js otomatik olarak BASE_URL'i alır, ancak Frame'ler için mutlak URL zorunludur.
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app";

// 2. POST İŞLEYİCİSİ (Kullanıcı "Play Now" butonuna tıkladıktan sonra çalışır)
// Bu fonksiyon, kullanıcıyı Frame'den oyunun ana URL'sine yönlendirir.
export async function POST(request) {
    // Farcaster'dan gelen POST body'yi okuyoruz (işlem yapmasak bile okumalıyız).
    try {
        await request.json(); 
    } catch (e) {
        console.error("Farcaster POST body okuma hatası:", e);
    }
    
    // Mini Uygulama modunu tetiklemek için ana URL'ye bir sorgu parametresi ekle:
    // Bu parametre (`?start=true`), page.tsx'in cüzdanı otomatik bağlamasını sağlayacaktır.
    const redirectUrl = `${BASE_URL}?start=true`; 

    // 302 yönlendirmesi ile kullanıcıyı oyunun gerçek URL'sine gönderiyoruz.
    // Bu yönlendirme Farcaster'da Mini Uygulama görünümünü tetikler.
    return NextResponse.redirect(redirectUrl, { 
        status: 302, // 302: Geçici olarak başka bir adrese yönlendir.
    });
}

// 1. GET İŞLEYİCİSİ (Debug/Test amaçlı)
export async function GET() {
    return NextResponse.json({ status: 'OK', message: 'Solitaire Start Game API' });
}
