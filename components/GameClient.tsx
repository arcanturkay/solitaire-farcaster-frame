'use client'; 

import { useEffect, useState, useRef } from 'react'; // useState eklendi
import { useAccount, useDisconnect } from 'wagmi'; // Wagmi Hook'ları
import { ConnectButton } from '@rainbow-me/rainbowkit'; // RainbowKit Bileşeni
import '../styles/solitaire.css'; 

// TypeScript derleme hatasını çözmek için Card tipi tanımlandı
interface Card {
  suit: string;
  rank: string;
  color: 'red' | 'black';
  value: number;
  isFaceUp: boolean;
}

// Adım 2: Cüzdan Adresini Farcaster Kullanıcı Adıyla Eşleştirme (GÜVENLİ VERSİYON)
// Bu fonksiyon artık bileşen dışında, yalnızca API çağrısı yaptığı için daha temiz
async function getFarcasterUsername(walletAddress: string) {
    try {
        // İSTEK ARTIK GİZLİ API KEY İÇEREN YEREL SUNUCUNUZA GİDİYOR
        const response = await fetch(`/api/farcaster?address=${walletAddress}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Sunucudan Farcaster API hatası: ${response.status}. Cüzdan adresi kullanılacak.`);
            // Sunucudan gelen hata durumlarında cüzdan adresine geri dön
            return walletAddress; 
        }

        const data = await response.json();
        
        // Sunucudan sadece farcasterId alanını alıyoruz
        return data.farcasterId || walletAddress; 

    } catch (error) {
        console.error("Sunucuya istek atılırken hata:", error);
        // Ağ veya bilinmeyen bir hata durumunda cüzdan adresini göster
        return walletAddress; 
    }
}


