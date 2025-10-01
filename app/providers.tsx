// app/providers.tsx
'use client';

import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, mainnet } from 'wagmi/chains'; // Base ve Mainnet zincirlerini import edin
// 🚨 FARCASTER CONNECTOR'I BURADAN İMPORT EDİN
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// 1. Desteklenen Zincirleri ve Bağlantıları Tanımla
const config = createConfig({
  // Farcaster genellikle Base zinciri üzerinde çalıştığı için Base'i kullanmak yaygındır
  chains: [base, mainnet], 
  
  // 2. Connector'ları Tanımla
  connectors: [
    // 🚨 FARCASTER MİNİ APP CONNECTOR'I EKLE
    farcasterMiniApp(), // Sınıfı çağırıyoruz: farcasterMiniApp()
    
    // İsteğe bağlı olarak diğer connector'ları da ekleyebilirsiniz (ör: Injected, WalletConnect)
    // injected(), 
  ],
  
  // 3. RPC Transport'ları Tanımla
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    // Diğer zincirler için de RPC bağlantıları tanımlanabilir
  },
});

// React Query istemcisini oluştur
const queryClient = new QueryClient();

// Provider bileşenini oluştur
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}