'use client';
import { useEffect } from 'react';
import '/styles/solitaire.css';
import { initSolitaire } from '../scripts/solitaire';
import { useAccount } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export default function GamePage() {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        const setupPlayer = () => {
            let currentPlayerId = localStorage.getItem('currentPlayerId');

            if (!currentPlayerId && isConnected && address) {
                try {
                    const context = window?.farcaster?.context;
                    if (context?.user?.fid) {
                        currentPlayerId = `FID-${context.user.fid}`;
                    } else if (context?.user?.username) {
                        currentPlayerId = `@${context.user.username}`;
                    } else {
                        currentPlayerId = address.slice(0,6) + '...' + address.slice(-4);
                    }

                    localStorage.setItem('currentPlayerId', currentPlayerId);
                } catch (err) {
                    console.warn('Could not fetch Farcaster user:', err);
                    currentPlayerId = 'Guest';
                }
            }

            // Oyunu başlat
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) return;
            initSolitaire(currentPlayerId || 'Guest');
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
