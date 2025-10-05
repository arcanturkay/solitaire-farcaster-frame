'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import createClient from '@farcaster/miniapp-sdk';

export default function GamePage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        async function initGame() {
            try {
                const sdk = createClient;
                sdk.actions.ready(); // ⚡ yeşil ekran kalkar

                const context = await sdk.context; // 👈 async bekleniyor
                console.log("🟣 Farcaster context:", context);

                let id: string | null = null;

                if (context?.user?.fid) {
                    id = `FID-${context.user.fid}`;
                } else if (context?.user?.username) {
                    id = context.user.username;
                } else if (isConnected && address) {
                    id = address;
                } else {
                    id = 'Guest';
                }

                setPlayerId(id);
                localStorage.setItem('currentPlayerId', id);
            } catch (err) {
                console.error("❌ Game init error:", err);
            }
        }

        initGame();
    }, [address, isConnected]);

    if (!playerId) {
        return (
            <div className="flex h-screen items-center justify-center text-white bg-green-700">
                <p>Loading game...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-green-700 to-green-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Solitaire Game</h1>
            <p className="mb-2">Welcome, {playerId}</p>
            <button
                onClick={() => router.push('/game/play')}
                className="px-6 py-2 bg-white text-green-700 font-semibold rounded-xl shadow hover:bg-gray-100"
            >
                Start Game
            </button>
        </div>
    );
}
