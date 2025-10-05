'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { initSolitaire } from '../scripts/solitaire';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export default function GamePage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();

    useEffect(() => {
        // Cüzdan bağlı değilse start sayfasına yönlendir
        if (!isConnected || !address) {
            router.push('/start');
            return;
        }

        const setupPlayer = async () => {
            let currentPlayerId: string = address;

            try {
                // Farcaster kullanıcısı varsa ID al
                const fc = farcasterMiniApp() as any;
                const context = fc?.context;
                if (context?.user?.fid) {
                    currentPlayerId = `FID-${context.user.fid}`;
                } else if (context?.user?.username) {
                    currentPlayerId = context.user.username;
                }
            } catch (err) {
                console.warn('Farcaster user not found, fallback to wallet address');
            }

            // Her zaman string olmalı
            localStorage.setItem('currentPlayerId', currentPlayerId);

            // Oyunu başlat
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) return;

            initSolitaire(currentPlayerId);
        };

        setupPlayer();
    }, [isConnected, address, router]);

    return (
        <main
            id="game-container"
            style={{
                minHeight: '100dvh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#0A5323',
            }}
        >
            {/* Solitaire.js tarafından oyun render edilecek */}
            <div id="solitaire-root" />
        </main>
    );
}
