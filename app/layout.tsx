// app/layout.tsx
import './globals.css';
import { Providers as AppProviders } from './providers';
import type { Metadata } from 'next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <AppProviders>
            {children}
        </AppProviders>
        </body>
        </html>
    );
}

// Basit metadata
export const metadata: Metadata = {
    title: "Solitaire on Farcaster",
};
