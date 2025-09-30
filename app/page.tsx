// app/page.tsx
'use client'; // Bu, tarayıcıda çalışması için gereklidir!

import { useEffect, useRef } from 'react';
import '../styles/solitaire.css'; // Stil dosyasını içe aktarın

// TypeScript derleme hatasını çözmek için Card tipi tanımlandı
interface Card {
  suit: string;
  rank: string;
  color: 'red' | 'black';
  value: number;
  isFaceUp: boolean;
}

// Oyun mantığının tamamı useEffect içinde yer alacaktır.

export default function GamePage() {

  // Farcaster girişini simüle eden fonksiyon
  const farcasterLoginSimulation = () => {
    const simulatedUsername = prompt("Farcaster Kullanıcı Adınızı Girin (Örn: @kullaniciadi)");
    if (simulatedUsername && simulatedUsername.trim() !== "") {
      // Bu işlev, JavaScript'in useEffect içinde tanımlanacak olan resetGame'i çağırır.
      // Burada sadece simülasyonu başlatması için bir placeholder tutuyoruz.
      // Gerçek işlevsellik, useEffect içindeki kod çalışmaya başladıktan sonra devreye girecek.
      alert(`Başarıyla giriş yapıldı: ${simulatedUsername.trim()}. Yeni bir oyun başlatılıyor...`);
      // Simülasyon başarılı, DOM'u değiştirmek için bir event tetikleyelim.
      document.dispatchEvent(new CustomEvent('farcasterLoggedIn', { detail: simulatedUsername.trim() }));
    }
  };


  useEffect(() => {
    // DOM yüklendiğinde çalışacak olan kodun TAMAMI buraya gelecek
    
    // --- Solitaire Oyununun TÜM JavaScript Kodu Başlangıcı ---

    const SUITS = ["♠", "♣", "♥", "♦"];
    const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const ACCUMULATED_SCORES_KEY = 'solitaireAccumulatedScores';

    const stockPile = document.getElementById('stock');
    const wastePile = document.getElementById('waste');
    const foundationPiles = document.querySelectorAll('.foundation');
    const tableauPiles = document.querySelectorAll('.tableau');
    const scoreDisplay = document.querySelector('.score-display');
    const newGameButtons = document.querySelectorAll('.new-game-btn');
    const gameContainer = document.getElementById('game-container');

    const winModal = document.getElementById('win-modal');
    const finalScoreDisplay = document.getElementById('final-score');
    const winningPlayerNameDisplay = document.getElementById('winning-player-name');

    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    
    // Hata Çözümü 1: leaderboardModal'in null olmayacağını belirtmek için '!' eklendi
    const leaderboardTableBody = leaderboardModal!.querySelector('tbody'); 

    const autoFinishBtn = document.getElementById('auto-finish-btn') as HTMLButtonElement;
    const currentPlayerStatus = document.getElementById('current-player-status');
    const farcasterWall = document.getElementById('farcaster-wall');
    const farcasterLoginBtnWall = document.getElementById('farcaster-login-btn-wall');

    // Hata Çözümü 2: Tip tanımlaması (Card) eklendi
    let deck: Card[] = []; 
    let score = 0;
    let cardIdCounter = 0;
    let draggedCards: HTMLElement[] = []; // Tip tanımlaması yapıldı
    let isGameActive = false;

    // YENİ: Başlangıçta Farcaster girişi gerekli
    let currentPlayerId = 'Requires Farcaster';

    /* -------------------------------------------------------------------------- */
    /* SKOR YÖNETİM FONKSİYONLARI                       */
    /* -------------------------------------------------------------------------- */

    function updatePlayerStatus() {
      currentPlayerStatus!.textContent = `Playing as: ${currentPlayerId}`;
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
      scoreDisplay!.textContent = `Score: ${score}`;

      if (points !== 0) isGameActive = true;
    }

    /* -------------------------------------------------------------------------- */
    /* OYUN FONKSİYONLARI                           */
    /* -------------------------------------------------------------------------- */


    function createDeck() {
      deck = [];
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          deck.push({
            suit,
            rank,
            color: (suit === "♥" || suit === "♦") ? 'red' : 'black',
            value: RANKS.indexOf(rank) + 1,
            isFaceUp: false
          } as Card); 
        }
      }
    }

    function shuffleDeck() {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }

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

      if(stockPile!.querySelector('.pile-placeholder')) {
        (stockPile!.querySelector('.pile-placeholder') as HTMLElement)!.style.display = 'none';

      }
    }

    function resetGame() {
      if (currentPlayerId === 'Requires Farcaster') return; 

      handleGameEndOrReset(false);

      cardIdCounter = 0;
      [stockPile, wastePile, ...foundationPiles, ...tableauPiles].forEach(pile => {
        pile!.innerHTML = '';
        if (pile!.classList.contains('foundation') || pile!.id === 'waste' || pile!.id === 'stock') {
          pile!.innerHTML = '<div class="pile-placeholder"></div>';
        }
      });

      winModal!.classList.remove('show');
      leaderboardModal!.classList.remove('show');
      autoFinishBtn!.style.display = 'none';

      winningPlayerNameDisplay!.textContent = currentPlayerId;

      updateScore(0, true);
      isGameActive = false;
      createDeck();
      shuffleDeck();
      dealCards();
      gameContainer!.classList.add('active'); 
    }

    function checkWinCondition() {
      if (currentPlayerId === 'Requires Farcaster') return false;

      let totalFoundationCards = 0;
      foundationPiles.forEach(pile => {
        totalFoundationCards += pile.querySelectorAll('.card').length;
      });
      if (totalFoundationCards === 52) {
        finalScoreDisplay!.textContent = `Final Score: ${score}`;
        winningPlayerNameDisplay!.textContent = currentPlayerId;
        winModal!.classList.add('show');

        handleGameEndOrReset(true);

        autoFinishBtn!.style.display = 'none';
        return true;
      }
      return false;
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

    function validateMove(cardsToMove: HTMLElement[], destPile: HTMLElement) { 
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

    function moveCards(cards: HTMLElement[], fromPile: HTMLElement, toPile: HTMLElement) { 
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

      if (fromPile.id === 'waste') {
        const newWasteTopCard = fromPile.lastElementChild as HTMLElement;
        if (newWasteTopCard && !newWasteTopCard.classList.contains('pile-placeholder')) {
          newWasteTopCard.draggable = true;
        }
      }

      if(checkWinCondition()) return;
      checkForWinnableState();
    }

    function drawFromStock() {
      if (currentPlayerId === 'Requires Farcaster') return;

      const currentWasteTopCard = wastePile!.lastElementChild as HTMLElement;
      if (currentWasteTopCard && !currentWasteTopCard.classList.contains('pile-placeholder')) {
        currentWasteTopCard.draggable = false;
      }

      if (stockPile!.children.length > 1) { 
        const card = stockPile!.lastElementChild as HTMLElement;
        card.classList.remove('face-down');
        card.draggable = true;
        wastePile!.appendChild(card);
        if(wastePile!.querySelector('.pile-placeholder')) (wastePile!.querySelector('.pile-placeholder') as HTMLElement)!.style.display = 'none';
      } else {
        const wasteCards = Array.from(wastePile!.querySelectorAll('.card')).reverse() as HTMLElement[];
        wasteCards.forEach(card => {
        card.classList.add('face-down');
        card.draggable = false;
        stockPile!.appendChild(card);
        });
        if(wastePile!.querySelector('.pile-placeholder')) (wastePile!.querySelector('.pile-placeholder') as HTMLElement)!.style.display = 'block';

        if(wastePile!.querySelector('.pile-placeholder')) (wastePile!.querySelector('.pile-placeholder') as HTMLElement)!.style.display = 'block';
      }

      if(stockPile!.children.length > 1 && stockPile!.querySelector('.pile-placeholder')) (stockPile!.querySelector('.pile-placeholder') as HTMLElement)!.style.display = 'none';
      else if (stockPile!.children.length <=1 && stockPile!.querySelector('.pile-placeholder')) (stockPile!.querySelector('.pile-placeholder') as HTMLElement)!.style.display = 'block';
    }

    function onDragStart(e: DragEvent) {
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
      if (currentPlayerId === 'Requires Farcaster') return;

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
      if (currentPlayerId === 'Requires Farcaster') return;

      const faceDownCards = document.querySelectorAll('.tableau .card.face-down');
      if (stockPile!.children.length <= 1 && faceDownCards.length === 0) {
        autoFinishBtn!.style.display = 'inline-block';
      } else {
        autoFinishBtn!.style.display = 'none';
      }
    }

    function startAutoComplete() {
      if (currentPlayerId === 'Requires Farcaster') return;

      autoFinishBtn!.disabled = true;
      const autoMoveInterval = setInterval(() => {
        let cardMoved = false;

        const movableCards = [...tableauPiles, wastePile].map(p => p!.lastElementChild).filter(c => c && !c.classList.contains('pile-placeholder')) as HTMLElement[];

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
          autoFinishBtn!.disabled = false;
        }
      }, 150);
    }

    // Farcaster Giriş Simülasyonu
    farcasterLoginBtnWall!.addEventListener('click', () => {
      const simulatedUsername = prompt("Farcaster Kullanıcı Adınızı Girin (Örn: @kullaniciadi)");
      if (simulatedUsername && simulatedUsername.trim() !== "") {
        // Mevcut oyunu kaydet (Bu kısım zaten 'Requires Farcaster' olduğu için bir şey kaydetmeyecek)
        handleGameEndOrReset(false);

        // Yeni kullanıcıyı ayarla
        currentPlayerId = simulatedUsername.trim();
        updatePlayerStatus();
        farcasterWall!.classList.add('hidden'); // Duvarı kaldır
        resetGame(); // Oyunu başlat
        // alert(`Başarıyla giriş yapıldı: ${currentPlayerId}. Yeni bir oyuna başlayabilirsiniz.`);
      }
    });


    // Event Listeners
    newGameButtons.forEach(btn => btn.addEventListener('click', resetGame));

    [...foundationPiles, ...tableauPiles].forEach(pile => {
    // pile'ı forEach döngüsü içinde HTMLElement'a çeviriyoruz.
    const htmlPile = pile as HTMLElement;

    // Listener fonksiyonlarını genel EventListener tipine dönüştürerek uyumluluğu sağlıyoruz.
    htmlPile.addEventListener('dragover', onDragOver as unknown as EventListener);
    htmlPile.addEventListener('drop', onDrop as unknown as EventListener);
    });

    stockPile!.addEventListener('click', drawFromStock);
    autoFinishBtn!.addEventListener('click', startAutoComplete);
    leaderboardBtn!.addEventListener('click', showLeaderboard);
    closeLeaderboardBtn!.addEventListener('click', () => leaderboardModal!.classList.remove('show'));

    // Başlangıçta sadece Farcaster Wall görünür.
    updatePlayerStatus();
    // resetGame() çağrılmıyor, ilk oyun Farcaster girişiyle başlayacak.
    
    // --- Solitaire Oyununun TÜM JavaScript Kodu Sonu ---

  }, []); // [] ile sadece ilk render'da çalışmasını sağlıyoruz

  // YUKARIDA GÖNDERDİĞİNİZ <body> İÇERİĞİNDEKİ TÜM HTML YAPISI
  return (
    // body etiketi yerine React'te doğrudan döndürülür
    <>
        <div id="farcaster-wall">
          <h2>Farcaster Girişi Gerekli</h2>
          <p>Lütfen Solitaire oynamaya başlamak ve skorunuzu kaydetmek için Farcaster hesabınızla giriş yapın.</p>
          <button id="farcaster-login-btn-wall" className="control-btn" style={{fontSize: '1.2rem', padding: '15px 30px'}} onClick={farcasterLoginSimulation}>
            Farcaster ile Giriş Yap
          </button>
        </div>

        <div className="game-container" id="game-container">
          <h1>Solitaire</h1>
          <div className="score-display">Score: 0</div>

          <div id="current-player-status"></div>

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