import { NextResponse, NextRequest } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
// BASE_URL'i Frame yanıtlarında kullanmak için tanımlıyoruz
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app"; 

// --- GET METODU (Web sitesi FID çekme) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('address');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
  }

  if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server API key not configured' }, { status: 500 });
  }

  try {
    const neynarResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${walletAddress.toLowerCase()}`, {
      method: 'GET',
      headers: {
        'api_key': NEYNAR_API_KEY,
        'accept': 'application/json'
      }
    });

    if (!neynarResponse.ok) {
        const errorData = await neynarResponse.json();
        console.warn(`Neynar API error for address ${walletAddress}:`, errorData);
        return NextResponse.json({ farcasterId: walletAddress });
    }

    const data = await neynarResponse.json();
    
    const users = data.users || (data[walletAddress.toLowerCase()] || []);

    if (users && users.length > 0 && users[0].username) {
        const farcasterId = users[0].username;
        return NextResponse.json({ farcasterId });
    } else {
        return NextResponse.json({ farcasterId: walletAddress });
    }

  } catch (error) {
    console.error("Farcaster API Server Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- POST METODU (Butona Basılma Mantığı - FRAME RESPONSE) ---
// Bu metot, /api/farcaster rotasına POST geldiğinde çalışır.
export async function POST(request: NextRequest) {
    // Farcaster'dan gelen isteği doğrulamak için body'yi okuyabilirsiniz,
    // ancak şu an sadece Frame'in çalıştığını doğrulamak için sabit bir yanıt döndürelim.
    
    // const body = await request.json(); // Gerekirse veriyi buradan okursunuz.

    const nextFrameMetadata = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Solitaire Farcaster - Game Started</title>
                <meta name="fc:frame" content="vNext" />
                
                <meta name="fc:frame:image" content="${BASE_URL}/game.png" />
                
                <meta name="fc:frame:button:1" content="Open Full Game" />
                <meta name="fc:frame:button:1:action" content="link" />
                <meta name="fc:frame:button:1:target" content="${BASE_URL}" />
            </head>
            <body>Oyun başladı! Butona basma başarılı oldu.</body>
        </html>
    `;

    return new Response(nextFrameMetadata, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
