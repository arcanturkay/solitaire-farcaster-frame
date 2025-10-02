import { NextResponse, NextRequest } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const BASE_URL = "https://solitaire-farcaster-frame.vercel.app"; // BASE_URL tanımı eklendi

// --- GET METODU (Web sitesi FID çekme) ---
export async function GET(request: Request) {
  // ... (Sizin Neynar API ile FID çekme mantığınız buradadır)
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

// --- POST METODU (Butona Basılma Mantığı) ---
export async function POST(request: NextRequest) {
    // Bu test, body'yi okumadan hemen yanıt döndürerek
    // butona basma akışının çalışıp çalışmadığını kontrol eder.
    
    // Not: Normalde body'yi okumanız gerekir: const body = await request.json();

    const nextFrameMetadata = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Solitaire Farcaster - Game Started (POST Test)</title>
                <meta name="fc:frame" content="vNext" />
                
                <meta name="fc:frame:image" content="${BASE_URL}/game.png" />
                
                <meta name="fc:frame:button:1" content="Open Full Game" />
                <meta name="fc:frame:button:1:action" content="link" />
                <meta name="fc:frame:button:1:target" content="${BASE_URL}" />
            </head>
            <body>POST isteği başarılı!</body>
        </html>
    `;

    return new Response(nextFrameMetadata, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