export default function GamePage() {
    // ----------------------------------------------------------------------
    // YENİ: WAGMI/RAINBOWKIT DURUM YÖNETİMİ
    // ----------------------------------------------------------------------
    const { address, isConnected } = useAccount(); // Bağlantı durumu ve adresi alır
    const { disconnect } = useDisconnect(); // Bağlantıyı kesme fonksiyonu
    
    const [currentPlayerId, setCurrentPlayerId] = useState<string>('Requires Farcaster');
    const [isLoadingFarcaster, setIsLoadingFarcaster] = useState<boolean>(false);
    
    // YENİ: Oyunun görünürlüğünü kontrol etmek için state
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    // DOM referansları
    const stockPileRef = useRef<HTMLDivElement>(null); 
    const wastePileRef = useRef<HTMLDivElement>(null); 
    const foundationPilesRef = useRef<NodeListOf<Element> | null>(null);
    const tableauPilesRef = useRef<NodeListOf<Element> | null>(null);
    const scoreDisplayRef = useRef<HTMLDivElement>(null); 
    const newGameButtonsRef = useRef<NodeListOf<Element> | null>(null);
    const finalScoreDisplayRef = useRef<HTMLDivElement>(null);
    const winningPlayerNameDisplayRef = useRef<HTMLDivElement>(null);
    const leaderboardModalRef =useRef<HTMLDivElement>(null);
    const leaderboardTableBodyRef = useRef<HTMLTableSectionElement>(null); 
    const autoFinishBtnRef = useRef<HTMLButtonElement>(null);
    const farcasterWallRef = useRef<HTMLDivElement>(null);
    const gameContainerRef = useRef<HTMLDivElement>(null); 
    const winModalRef = useRef<HTMLDivElement>(null); 
    const currentPlayerStatusRef = useRef<HTMLDivElement>(null); 


    // --- Solitaire Oyununun TÜM JavaScript Kodu Başlangıcı (Ref'ler Kullanılarak Güncellendi) ---

    // Oyun sabitleri (global scope'ta tanımlı kalabilir)
    const SUITS = ["♠", "♣", "♥", "♦"];
    const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const ACCUMULATED_SCORES_KEY = 'solitaireAccumulatedScores';

    let deck: Card[] = []; 
    let score = 0;
    let cardIdCounter = 0;
    let draggedCards: HTMLElement[] = [];
    let isGameActive = false;

    // --- Fonksiyonlar, DOM referanslarını ref.current üzerinden kullanacak şekilde güncellenmelidir ---

    function updatePlayerStatus() {
        if (currentPlayerStatusRef.current) {
            currentPlayerStatusRef.current.textContent = `Playing as: ${currentPlayerId}`;
        }
    }

    function saveAccumulatedScore(playerId: string, newScore: number) { 
        if (playerId === 'Requires Farcaster' || newScore <= 0) return; 

        const scores = JSON.parse(localStorage.getItem(ACCUMULATED_SCORES_KEY) || '{}'); 
        scores[playerId] = (scores[playerId] || 0) + newScore;
        localStorage.setItem(ACCUMULATED_SCORES_KEY, JSON.stringify(scores));
    }

    function handleGameEndOrReset(isWin = false) {
        if (currentPlayerId === 'Requires Farcaster' || (!isGameActive && score === 0)) return;
        saveAccumulatedScore(currentPlayerId, score);
        isGameActive = false;
    }

    function updateScore(points: number, absolute = false) { 
        if (currentPlayerId === 'Requires Farcaster') return;

        if(absolute) score = points;
        else score += points;
        if (score < 0) score = 0;
        
        if (scoreDisplayRef.current) {
            scoreDisplayRef.current.textContent = `Score: ${score}`;
        }

        if (points !== 0) isGameActive = true;
    }

    function createDeck() { /* ... aynı kod ... */ }
    function shuffleDeck() { /* ... aynı kod ... */ }
    
    function createCardElement(cardData: Card) { 
      const card = document.createElement('div');
      card.id = `card-${cardIdCounter++}`;
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
        const tableauPiles = tableauPilesRef.current;
        const stockPile = stockPileRef.current;
        if (!tableauPiles || !stockPile) return;

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
            stockPile.appendChild(cardElement);
        });

        const placeholder = stockPile.querySelector('.pile-placeholder') as HTMLElement;
        if(placeholder) placeholder.style.display = 'none';
    }

    function resetGame() {
        if (currentPlayerId === 'Requires Farcaster') return; 

        handleGameEndOrReset(false);

        cardIdCounter = 0;
        
        // Tüm yığınları temizle (Ref'leri kullan)
        const allPiles = [
            stockPileRef.current, 
            wastePileRef.current, 
            ...(foundationPilesRef.current ? Array.from(foundationPilesRef.current) : []), 
            ...(tableauPilesRef.current ? Array.from(tableauPilesRef.current) : [])
        ];
        
        allPiles.forEach(pile => {
            if (pile) {
                pile.innerHTML = '';
                if (pile.classList.contains('foundation') || pile.id === 'waste' || pile.id === 'stock') {
                    pile.innerHTML = '<div class="pile-placeholder"></div>';
                }
            }
        });


        if (winModalRef.current) winModalRef.current.classList.remove('show');
        if (leaderboardModalRef.current) leaderboardModalRef.current.classList.remove('show');
        if (autoFinishBtnRef.current) autoFinishBtnRef.current.style.display = 'none';

        if (winningPlayerNameDisplayRef.current) winningPlayerNameDisplayRef.current.textContent = currentPlayerId;

        updateScore(0, true);
        isGameActive = false;
        createDeck();
        shuffleDeck();
        dealCards();
        if (gameContainerRef.current) gameContainerRef.current.classList.add('active'); 
    }

    function checkWinCondition() { /* ... Ref'leri kullanacak şekilde güncellenmeli ... */
        if (currentPlayerId === 'Requires Farcaster') return false;

        let totalFoundationCards = 0;
        foundationPilesRef.current?.forEach(pile => {
            totalFoundationCards += pile.querySelectorAll('.card').length;
        });
        if (totalFoundationCards === 52) {
            if (finalScoreDisplayRef.current) finalScoreDisplayRef.current.textContent = `Final Score: ${score}`;
            if (winningPlayerNameDisplayRef.current) winningPlayerNameDisplayRef.current.textContent = currentPlayerId;
            if (winModalRef.current) winModalRef.current.classList.add('show');

            handleGameEndOrReset(true);

            if (autoFinishBtnRef.current) autoFinishBtnRef.current.style.display = 'none';
            return true;
        }
        return false;
    }

    function showLeaderboard() {
        const accumulatedScores = JSON.parse(localStorage.getItem(ACCUMULATED_SCORES_KEY) || '{}');

        const sortedScores = Object.entries(accumulatedScores)
                .map(([name, score]) => ({ name, score }))
                .sort((a, b) => (b.score as number) - (a.score as number)); 

        if (leaderboardTableBodyRef.current) {
            leaderboardTableBodyRef.current.innerHTML = '';

            sortedScores.slice(0, 10).forEach((scoreEntry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${index + 1}</td><td>${scoreEntry.name}</td><td>${scoreEntry.score}</td>`;
                leaderboardTableBodyRef.current!.appendChild(row);
            });
        }
        
        if (leaderboardModalRef.current) leaderboardModalRef.current.classList.add('show');
    }

    function validateMove(cardsToMove: HTMLElement[], destPile: HTMLElement) { /* ... aynı kod ... */
        if (destPile === cardsToMove[0].parentElement) return false;
        const topCardToMove = cardsToMove[0];

        if (destPile.classList.contains('foundation')) {
            if (cardsToMove.length > 1) return false;
            const foundationTopCard = destPile.lastElementChild as HTMLElement | null; // Tür dönüştürme yapıldı
            if(foundationTopCard && foundationTopCard.classList.contains('pile-placeholder')){
                return topCardToMove.dataset.value === '1'; // Ace
            }
            if (!foundationTopCard && topCardToMove.dataset.value === '1') return true;
            if (foundationTopCard &&
                    foundationTopCard.dataset.suit === topCardToMove.dataset.suit &&
                    parseInt(foundationTopCard.dataset.value!) + 1 === parseInt(topCardToMove.dataset.value!)) {
                return true;
            }
        }

        if (destPile.classList.contains('tableau')) {
            const tableauTopCard = destPile.lastElementChild as HTMLElement | null; // Tür dönüştürme yapıldı
            if (!tableauTopCard) { // Empty tableau
                return topCardToMove.dataset.rank === 'K';
            }
            // Hata veren satırlar düzeltildi (Non-null Assertion '!' eklendi)
            if (tableauTopCard!.dataset.color !== topCardToMove.dataset.color &&
                    parseInt(tableauTopCard!.dataset.value!) === parseInt(topCardToMove.dataset.value!) + 1) {
                return true;
            }
        }
        return false;
    }

    function moveCards(cards: HTMLElement[], fromPile: HTMLElement, toPile: HTMLElement) { /* ... Ref'leri kullanacak şekilde güncellenmeli ... */
        if (currentPlayerId === 'Requires Farcaster') return;

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

        if (fromPile.id === 'waste' && fromPile.children.length > 0) {
            const newWasteTopCard = fromPile.lastElementChild as HTMLElement;
            if (newWasteTopCard && !newWasteTopCard.classList.contains('pile-placeholder')) {
                newWasteTopCard.draggable = true;
            }
        }

        if(checkWinCondition()) return;
        checkForWinnableState();
    }

    function drawFromStock() { /* ... Ref'leri kullanacak şekilde güncellenmeli ... */
        const stockPile = stockPileRef.current;
        const wastePile = wastePileRef.current;
        if (currentPlayerId === 'Requires Farcaster' || !stockPile || !wastePile) return;

        const currentWasteTopCard = wastePile.lastElementChild as HTMLElement;
        if (currentWasteTopCard && !currentWasteTopCard.classList.contains('pile-placeholder')) {
            currentWasteTopCard.draggable = false;
        }

        if (stockPile.children.length > 1) { 
            const card = stockPile.lastElementChild as HTMLElement;
            card.classList.remove('face-down');
            card.draggable = true;
            wastePile.appendChild(card);
            const wastePlaceholder = wastePile.querySelector('.pile-placeholder') as HTMLElement;
            if(wastePlaceholder) wastePlaceholder.style.display = 'none';
        } else {
            const wasteCards = Array.from(wastePile.querySelectorAll('.card')).reverse() as HTMLElement[];
            wasteCards.forEach(card => {
                card.classList.add('face-down');
                card.draggable = false;
                stockPile.appendChild(card);
            });
            const wastePlaceholder = wastePile.querySelector('.pile-placeholder') as HTMLElement;
            if(wastePlaceholder) wastePlaceholder.style.display = 'block';
        }
        
        const stockPlaceholder = stockPile.querySelector('.pile-placeholder') as HTMLElement;
        if (stockPlaceholder) {
            if (stockPile.children.length > 1) stockPlaceholder.style.display = 'none';
            else stockPlaceholder.style.display = 'block';
        }
    }

    function onDragStart(e: DragEvent) { /* ... aynı kod ... */
        if (currentPlayerId === 'Requires Farcaster') { e.preventDefault(); return; }

        const draggedCard = e.target as HTMLElement;
        if (draggedCard.classList.contains('face-down')) { e.preventDefault(); return; }

        const pile = draggedCard.parentElement as HTMLElement;

        if (pile.classList.contains('tableau')) {
            const allCards = Array.from(pile.children) as HTMLElement[];
            const draggedIndex = allCards.indexOf(draggedCard);
            draggedCards = allCards.slice(draggedIndex);
        } else {
            draggedCards = [draggedCard];
        }

        e.dataTransfer!.effectAllowed = 'move';
        e.dataTransfer!.setData('text/plain', draggedCard.id);
        setTimeout(() => { draggedCards.forEach(c => c.classList.add('dragging')); }, 0);
    }

    function onDragOver(e: DragEvent) { e.preventDefault(); }

    function onDrop(e: DragEvent) {
        if (currentPlayerId === 'Requires Farcaster') return;

        e.preventDefault();
        const destPile = e.currentTarget as HTMLElement;
        if (!draggedCards || draggedCards.length === 0) return;
        const sourcePile = draggedCards[0].parentElement as HTMLElement;
        if (validateMove(draggedCards as HTMLElement[], destPile)) {
            moveCards(draggedCards as HTMLElement[], sourcePile, destPile);
        }
    }

    function onDragEnd() {
        draggedCards.forEach(c => c.classList.remove('dragging'));
        draggedCards = [];
    }

    function onCardDoubleClick(e: MouseEvent) {
        const foundationPiles = foundationPilesRef.current;
        if (currentPlayerId === 'Requires Farcaster' || !foundationPiles) return;

        const card = e.currentTarget as HTMLElement;
        const sourcePile = card.parentElement as HTMLElement;
        if (card !== sourcePile.lastElementChild) return;
        for (const foundationPile of foundationPiles as unknown as HTMLElement[]) {
            if (validateMove([card], foundationPile)) {
                moveCards([card], sourcePile, foundationPile);
                break;
            }
        }
    }

    function checkForWinnableState() {
        const stockPile = stockPileRef.current;
        const autoFinishBtn = autoFinishBtnRef.current;

        if (currentPlayerId === 'Requires Farcaster' || !stockPile || !autoFinishBtn) return;

        const faceDownCards = document.querySelectorAll('.tableau .card.face-down');
        if (stockPile.children.length <= 1 && faceDownCards.length === 0) {
            autoFinishBtn.style.display = 'inline-block';
        } else {
            autoFinishBtn.style.display = 'none';
        }
    }

    function startAutoComplete() {
        const autoFinishBtn = autoFinishBtnRef.current;
        const wastePile = wastePileRef.current;
        const tableauPiles = tableauPilesRef.current;
        const foundationPiles = foundationPilesRef.current;

        if (currentPlayerId === 'Requires Farcaster' || !autoFinishBtn || !wastePile || !tableauPiles || !foundationPiles) return;

        autoFinishBtn.disabled = true;
        const autoMoveInterval = setInterval(() => {
            let cardMoved = false;

            const movableCards = [...Array.from(tableauPiles), wastePile].map(p => p!.lastElementChild).filter(c => c && !c.classList.contains('pile-placeholder')) as HTMLElement[];

            for(const card of movableCards) {
                for (const foundationPile of foundationPiles as unknown as HTMLElement[]) {
                    if (validateMove([card], foundationPile)) {
                        moveCards([card], card.parentElement as HTMLElement, foundationPile);
                        cardMoved = true;
                        break;
                    }
                }
                if(cardMoved) break;
            }

            if (!cardMoved) {
                clearInterval(autoMoveInterval);
                autoFinishBtn.disabled = false;
            }
        }, 150);
    }
    
    // --- Solitaire Oyununun TÜM JavaScript Kodu Sonu ---


    // ----------------------------------------------------------------------
    // YENİ: WAGMI/RAINBOWKIT ENTEGRASYON EFFECT'İ
    // ----------------------------------------------------------------------

    useEffect(() => {
        // DOM elementlerini ref'lere atama (Yalnızca bir kez)
        if (!foundationPilesRef.current) {
            foundationPilesRef.current = document.querySelectorAll('.foundation');
            tableauPilesRef.current = document.querySelectorAll('.tableau');
            newGameButtonsRef.current = document.querySelectorAll('.new-game-btn');
            leaderboardTableBodyRef.current = document.getElementById('leaderboard-table')?.querySelector('tbody') || null;
            
            // Event Listeners (Ref'leri kullan)
            newGameButtonsRef.current.forEach(btn => btn.addEventListener('click', resetGame));
            
            [...Array.from(foundationPilesRef.current), ...Array.from(tableauPilesRef.current)].forEach(pile => {
                const htmlPile = pile as HTMLElement;
                htmlPile.addEventListener('dragover', onDragOver as unknown as EventListener);
                htmlPile.addEventListener('drop', onDrop as unknown as EventListener);
            });

            stockPileRef.current?.addEventListener('click', drawFromStock);
            autoFinishBtnRef.current?.addEventListener('click', startAutoComplete);
            document.getElementById('leaderboard-btn')?.addEventListener('click', showLeaderboard);
            document.getElementById('close-leaderboard-btn')?.addEventListener('click', () => leaderboardModalRef.current?.classList.remove('show'));
        }
    }, []);

    // Cüzdan Bağlantısı Değiştiğinde Çalışacak Effect
    useEffect(() => {
        // 1. Durum Güncellemesi (UI Kontrolü)
        setIsWalletConnected(isConnected);

        if (isConnected && address) {
            // Cüzdan bağlandıysa Farcaster ID'yi çek
            handleFarcasterLogin(address);
        } else {
            // Cüzdan bağlantısı kesildi veya hiç bağlanmadıysa
            setCurrentPlayerId('Requires Farcaster');
            setIsLoadingFarcaster(false);
            
            // Oyun duvarını göster
            if (farcasterWallRef.current) farcasterWallRef.current.classList.remove('hidden');
            if (gameContainerRef.current) gameContainerRef.current.classList.remove('active');
        }
    }, [isConnected, address]);


    async function handleFarcasterLogin(walletAddress: string) {
        setIsLoadingFarcaster(true);
        
        // Bu kısım artık "Connect Wallet" düğmesine basıldığında değil,
        // cüzdan Wagmi tarafından bağlandığında otomatik çalışır.

        const farcasterId = await getFarcasterUsername(walletAddress);

        handleGameEndOrReset(false); // Önceki oyunu bitir

        // Yeni kullanıcıyı ayarla
        setCurrentPlayerId(farcasterId);
        updatePlayerStatus();
        setIsLoadingFarcaster(false);
        
        // Görünümü güncelle
        if (farcasterWallRef.current) farcasterWallRef.current.classList.add('hidden'); 
        if (gameContainerRef.current) gameContainerRef.current.classList.add('active'); 
        
        // Oyunu başlat
        resetGame();
    }


  // ARAYÜZ (return kısmı)
  return (
    // body etiketi yerine React'te doğrudan döndürülür
    <>
        {/* Wagmi Durumuna Göre Gösterilen Bağlantı Duvarı */}
        <div id="farcaster-wall" ref={farcasterWallRef} className={isWalletConnected ? 'hidden' : ''}>
          <h2>Welcome to Farcaster Solitaire</h2>
          <p>Please connect your wallet before playing Solitaire game ♠ ♣ ♥ ♦</p>
          
          {/* Buraya Wagmi ConnectButton bileşenini koyuyoruz */}
          <div style={{fontSize: '1.2rem', padding: '15px 30px', display: 'inline-block'}}>
            <ConnectButton 
                label={isLoadingFarcaster ? 'Kullanıcı Adı Çekiliyor...' : 'Connect Wallet'}
                showBalance={false}
                chainStatus="none"
                accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'avatar',
                }}
            />
          </div>
        </div>

        {/* Oyun Alanı - Sadece Cüzdan Bağlıysa Görünür */}
        <div 
            id="game-container" 
            ref={gameContainerRef} 
            className={`game-container ${isWalletConnected ? 'active' : ''}`}
        >
          <h1>Solitaire</h1>
          <div ref={scoreDisplayRef} className="score-display">Score: 0</div>

          {/* Bağlantıyı Kes Butonu ve Oyuncu Durumu */}
          <div ref={currentPlayerStatusRef} id="current-player-status">
              Playing as: {isLoadingFarcaster ? 'Loading...' : currentPlayerId}
              {isConnected && (
                  <button 
                      onClick={() => disconnect()} 
                      className="control-btn" 
                      style={{marginLeft: '15px'}}
                  >
                      Disconnect
                  </button>
              )}
          </div>

          <div className="top-piles">
            <div className="stock-waste-piles">
              <div id="stock" ref={stockPileRef} className="pile">
                <div className="pile-placeholder"></div>
              </div>
              <div id="waste" ref={wastePileRef} className="pile">
                <div className="pile-placeholder"></div>
              </div>
            </div>
            <div className="foundation-piles">
              <div id="foundation-0" ref={(el) => { if(el) foundationPilesRef.current = document.querySelectorAll('.foundation'); }} className="pile foundation"><div className="pile-placeholder"></div></div>
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
            <button id="auto-finish-btn" ref={autoFinishBtnRef} className="control-btn" style={{display: 'none'}}>Auto-Finish</button>
          </div>
        </div>

        <div id="win-modal" ref={winModalRef} className="modal-overlay">
          <div className="modal-content">
            <h2>You Win!</h2>
            <p id="final-score" ref={finalScoreDisplayRef}></p>
            <p>Score saved for: <span id="winning-player-name" ref={winningPlayerNameDisplayRef}></span></p>
            <button className="new-game-btn play-again-btn">Play Again</button>
          </div>
        </div>

        <div id="leaderboard-modal" ref={leaderboardModalRef} className="modal-overlay">
          <div className="modal-content">
            <h2>Leaderboard (Accumulated Score)</h2>
            <table id="leaderboard-table">
              <thead><tr><th>Rank</th><th>Name</th><th>Total Score</th></tr></thead>
              <tbody ref={leaderboardTableBodyRef}></tbody>
            </table>
            <button id="close-leaderboard-btn" className="control-btn">Close</button>
          </div>
        </div>
    </>
  );
}