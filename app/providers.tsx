'use client';

import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, mainnet } from 'wagmi/chains'; // Base ve Mainnet zincirleri
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// 1️⃣ Wagmi konfigürasyonunu oluştur
const config = createConfig({
  chains: [base, mainnet], // Base ve Mainnet üzerinde çalışıyoruz
  connectors: [
    farcasterMiniApp(), // Farcaster Mini App connector
    // injected(), // İstersen ek connector ekleyebilirsin
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

// 2️⃣ React Query istemcisini oluştur
const queryClient = new QueryClient();

// 3️⃣ Provider bileşeni
export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
  );
}