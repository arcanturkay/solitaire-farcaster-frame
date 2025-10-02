import { Suspense } from 'react';
import GameClient from './GameClient';

// Bu bileşen Next.js tarafından sunucu tarafında işlenir (prerendered).
// useSearchParams'ı çağıran GameClient'ı Suspense içine alıyoruz.

export default function GamePageWrapper() {
  return (
    // URL parametrelerini kullanan GameClient'ı yüklerken
    // Next.js'in statik derleme sırasında hata vermesini engelleriz.
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold mb-4">Loading Solitaire...</h1>
            <p className="text-xl text-gray-300 text-center">Preparing the cards.</p>
        </div>
    }>
      <GameClient />
    </Suspense>
  );
}