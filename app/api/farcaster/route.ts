// app/api/farcaster/route.ts
import { NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

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
        // Hata durumunda bile farcasterId olarak cüzdan adresini yollayalım.
        return NextResponse.json({ farcasterId: walletAddress });
    }

    const data = await neynarResponse.json();
    
    // Neynar'dan gelen verinin yapısı { "users": [ { "username": "...", ... } ] } şeklinde olabilir
    // Veya adresin altında { "0x...": [ { "username": "...", ... } ] }
    const users = data.users || (data[walletAddress.toLowerCase()] || []);

    if (users && users.length > 0 && users[0].username) {
        const farcasterId = users[0].username;
        return NextResponse.json({ farcasterId });
    } else {
        // Kullanıcı bulunamazsa, cüzdan adresini ID olarak geri gönder.
        return NextResponse.json({ farcasterId: walletAddress });
    }

  } catch (error) {
    console.error("Farcaster API Server Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}