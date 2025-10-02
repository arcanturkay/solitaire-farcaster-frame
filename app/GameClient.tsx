'use client'; // Bu dosyanın bir istemci bileşeni olduğunu belirtir

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useSearchParams } from 'next/navigation'; 
import '../styles/solitaire.css';

// --- OYUN TİPLERİ VE SABİTLERİ ---
interface Card {
    suit: string;
    rank: string;
    color: 'red' | 'black';
    value: number;
    isFaceUp: boolean;
}

const SUITS = ["♠", "♣", "♥", "♦"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const ACCUMULATED_SCORES_KEY = 'solitaireAccumulatedScores';

// --- ANA BİLEŞEN ---
export default function GameClient() {
    
    // --- URL KOŞULU ---
    const searchParams = useSearchParams();
    const shouldStartApp = searchParams.get('start') === 'true'; 

    // --- WAGMI / FARCASTER STATE'LERİ ---
    const { address, isConnected, isConnecting } = useAccount();
    const { connect, connectors, isPending } = useConnect();

    const [farcasterId, setFarcasterId] = useState<string>('Requires Farcaster');
    const [isLoadingFid, setIsLoadingFid] = useState(false);
    const [isGameInitialized, setIsGameInitialized] = useState(false);

    // --- REFS (DOM Elementleri ve Oyun State'leri için) ---
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const farcasterWallRef = useRef<HTMLDivElement>(null);
    const currentPlayerStatusRef = useRef<HTMLDivElement>(null);

    const gameState = useRef<{
        deck: Card[];
        score: number;
        cardIdCounter: number;
        draggedCards: HTMLElement[];
        isGameActive: boolean;
        currentPlayerId: string;
    }>({
        deck: [],
        score: 0,
        cardIdCounter: 0,
        draggedCards: [],
        isGameActive: false,
        currentPlayerId: 'Requires Farcaster',
    });


    /* -------------------------------------------------------------------------- */
    /* FARCASTER ID ÇEKME VE BAĞLANTI MANTIĞI */
    /* -------------------------------------------------------------------------- */

    const getFarcasterUsername = useCallback(async (walletAddress: string) => {
        setIsLoadingFid(true);
        try {
            const response = await fetch(`/api/farcaster?address=${walletAddress}`);
            if (!response.ok) throw new Error("API call failed");

            const data = await response.json();
            return data.farcasterId || walletAddress;
        } catch (error) {
            console.error("Farcaster ID çekme hatası (API hatası olabilir):", error);
            return walletAddress;
        } finally {
            setIsLoadingFid(false);
        }
    }, []);

    // 1. ADIM: Sayfa yüklendiğinde otomatik bağlantıyı dene (YALNIZCA FRAME'DEN GELMİŞSE)
    useEffect(() => {
        if (!shouldStartApp) return; 

        if (!isConnected && !isConnecting && !isPending) {
            const FARCASTER_CONNECTOR_ID = 'farcasterMiniApp';
            const fcConnector = connectors.find(c => c.id === FARCASTER_CONNECTOR_ID);

            if (fcConnector) {
                connect({ connector: fcConnector });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldStartApp]); 

    // 2. ADIM: Bağlantı kurulunca FID'yi çek ve oyunu başlat
    useEffect(() => {
        if (!shouldStartApp) return; 

        if (isConnected && address && farcasterId === 'Requires Farcaster' && !isLoadingFid) {
            getFarcasterUsername(address).then(id => {
                setFarcasterId(id);
                gameState.current.currentPlayerId = id;

                if (farcasterWallRef.current) farcasterWallRef.current.classList.add('hidden');
                if (gameContainerRef.current) gameContainerRef.current.classList.add('active');

                if(isGameInitialized) {
                    document.querySelector('.new-game-btn')?.dispatchEvent(new MouseEvent('click'));
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, address, getFarcasterUsername, isLoadingFid, isGameInitialized, shouldStartApp]);

    // Oyuncu durumu gösterimini güncelle
    useEffect(() => {
        if (currentPlayerStatusRef.current) {
            const player = isConnected
                ? (isLoadingFid ? 'Loading...' : farcasterId)
                : 'Requires Farcaster';
            currentPlayerStatusRef.current.textContent = `Playing as: ${player}`;
        }
    }, [isConnected, farcasterId, isLoadingFid]);


    /* -------------------------------------------------------------------------- */
    /* JAVASCRIPT OYUN MANTIĞI */
    /* -------------------------------------------------------------------------- */

    useEffect(() => {
        if (!shouldStartApp) return; 

        // --- 1. DOM Referanslarını Al ---
        const stockPile = document.getElementById('stock');
        const wastePile = document.getElementById('waste');
        const foundationPiles = document.querySelectorAll('.foundation') as NodeListOf<HTMLElement>;
        const tableauPiles = document.querySelectorAll('.tableau') as NodeListOf<HTMLElement>;
        const scoreDisplay = document.querySelector('.score-display');
        const newGameButtons = document.querySelectorAll('.new-game-btn');
        const winModal = document.getElementById('win-modal');
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        const leaderboardModal = document.getElementById('leaderboard-modal');
        const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
        const autoFinishBtn = document.getElementById('auto-finish-btn') as HTMLButtonElement;
        const leaderboardTableBody = leaderboardModal!.querySelector('tbody');
        const finalScoreDisplay = document.getElementById('final-score');
        const winningPlayerNameDisplay = document.getElementById('winning-player-name');


        // --- 2. FONKSİYON TANIMLARI ---

        function updateScore(points: number, absolute = false) {
            if (gameState.current.currentPlayerId === 'Requires Farcaster') return;

            if(absolute) gameState.current.score = points;
            else gameState.current.score += points;
            if (gameState.current.score < 0) gameState.current.score = 0;
            scoreDisplay!.textContent = `Score: ${gameState.current.score}`;

            if (points !== 0) gameState.current.isGameActive = true;
        }

        function createDeck() {
            gameState.current.deck = [];
            for (const suit of SUITS) {
                for (const rank of RANKS) {
                    gameState.current.deck.push({
                        suit, rank,
                        color: (suit === "♥" || suit === "♦") ? 'red' : 'black',
                        value: RANKS.indexOf(rank) + 1,
                        isFaceUp: false
                    } as Card);
                }
            }
        }

        function shuffleDeck() {
            const deck = gameState.current.deck;
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }

        function createCardElement(cardData: Card) {
            const card = document.createElement('div');
            card.id = `card-${gameState.current.cardIdCounter++}`;

            card.classList.add('card', cardData.color);

            if (!cardData.isFaceUp) {
                card.classList.add('face-down');
            } else {
                card.draggable = true;
            }
            card.dataset.rank = cardData.rank;
            card.dataset.suit = cardData.suit;
            card.dataset.value = cardData.value.toString();
            card.dataset.color = cardData.color;

            const rank = document.createElement('div');
            rank.classList.add('rank');
            rank.textContent = cardData.rank;

            const suit = document.createElement('div');
            suit.classList.add('suit');
            suit.textContent = cardData.suit;

            card.appendChild(rank);
            card.appendChild(suit);

            // Event listener'ları burada bağlayın (onDragStart, onDragEnd, onCardDoubleClick)
            return card;
        }

        function dealCards() {
            const deck = gameState.current.deck;
            // Tableau'ya dağıtma
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j <= i; j++) {
                    const cardData = deck.pop();
                    if (cardData) {
                        if (j === i) {
                            cardData.isFaceUp = true;
                        }
                        const cardElement = createCardElement(cardData);
                        tableauPiles[i].appendChild(cardElement);
                    }
                }
            }
            // StockPile'a dağıtma
            deck.forEach(cardData => {
                const cardElement = createCardElement(cardData);
                stockPile!.appendChild(cardElement);
            });

            const placeholder = stockPile!.querySelector('.pile-placeholder') as HTMLElement;
            if(placeholder) placeholder.style.display = deck.length > 0 ? 'none' : 'block';
        }

        // OYUN BAŞLATMA
        function resetGame() {
            if (gameState.current.currentPlayerId === 'Requires Farcaster') return;

            gameState.current.cardIdCounter = 0;

            // Tüm yığınları temizle
            [stockPile, wastePile, ...foundationPiles, ...tableauPiles].forEach(pile => {
                pile!.innerHTML = '';
                if (pile!.classList.contains('foundation') || pile!.id === 'waste' || pile!.id === 'stock') {
                    pile!.innerHTML = '<div class="pile-placeholder"></div>';
                }
            });

            winModal!.classList.remove('show');
            leaderboardModal!.classList.remove('show');
            autoFinishBtn!.style.display = 'none';

            updateScore(0, true);
            gameState.current.isGameActive = false;

            createDeck();
            shuffleDeck();
            dealCards(); // Kartları dağıtır
        }

        // (Diğer tüm oyun fonksiyonları buraya gelmeli: validateMove, moveCards, onDragStart, etc.)

        // Yer tutucu event handler'lar
        function drawFromStock() { /* ... */ }
        function showLeaderboard() { /* ... */ }
        function startAutoComplete() { /* ... */ }
        function onDragStart(e: DragEvent) { /* ... */ }
        function onDragOver(e: DragEvent) { e.preventDefault(); }
        function onDrop(e: DragEvent) { /* ... */ }
        function onDragEnd() { /* ... */ }
        function onCardDoubleClick(e: MouseEvent) { /* ... */ }
        function handleGameEndOrReset(isWin = false) { /* ... */ }


        // --- 3. EVENT LISTENERS KURULUMU ---

        newGameButtons.forEach(btn => btn.addEventListener('click', resetGame));

        [...foundationPiles, ...tableauPiles].forEach(pile => {
            const htmlPile = pile as HTMLElement;
            htmlPile.addEventListener('dragover', onDragOver as unknown as EventListener);
            htmlPile.addEventListener('drop', onDrop as unknown as EventListener);
        });

        stockPile!.addEventListener('click', drawFromStock);
        leaderboardBtn!.addEventListener('click', showLeaderboard);
        closeLeaderboardBtn!.addEventListener('click', () => leaderboardModal!.classList.remove('show'));
        autoFinishBtn!.addEventListener('click', startAutoComplete);


        setIsGameInitialized(true);

        // --- 4. CLEANUP (Temizlik) ---
        return () => {
            newGameButtons.forEach(btn => btn.removeEventListener('click', resetGame));
            stockPile!.removeEventListener('click', drawFromStock);
            leaderboardBtn!.removeEventListener('click', showLeaderboard);
            closeLeaderboardBtn!.removeEventListener('click', () => leaderboardModal!.classList.remove('show'));
            autoFinishBtn!.removeEventListener('click', startAutoComplete);
            // Diğer tüm listener'ları temizleyin...
        };

    }, [farcasterId, isConnected, shouldStartApp]);

    /* -------------------------------------------------------------------------- */
    /* GÖRÜNÜM (JSX) MANTIĞI */
    /* -------------------------------------------------------------------------- */
    
    // FRAME DIŞI EKRAN: Kullanıcıyı başlatmaya zorlamak için buton ekle
    if (!shouldStartApp) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <h1 className="text-4xl font-bold mb-4">Solitaire Frame</h1>
                <p className="text-xl text-gray-300 text-center mb-6">
                    Ready to play? Click the button below to launch the Solitaire Mini App!
                </p>
                <button
                    className="px-8 py-4 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xl font-extrabold rounded-2xl shadow-2xl shadow-orange-700/80 transition transform duration-300"
                    onClick={() => {
                        // Aynı sayfayı ?start=true parametresi ile yeniden yükle
                        window.location.href = window.location.origin + window.location.pathname + '?start=true';
                    }}
                >
                    Launch Mini App
                </button>
            </div>
        );
    }

    // Uygulama Mini App olarak başladıysa (shouldStartApp === true)
    const wallMessage = isConnecting || isPending ? 'Bağlantı Kuruluyor...' : 'Farcaster Cüzdanı gerekli.';

    return (
        <>
            {/* FARCASTER WALL: Bağlantı başarılı olana kadar gösterilir */}
            <div
                id="farcaster-wall"
                ref={farcasterWallRef}
                className={farcasterId !== 'Requires Farcaster' ? 'hidden' : ''}
            >
                <h2>Welcome to Farcaster Solitaire</h2>
                <p>
                    {farcasterId === 'Requires Farcaster' && isConnected && !isLoadingFid
                        ? 'Farcaster ID’niz çekiliyor...'
                        : wallMessage
                    }
                </p>
            </div>

            {/* ANA OYUN EKRANI */}
            <div className={`game-container ${farcasterId !== 'Requires Farcaster' ? 'active' : ''}`} id="game-container" ref={gameContainerRef}>
                <h1>Solitaire</h1>
                <div className="score-display">Score: {gameState.current.score}</div>

                <div id="current-player-status" ref={currentPlayerStatusRef}></div>

                <div className="top-piles">
                    <div className="stock-waste-piles">
                        <div id="stock" className="pile">
                            <div className="pile-placeholder"></div>
                        </div>
                        <div id="waste" className="pile">
                            <div className="pile-placeholder"></div>
                        </div>
                    </div>
                    <div className="foundation-piles">
                        <div id="foundation-0" className="pile foundation"><div className="pile-placeholder"></div></div>
                        <div id="foundation-1" className="pile foundation"><div className="pile-placeholder"></div></div>
                        <div id="foundation-2" className="pile foundation"><div className="pile-placeholder"></div></div>
                        <div id="foundation-3" className="pile foundation"><div className="pile-placeholder"></div></div>
                    </div>
                </div>

                <div className="tableau-piles">
                    <div id="tableau-0" className="pile tableau"></div>
                    <div id="tableau-1" className="pile tableau"></div>
                    <div id="tableau-2" className="pile tableau"></div>
                    <div id="tableau-3" className="pile tableau"></div>
                    <div id="tableau-4" className="pile tableau"></div>
                    <div id="tableau-5" className="pile tableau"></div>
                    <div id="tableau-6" className="pile tableau"></div>
                </div>

                <div className="controls">
                    <button className="new-game-btn">New Game</button>
                    <button id="leaderboard-btn" className="control-btn">Leaderboard</button>
                    <button id="auto-finish-btn" className="control-btn" style={{display: 'none'}}>Auto-Finish</button>
                </div>
            </div>

            {/* MODALLAR */}
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
        </>
    );
}
