// app/page.tsx'
'use client';

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, base, zora, optimism } from 'wagmi/chains';

// farcasterMiniApp default export olarak içeri aktarılıyor
import farcasterMiniApp from '@farcaster/frame-wagmi-connector';

// 1. Desteklenen zincirleri tanımlayın
const chains = [base, mainnet, optimism, zora] as const;

// 2. Query Client'i bileşen dışında oluşturun (SSR'de sorun yaratmaz)
const queryClient = new QueryClient();

// 3. Providers bileşenini tanımlayın
export function Providers({ children }: { children: React.ReactNode }) {
  // WAGMI/RAINBOWKIT KONFİGÜRASYONUNU BİLEŞENİN İÇİNE TAŞIYORUZ
  // Bu, konfigürasyonun yalnızca tarayıcı tarafında ('use client' ile) çalışmasını sağlar.

  // 3a. RainbowKit'in varsayılan yapılandırmasını alın
  const rainbowkitConfig = getDefaultConfig({
    appName: 'Farcaster Solitaire',
    projectId: 'LÜTFEN_KENDİ_WALLETCONNECT_PROJECT_ID_NİZİ_GİRİN',
    chains: chains,
  });

  // 3b. Transport nesnesini oluşturun
  const transports = Object.fromEntries(
    rainbowkitConfig.chains.map(chain => [chain.id, http()])
  ) as Record<(typeof chains)[number]['id'], ReturnType<typeof http>>;

  // 3c. Wagmi yapılandırmasını oluşturun
  const wagmiConfig = createConfig({
    // Farcaster konektörünü listenin başına ekliyoruz
    connectors: [
      farcasterMiniApp(), // Farcaster'ı öncelikli yap
    ],
    
    // Zincirler RainbowKit config'inden alınır
    chains: rainbowkitConfig.chains,
    
    // Oluşturulan transport nesnesini kullanıyoruz
    transports: transports,
    
    // Depolama ayarları RainbowKit config'inden alınır
    storage: rainbowkitConfig.storage, 
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#4338CA', // Koyu mavi Farcaster tonu
            borderRadius: 'small',
          })}
          initialChain={base} // Başlangıç zincirini Base olarak ayarla
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
