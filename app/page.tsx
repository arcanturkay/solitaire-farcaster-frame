'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Splash() {
    useEffect(() => {
        const t = setTimeout(() => {
            window.location.href = '/start';
        }, 2500);
        return () => clearTimeout(t);
    }, []);

    return (
        <main
            style={{
                minHeight: '100dvh',
                display: 'grid',
                placeItems: 'center',
                background: '#0A5323',
                color: 'white',
                textAlign: 'center',
                padding: 24,
            }}
        >
            <div style={{ transform: 'translateY(-4vh)' }}>
                <div
                    aria-hidden
                    style={{
                        width: 96,
                        height: 136,
                        borderRadius: 12,
                        background: 'white',
                        margin: '0 auto 16px',
                        boxShadow: '0 6px 24px rgba(0,0,0,.25)',
                        position: 'relative',
                    }}
                >
                    <span style={{ position: 'absolute', top: 8, left: 10, color: '#D92D20', fontWeight: 800 }}>A</span>
                    <span style={{ position: 'absolute', bottom: 8, right: 10, color: '#D92D20', fontWeight: 800 }}>♥</span>
                </div>
                <h1 style={{ margin: '8px 0 6px', fontSize: 32, fontWeight: 800 }}>Solitaire</h1>
                <p style={{ opacity: .85, marginBottom: 12 }}>Farcaster Mini App</p>
                <p style={{ opacity: .75, fontSize: 14 }}>
                    Redirecting to wallet… If not,{' '}
                    <Link href="/start" style={{ color: 'white', textDecoration: 'underline' }}>
                        tap here
                    </Link>.
                </p>
            </div>
        </main>
    );
}
