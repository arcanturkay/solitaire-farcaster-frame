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
        <meta name="fc:frame:image" content="${BASE_URL}/splash.png" />
        <meta name="fc:frame:button:1" content="Play Now" />
        <meta name="fc:frame:button:1:action" content="post" />
        <meta name="fc:frame:post_url" content="${BASE_URL}/api/start" />
      </head>
      <body>Frame başlangıç sayfası</body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}

// Kullanıcı butona bastığında POST handler çalışır
export async function POST() {
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Solitaire Farcaster</title>
        <meta name="fc:frame" content="vNext" />
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
