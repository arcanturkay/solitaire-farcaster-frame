import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "Solitaire on Farcaster",
    slug: "solitaire-frame",
    version: "0.1.0",
    entrypoint: "https://solitaire-farcaster-frame.vercel.app/",
    author: "Arcan Türkay"
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*', // embed validator için
      'Content-Type': 'application/json'
    }
  });
}
