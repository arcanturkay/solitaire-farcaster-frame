'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function StartPage() {

    const [showOptions, setShowOptions] = useState(false);

    const handleWalletClick = (wallet: 'farcaster' | 'coinbase') => {
        setShowOptions(false);

        const walletUserId = wallet === 'farcaster' ? '@farcasterUser' : '@coinbaseUser';

        localStorage.setItem('currentPlayerId', walletUserId);

        window.location.href = '/game';
    };

    const handleTestPlay = () => {
        // Direkt test oyuncusu ile başlat
        localStorage.setItem('currentPlayerId', 'TestPlayer');
        window.location.href = '/game';
    };

    return (
        <main style={{
            minHeight: '100dvh',
            display: 'grid',
            placeItems: 'center',
            background: '#0A5323',
            color: 'white',
            textAlign: 'center',
            padding: 24,
            position: 'relative'
        }}>
            <div style={{ transform: 'translateY(-4vh)' }}>
                <div style={{
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    background: '#fff',
                    margin: '0 auto 20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 6px 24px rgba(0,0,0,.25)',
                }}>
                    <Image src="/wallet-icon.png" alt="Wallet" width={96} height={96} />
                </div>

                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Solitaire</h1>
                <p style={{ opacity: 0.85, marginBottom: 20 }}>Farcaster Mini App</p>

                <button
                    onClick={() => setShowOptions(true)}
                    style={{
                        padding: '15px 40px',
                        fontSize: '1.2rem',
                        borderRadius: 12,
                        background: '#fff',
                        color: '#0A5323',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginBottom: 12
                    }}
                >
                    Connect Wallet
                </button>

                <button
                    onClick={handleTestPlay}
                    style={{
                        padding: '12px 30px',
                        fontSize: '1rem',
                        borderRadius: 12,
                        background: '#FFD700',
                        color: '#0A5323',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Play Test Game
                </button>
            </div>

            {showOptions && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 999
                }}>
                    <div style={{
                        background: '#0A5323',
                        padding: 30,
                        borderRadius: 12,
                        textAlign: 'center',
                        minWidth: 280
                    }}>
                        <h2 style={{ marginBottom: 20, color: '#fff' }}>Select Wallet</h2>
                        <button
                            onClick={() => handleWalletClick('farcaster')}
                            style={{
                                margin: 10, padding: '10px 20px', borderRadius: 8,
                                border: '1px solid #fff', background: '#007BFF',
                                color: 'white', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            Farcaster Wallet
                        </button>
                        <button
                            onClick={() => handleWalletClick('coinbase')}
                            style={{
                                margin: 10, padding: '10px 20px', borderRadius: 8,
                                border: '1px solid #fff', background: '#007BFF',
                                color: 'white', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            Coinbase Wallet
                        </button>
                        <div>
                            <button
                                onClick={() => setShowOptions(false)}
                                style={{
                                    marginTop: 20, padding: '8px 16px', borderRadius: 8,
                                    border: '1px solid #ccc', cursor: 'pointer', background: 'white'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
