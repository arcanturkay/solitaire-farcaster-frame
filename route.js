// app/api/start-game/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  // OYUNUN GERÇEK URL'si: İlk deploy'dan sonra GÜNCELLEYİN!
  const gameUrl = "https://solitaire-farcaster-frame-kzcfo3khp-arcanturkays-projects.vercel.app";

  // Farcaster istemcisinin kullanıcıyı direkt oyuna yönlendirmesi için 302 yönlendirmesi.
  return NextResponse.redirect(gameUrl, { status: 302 });
}
