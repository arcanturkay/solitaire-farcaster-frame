// app/game/page.tsx
'use client';

import { useEffect } from 'react';
import '/styles/solitaire.css';
import { initSolitaire } from '../scripts/solitaire';
import { useAccount } from 'wagmi';

export default function GamePage() {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        const setupPlayer = () => {
            // 1️⃣ Local storage'dan mevcut player ID'yi al
            let currentPlayerId = localStorage.getItem('currentPlayerId');

            if (!currentPlayerId) {
                // 2️⃣ Farcaster Mini App context kontrolü
                const fcContext = (window as any)?.farcaster?.context;
                if (fcContext?.user?.fid) {
                    currentPlayerId = `FID-${fcContext.user.fid}`;
                } else if (fcContext?.user?.username) {
                    currentPlayerId = `@${fcContext.user.username}`;
                } else if (isConnected && address) {
                    // 3️⃣ Wallet fallback: kısa address
                    currentPlayerId = address.slice(0, 6) + '...' + address.slice(-4);
                } else {
                    currentPlayerId = 'Guest';
                }

                localStorage.setItem('currentPlayerId', currentPlayerId);
            }

            // 4️⃣ Oyunu başlat
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) return;

            initSolitaire(currentPlayerId);
        };

        setupPlayer();
    }, [isConnected, address]);

    return (
        <div id="game-container" className="game-container">
            <h1>Solitaire</h1>
            <div className="score-display">Score: 0</div>
            <div id="current-player-status"></div>

            <div className="top-piles">
                <div className="stock-waste-piles">
                    <div id="stock" className="pile"><div className="pile-placeholder"></div></div>
                    <div id="waste" className="pile"><div className="pile-placeholder"></div></div>
                </div>
                <div className="foundation-piles">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="pile foundation"><div className="pile-placeholder"></div></div>
                    ))}
                </div>
            </div>

            <div className="tableau-piles">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="pile tableau"></div>
                ))}
            </div>

            <div className="controls">
                <button className="new-game-btn">New Game</button>
                <button id="leaderboard-btn" className="control-btn">Leaderboard</button>
                <button id="auto-finish-btn" className="control-btn" style={{ display: 'none' }}>Auto-Finish</button>
            </div>

            <div id="win-modal" className="modal-overlay">
                <div className="modal-content">
                    <h2>You Win!</h2>
                    <p id="final-score"></p>
                    <p>Score saved for: <span id="winning-player-name"></span></p>
                    <button className="new-game-btn play-again-btn">Play Again</button>
                </div>
            </div>

            <div id="leaderboard-modal" className="modal-overlay">
                <div className="modal-content">
                    <h2>Leaderboard (Accumulated Score)</h2>
                    <table id="leaderboard-table">
                        <thead><tr><th>Rank</th><th>Name</th><th>Total Score</th></tr></thead>
                        <tbody></tbody>
                    </table>
                    <button id="close-leaderboard-btn" className="control-btn">Close</button>
                </div>
            </div>
        </div>
    );
}
