'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { coinbaseWallet } from '@wagmi/connectors';
import { useRouter } from 'next/navigation';

export default function StartPage() {
    const [showOptions, setShowOptions] = useState(false);
    const { connect } = useConnect();
    const { address, isConnected } = useAccount();
    const router = useRouter();

    const handleWalletClick = (wallet: 'farcaster' | 'coinbase') => {
        if (wallet === 'farcaster') connect({ connector: farcasterMiniApp() });
        else connect({ connector: coinbaseWallet({ appName: 'Solitaire MiniApp' }) });
    };

    // Wallet bağlandıysa oyun sayfasına git
    useEffect(() => {
        if (isConnected && address) {
            localStorage.setItem('currentPlayerId', address);
            router.push('/game');
        }
    }, [isConnected, address, router]);

    return (
        <main style={{
            minHeight: '100dvh',
            display: 'grid',
            placeItems: 'center',
            background: '#0A5323',
            color: 'white',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>Solitaire</h1>
            <button
                onClick={() => setShowOptions(true)}
                style={{
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    borderRadius: 12,
                    background: '#fff',
                    color: '#0A5323',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700
                }}
            >
                Connect Wallet
            </button>

            {showOptions && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        background: '#0A5323',
                        padding: 24,
                        borderRadius: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                    }}>
                        <button onClick={() => handleWalletClick('farcaster')}>Farcaster Wallet</button>
                        <button onClick={() => handleWalletClick('coinbase')}>Coinbase Wallet</button>
                        <button onClick={() => setShowOptions(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </main>
    );
}
