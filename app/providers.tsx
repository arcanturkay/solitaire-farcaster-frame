'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme, // Karanlık temayı RainbowKit için kullanıyoruz
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { mainnet, base, zora, optimism } from 'wagmi/chains'; // Farcaster genelde Base üzerinde olduğu için Base'i ekleyelim

// 1. Wagmi Config Tanımlanıyor
const config = getDefaultConfig({
  appName: 'Farcaster Solitaire',
  projectId: '4d22f8d532080f5a4d1c3bffcc87ce52', // ⚠️ Buraya kendi WalletConnect Proje ID'nizi eklemelisiniz.
  chains: [base, mainnet, optimism, zora],
  ssr: true, // Next.js sunucu tarafında render için
});

// 2. React Query Client Tanımlanıyor (RainbowKit ve Wagmi'nin gereksinimi)
const queryClient = new QueryClient();

// 3. Sağlayıcı Bileşeni (Wrapper)
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#4c2d7f', // Farcaster mavisine yakın bir ton
            borderRadius: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}