'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Gerçek providers bileşenini burada dinamik ve SSR olmadan yüklüyoruz.
// .then() kullanarak named export'u doğru şekilde alıyoruz.
const DynamicProviders = dynamic(() => import('./providers').then(mod => mod.Providers), {
  ssr: false,
  loading: () => <p>Loading...</p> // Yüklenirken basit bir gösterge
});

// Bu bileşen, çocuklarını (yani tüm uygulamayı) dinamik olarak yüklenen
// provider'lar ile sarmalar.
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <DynamicProviders>{children}</DynamicProviders>;
}