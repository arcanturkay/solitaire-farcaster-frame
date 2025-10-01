// app/layout.tsx (Sadece örnek, bu dosyayı kendinize göre düzenleyin)
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Providers ile Wagmi ve Farcaster Connector'ı etkinleştiriyoruz */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}