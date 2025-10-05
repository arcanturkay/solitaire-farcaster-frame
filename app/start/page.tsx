'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount, useConnect } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { coinbaseWallet } from '@wagmi/connectors';
import { useRouter } from 'next/navigation';

export default function StartPage() {
    const [showOptions, setShowOptions] = useState(false);
    const { connect } = useConnect();
    const { address, isConnected } = useAccount();
    const router = useRouter();

    // Wallet seçildiğinde bağlan
    const handleWalletClick = (wallet: 'farcaster' | 'coinbase') => {
        setShowOptions(false);

        if (wallet === 'farcaster') connect({ connector: farcasterMiniApp() });
        else connect({ connector: coinbaseWallet({ appName: 'Solitaire MiniApp' }) });
    };

    // Wallet bağlandığında oyuna yönlendir
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
            textAlign: 'center',
            padding: 24,
            position: 'relative'
        }}>
            <div>
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
                        fontWeight: 600
                    }}
                >
                    Connect Wallet
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
