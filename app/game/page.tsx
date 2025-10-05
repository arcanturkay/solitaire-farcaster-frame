'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { initSolitaire } from '../scripts/solitaire';

export default function GamePage() {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (!isConnected || !address) return; // Wallet bağlı değilse çık

        const playerId = localStorage.getItem('currentPlayerId') || address;

        // Oyun başlat
        initSolitaire(playerId);
    }, [isConnected, address]);

    return (
        <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#0A5323' }}>
            <div id="game-container" />
        </main>
    );
}
