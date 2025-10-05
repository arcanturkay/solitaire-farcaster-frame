'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { initSolitaire } from '../scripts/solitaire';

export default function GamePage() {
    useEffect(() => {
        const currentPlayerId = localStorage.getItem('currentPlayerId');
        if (!currentPlayerId) return; // cüzdan yoksa başlatma

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        initSolitaire(currentPlayerId);
    }, []);

    return (
        <main style={{ minHeight: '100dvh', background: '#0A5323', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div id="game-container"></div>
        </main>
    );
}
