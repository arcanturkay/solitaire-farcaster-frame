'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Yüklenirken gösterilecek bir bileşen (Placeholder)
const LoadingFallback = () => (
    <div className="flex min-h-screen items-center justify-center bg-[#111] text-white">
        <div className="text-xl font-bold p-4 rounded-lg bg-gray-800 shadow-xl animate-pulse">
            Cüzdan Bağlantısı Kuruluyor...
        </div>
    </div>
);

// GameClient bileşenini, SSR'yi devre dışı bırakarak dinamik olarak yüklüyoruz.
// Bu yükleme, 'use client' etiketi sayesinde artık sorunsuz çalışacaktır.
const GameClient = dynamic(() => import('../components/GameClient'), {
    ssr: false, 
    loading: LoadingFallback, // Yüklenirken gösterilecek bileşen
});

// HomePage artık tamamen bir İstemci Bileşeni olarak çalışacak.
// Bu, dinamik yükleme (dynamic import) ve Wagmi'nin hook'larını
// kullanan tüm bileşenlerin yalnızca tarayıcıda oluşturulmasını garanti eder.
export default function HomePage() {
    return (
        <GameClient />
    );
}
