// Bu dosyada, API anahtarınızı doğrudan kullanacağız.
// Güvenlik için, bu anahtarı bir ortam değişkeni (Environment Variable) olarak saklayın.
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function GET(request: Request) {
  // 1. İsteğin URL'sinden cüzdan adresini alın
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('address');

  if (!walletAddress) {
    return new Response(JSON.stringify({ error: 'Missing wallet address' }), { status: 400 });
  }

  if (!NEYNAR_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server API key not configured' }), { status: 500 });
  }

  try {
    // 2. Gizli API anahtarını kullanarak Neynar'a istek atın
    const neynarResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${walletAddress}&viewer_fid=1`, {
      method: 'GET',
      headers: {
        'api_key': NEYNAR_API_KEY, // ANAHTAR ARTIK SADECE BURADA KULLANILIYOR
        'accept': 'application/json'
      }
    });

    // 3. Neynar'dan gelen yanıtı direkt istemciye geri gönderin
    const data = await neynarResponse.json();
    
    if (!neynarResponse.ok) {
        // Neynar'dan gelen hata durumlarını (404, 401 vb.) iletin
        return new Response(JSON.stringify(data), { status: neynarResponse.status });
    }

    // Kullanıcı adını bulup sadece onu döndürelim
    let farcasterId = walletAddress;
    if (data.users && data.users.length > 0) {
        farcasterId = `@${data.users[0].username}`;
    }

    return new Response(JSON.stringify({ farcasterId }), { status: 200 });

  } catch (error) {
    console.error("Farcaster Sunucu Hatası:", error);
    return new Response(JSON.stringify({ error: 'Internal server error during Farcaster lookup' }), { status: 500 });
  }
}