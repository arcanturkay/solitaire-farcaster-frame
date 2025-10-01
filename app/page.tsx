// app/page.tsx
'use client'; 

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount, useConnect } from 'wagmi';
// FarcasterMiniApp artık burada import edilmiyor, ID'si string olarak kullanılıyor.
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
export default function GamePage() {
    
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
      // İSTEK YEREL SUNUCUNUZA GİDİYOR
      const response = await fetch(`/api/farcaster?address=${walletAddress}`, { /* ... */ });
      if (!response.ok) return walletAddress; 

      const data = await response.json();
      return data.farcasterId || walletAddress; 
    } catch (error) {
      console.error("Farcaster ID çekme hatası:", error);
      return walletAddress;
    } finally {
      setIsLoadingFid(false);
    }
  }, []);

  // 1. ADIM: Sayfa yüklendiğinde otomatik bağlantıyı dene
  useEffect(() => {
    if (!isConnected && !isConnecting && !isPending) {
        // En güvenli yöntem: Connector'ın varsayılan ID'sini doğrudan string olarak kullanın.
        const FARCASTER_CONNECTOR_ID = 'farcasterMiniApp'; 
        
        const fcConnector = connectors.find(c => c.id === FARCASTER_CONNECTOR_ID);
        
        if (fcConnector) {
            connect({ connector: fcConnector });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 2. ADIM: Bağlantı kurulunca FID'yi çek ve oyunu başlat
  useEffect(() => {
    if (isConnected && address && farcasterId === 'Requires Farcaster' && !isLoadingFid) {
      getFarcasterUsername(address).then(id => {
        setFarcasterId(id);
        gameState.current.currentPlayerId = id; 
        
        // Görünümü güncelle
        if (farcasterWallRef.current) farcasterWallRef.current.classList.add('hidden');
        if (gameContainerRef.current) gameContainerRef.current.classList.add('active');
        
        // Oyunun başlatılması (JS Mantığı Kuruluysa)
        if(isGameInitialized) {
            // resetGame'i tetiklemek için New Game butonuna tıklama simülasyonu
            document.querySelector('.new-game-btn')?.dispatchEvent(new MouseEvent('click'));
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, getFarcasterUsername, isLoadingFid, isGameInitialized]);

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
  /* JAVASCRIPT OYUN MANTIĞI (Tüm fonksiyonlar useEffect içinde tanımlanır) */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    // --- 1. DOM Referanslarını Al ---
    const stockPile = document.getElementById('stock');
    const wastePile = document.getElementById('waste');
    const foundationPiles = document.querySelectorAll('.foundation') as NodeListOf<HTMLElement>;
    const tableauPiles = document.querySelectorAll('.tableau') as NodeListOf<HTMLElement>;
    const scoreDisplay = document.querySelector('.score-display');
    const newGameButtons = document.querySelectorAll('.new-game-btn');
    const winModal = document.getElementById('win-modal');
    const finalScoreDisplay = document.getElementById('final-score');
    const winningPlayerNameDisplay = document.getElementById('winning-player-name');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const leaderboardTableBody = leaderboardModal!.querySelector('tbody'); 
    const autoFinishBtn = document.getElementById('auto-finish-btn') as HTMLButtonElement;


    // --- 2. FONKSİYON TANIMLARI (resetGame'den önce erişilebilir olmalı) ---

    // SKOR YÖNETİMİ (gameState.current'ı kullanacak şekilde uyarlanmıştır)
    function saveAccumulatedScore(playerId: string, newScore: number) { 
      if (playerId === 'Requires Farcaster' || newScore <= 0) return; 
      const scores = JSON.parse(localStorage.getItem(ACCUMULATED_SCORES_KEY) || '{}'); 
      scores[playerId] = (scores[playerId] || 0) + newScore;
      localStorage.setItem(ACCUMULATED_SCORES_KEY, JSON.stringify(scores));
    }

    function handleGameEndOrReset(isWin = false) {
      if (gameState.current.currentPlayerId === 'Requires Farcaster' || (!gameState.current.isGameActive && gameState.current.score === 0)) return;
      saveAccumulatedScore(gameState.current.currentPlayerId, gameState.current.score);
      gameState.current.isGameActive = false;
    }

    function updateScore(points: number, absolute = false) { 
      if (gameState.current.currentPlayerId === 'Requires Farcaster') return;

      if(absolute) gameState.current.score = points;
      else gameState.current.score += points;
      if (gameState.current.score < 0) gameState.current.score = 0;
      scoreDisplay!.textContent = `Score: ${gameState.current.score}`;

      if (points !== 0) gameState.current.isGameActive = true;
    }

    // KART OLUŞTURMA
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

      card.addEventListener('dragstart', onDragStart);
      card.addEventListener('dragend', onDragEnd);
      card.addEventListener('dblclick', onCardDoubleClick);
      return card;
    }

    function dealCards() {
      const deck = gameState.current.deck;
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
      deck.forEach(cardData => {
        const cardElement = createCardElement(cardData);
        stockPile!.appendChild(cardElement);
      });

      const placeholder = stockPile!.querySelector('.pile-placeholder') as HTMLElement;
      if(placeholder) placeholder.style.display = deck.length > 0 ? 'none' : 'block';
    }

    function checkWinCondition() {
      if (gameState.current.currentPlayerId === 'Requires Farcaster') return false;

      let totalFoundationCards = 0;
      foundationPiles.forEach(pile => {
        totalFoundationCards += pile.querySelectorAll('.card').length;
      });
      if (totalFoundationCards === 52) {
        finalScoreDisplay!.textContent = `Final Score: ${gameState.current.score}`;
        winningPlayerNameDisplay!.textContent = gameState.current.currentPlayerId;
        winModal!.classList.add('show');

        handleGameEndOrReset(true);

        autoFinishBtn!.style.display = 'none';
        return true;
      }
      return false;
    }

    function checkForWinnableState() {
      if (gameState.current.currentPlayerId === 'Requires Farcaster') return;

      const faceDownCards = document.querySelectorAll('.tableau .card.face-down');
      // stockPile'da sadece placeholder varsa (children.length <= 1)
      if (stockPile!.children.length <= 1 && faceDownCards.length === 0) {
        autoFinishBtn!.style.display = 'inline-block';
      } else {
        autoFinishBtn!.style.display = 'none';
      }
    }
    
    // OYUN BAŞLATMA
    function resetGame() {
      if (gameState.current.currentPlayerId === 'Requires Farcaster') return; 

      handleGameEndOrReset(false);

      gameState.current.cardIdCounter = 0;
      [stockPile, wastePile, ...foundationPiles, ...tableauPiles].forEach(pile => {
        pile!.innerHTML = '';
        if (pile!.classList.contains('foundation') || pile!.id === 'waste' || pile!.id === 'stock') {
          pile!.innerHTML = '<div class="pile-placeholder"></div>';
        }
      });

      winModal!.classList.remove('show');
      leaderboardModal!.classList.remove('show');
      autoFinishBtn!.style.display = 'none';

      winningPlayerNameDisplay!.textContent = gameState.current.currentPlayerId;

      updateScore(0, true);
      gameState.current.isGameActive = false;
      
      createDeck();
      shuffleDeck();
      dealCards();
      // gameContainer!.classList.add('active'); // Bu React state'i tarafından yönetiliyor
    }

    // TAŞIMA VE OYUN İÇİ FONKSİYONLAR
    function moveCards(cards: HTMLElement[], fromPile: HTMLElement, toPile: HTMLElement) { 
      if (gameState.current.currentPlayerId === 'Requires Farcaster') return;

      cards.forEach(card => toPile.appendChild(card));

      if (toPile.classList.contains('foundation')) updateScore(10);
      else if (fromPile.id === 'waste' && toPile.classList.contains('tableau')) updateScore(5);
      else if (fromPile.classList.contains('foundation') && toPile.classList.contains('tableau')) updateScore(-15);

      if(fromPile.classList.contains('tableau') && fromPile.children.length > 0) {
        const topCard = fromPile.lastElementChild as HTMLElement;
        if (topCard.classList.contains('face-down')) {
          topCard.classList.remove('face-down');
          topCard.draggable = true;
          updateScore(5);
        }
      }

      if (fromPile.id === 'waste') {
        const newWasteTopCard = fromPile.lastElementChild as HTMLElement;
        if (newWasteTopCard && !newWasteTopCard.classList.contains('pile-placeholder')) {
          newWasteTopCard.draggable = true;
        }
      }

      if(checkWinCondition()) return;
      checkForWinnableState();
    }
    
    function validateMove(cardsToMove: HTMLElement[], destPile: HTMLElement) { 
      if (destPile === cardsToMove[0].parentElement) return false;
      const topCardToMove = cardsToMove[0];

      // ... (Orijinal validateMove mantığı buraya gelecek) ...
      
      return false; // Yer tutucu
    }
    
    function drawFromStock() {
      if (gameState.current.currentPlayerId === 'Requires Farcaster') return;

      const currentWasteTopCard = wastePile!.lastElementChild as HTMLElement;
      if (currentWasteTopCard && !currentWasteTopCard.classList.contains('pile-placeholder')) {
        currentWasteTopCard.draggable = false;
      }

      if (stockPile!.children.length > 1) { 
        const card = stockPile!.lastElementChild as HTMLElement;
        card.classList.remove('face-down');
        card.draggable = true;
        wastePile!.appendChild(card);
        const wastePlaceholder = wastePile!.querySelector('.pile-placeholder') as HTMLElement;
        if(wastePlaceholder) wastePlaceholder.style.display = 'none';
      } else {
        const wasteCards = Array.from(wastePile!.querySelectorAll('.card')).reverse() as HTMLElement[];
        wasteCards.forEach(card => {
            card.classList.add('face-down');
            card.draggable = false;
            stockPile!.appendChild(card);
        });
        const placeholder = wastePile!.querySelector('.pile-placeholder') as HTMLElement;
        if(placeholder) placeholder.style.display = 'block';
        updateScore(-100); // Stok tekrar sarılırsa ceza
      }

      const stockPlaceholder = stockPile!.querySelector('.pile-placeholder') as HTMLElement;
      if(stockPlaceholder) stockPlaceholder.style.display = stockPile!.children.length <= 1 ? 'block' : 'none';
    }

    function showLeaderboard() {
      const accumulatedScores = JSON.parse(localStorage.getItem(ACCUMULATED_SCORES_KEY) || '{}');
      const sortedScores = Object.entries(accumulatedScores)
              .map(([name, score]) => ({ name, score }))
              .sort((a, b) => (b.score as number) - (a.score as number)); 

      leaderboardTableBody!.innerHTML = '';

      sortedScores.slice(0, 10).forEach((scoreEntry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${scoreEntry.name}</td><td>${scoreEntry.score}</td>`;
        leaderboardTableBody!.appendChild(row);
      });
      leaderboardModal!.classList.add('show');
    }

    function startAutoComplete() {
      // ... (Orijinal startAutoComplete mantığı buraya gelecek) ...
    }


    // DRAG & DROP EVENT HANDLERS
    function onDragStart(e: DragEvent) {
        // ... (Orijinal onDragStart mantığı buraya gelecek) ...
    }

    function onDragOver(e: DragEvent) { e.preventDefault(); }

    function onDrop(e: DragEvent) {
        // ... (Orijinal onDrop mantığı buraya gelecek) ...
    }

    function onDragEnd() {
        // ... (Orijinal onDragEnd mantığı buraya gelecek) ...
    }

    function onCardDoubleClick(e: MouseEvent) {
        // ... (Orijinal onCardDoubleClick mantığı buraya gelecek) ...
    }


    // --- 3. EVENT LISTENERS KURULUMU ---
    
    // resetGame artık tanımlandığı için hata vermeyecek
    newGameButtons.forEach(btn => btn.addEventListener('click', resetGame)); 

    [...foundationPiles, ...tableauPiles].forEach(pile => {
        const htmlPile = pile as HTMLElement;
        htmlPile.addEventListener('dragover', onDragOver as unknown as EventListener);
        htmlPile.addEventListener('drop', onDrop as unknown as EventListener);
    });

    stockPile!.addEventListener('click', drawFromStock);
    autoFinishBtn!.addEventListener('click', startAutoComplete);
    leaderboardBtn!.addEventListener('click', showLeaderboard);
    closeLeaderboardBtn!.addEventListener('click', () => leaderboardModal!.classList.remove('show'));

    setIsGameInitialized(true); 

    // --- 4. CLEANUP (Temizlik) ---
    return () => {
        newGameButtons.forEach(btn => btn.removeEventListener('click', resetGame));
        stockPile!.removeEventListener('click', drawFromStock);
        autoFinishBtn!.removeEventListener('click', startAutoComplete);
        leaderboardBtn!.removeEventListener('click', showLeaderboard);
        closeLeaderboardBtn!.removeEventListener('click', () => leaderboardModal!.classList.remove('show'));
        // Diğer tüm listener'ları temizleyin...
    };

  }, [farcasterId, isConnected]); // farcasterId veya isConnected değiştiğinde re-render (isteğe bağlı)


  /* -------------------------------------------------------------------------- */
  /* GÖRÜNÜM (JSX) MANTIĞI */
  /* -------------------------------------------------------------------------- */

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
          {/* Connect Wallet butonu kaldırıldı */}
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