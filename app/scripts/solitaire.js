// app/scripts/solitaire.js
import { initLeaderboard } from './leaderboard';

let __solitaire_initialized = false;
let __solitaire_reset = null;

export function initSolitaire(startingPlayerId = 'Guest') {
    if (__solitaire_initialized) {
        if (typeof __solitaire_reset === 'function') __solitaire_reset();
        return { reset: __solitaire_reset };
    }

    const { saveScore, renderLeaderboard } = initLeaderboard();

    const stockPile = document.getElementById('stock');
    const wastePile = document.getElementById('waste');
    const foundationPiles = document.querySelectorAll('.foundation');
    const tableauPiles = document.querySelectorAll('.tableau');
    const scoreDisplay = document.querySelector('.score-display');
    const newGameButtons = document.querySelectorAll('.new-game-btn');
    const gameContainer = document.getElementById('game-container');
    const autoFinishBtn = document.getElementById('auto-finish-btn');
    const winModal = document.getElementById('win-modal');
    const finalScoreDisplay = document.getElementById('final-score');
    const winningPlayerNameDisplay = document.getElementById('winning-player-name');
    const currentPlayerStatus = document.getElementById('current-player-status');

    if (!stockPile || !wastePile || tableauPiles.length === 0 || !gameContainer) {
        console.warn('Solitaire init: gerekli DOM elemanları bulunamadı.');
        return { reset: () => {} };
    }

    const SUITS = ['♠','♣','♥','♦'];
    const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck = [];
    let score = 0;
    let cardIdCounter = 0;
    let draggedCards = [];
    let currentPlayerId = startingPlayerId;

    function updatePlayerStatus() {
        if (currentPlayerStatus) currentPlayerStatus.textContent = `Playing as: ${currentPlayerId}`;
    }

    function updateScore(points, absolute = false) {
        if (absolute) score = points;
        else score += points;
        if (score < 0) score = 0;
        if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
    }

    function createDeck() {
        deck = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                deck.push({
                    suit,
                    rank,
                    color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
                    value: RANKS.indexOf(rank) + 1,
                    isFaceUp: false,
                });
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function createCardElement(cardData) {
        const card = document.createElement('div');
        card.id = `card-${cardIdCounter++}`;
        card.classList.add('card', cardData.color);
        if (!cardData.isFaceUp) card.classList.add('face-down');
        else card.draggable = true;
        card.dataset.rank = cardData.rank;
        card.dataset.suit = cardData.suit;
        card.dataset.value = cardData.value;
        card.dataset.color = cardData.color;

        const rank = document.createElement('div');
        rank.classList.add('rank'); rank.textContent = cardData.rank;
        const suit = document.createElement('div');
        suit.classList.add('suit'); suit.textContent = cardData.suit;
        card.appendChild(rank); card.appendChild(suit);

        card.addEventListener('dragstart', onDragStart);
        card.addEventListener('dragend', onDragEnd);
        card.addEventListener('dblclick', onCardDoubleClick);
        return card;
    }

    function onDragStart(e) {
        const target = e.target;
        if (!target || target.classList.contains('face-down')) { e.preventDefault(); return; }

        const pile = target.parentElement;
        if (pile && pile.classList.contains('tableau')) {
            const all = Array.from(pile.children).filter(n => n.classList && n.classList.contains('card'));
            const idx = all.indexOf(target);
            draggedCards = all.slice(idx);
        } else {
            draggedCards = [target];
        }

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', target.id);
        }
        setTimeout(() => draggedCards.forEach(c => c.classList.add('dragging')), 0);
    }

    function onDragEnd() {
        draggedCards.forEach(c => c.classList.remove('dragging'));
        draggedCards = [];
    }

    function onDragOver(e) { e.preventDefault(); }
    function onDrop(e, destPile) {
        e.preventDefault();
        if (!draggedCards || draggedCards.length === 0) return;
        const sourcePile = draggedCards[0].parentElement;
        if (!sourcePile) return;
        if (validateMove(draggedCards, destPile)) moveCards(draggedCards, sourcePile, destPile);
    }

    function onCardDoubleClick(e) {
        const card = e.currentTarget;
        if (!card || card !== card.parentElement?.lastElementChild) return;
        for (const fp of Array.from(foundationPiles)) {
            if (validateMove([card], fp)) {
                moveCards([card], card.parentElement, fp);
                break;
            }
        }
    }

    function validateMove(cardsToMove, destPile) {
        if (!cardsToMove || cardsToMove.length === 0) return false;
        if (destPile === cardsToMove[0].parentElement) return false;
        const top = cardsToMove[0];

        if (destPile.classList.contains('foundation')) {
            if (cardsToMove.length > 1) return false;
            const topCard = destPile.lastElementChild;
            if (!topCard || topCard.classList.contains('pile-placeholder')) return top.dataset.value === '1';
            return topCard.dataset.suit === top.dataset.suit &&
                parseInt(topCard.dataset.value) + 1 === parseInt(top.dataset.value);
        }

        if (destPile.classList.contains('tableau')) {
            const topCard = destPile.lastElementChild;
            if (!topCard) return top.dataset.rank === 'K';
            return topCard.dataset.color !== top.dataset.color &&
                parseInt(topCard.dataset.value) === parseInt(top.dataset.value) + 1;
        }
        return false;
    }

    function moveCards(cards, fromPile, toPile) {
        cards.forEach(c => toPile.appendChild(c));
        if (toPile.classList.contains('foundation')) updateScore(10);
        else if (fromPile.id === 'waste' && toPile.classList.contains('tableau')) updateScore(5);
        else if (fromPile.classList.contains('foundation') && toPile.classList.contains('tableau')) updateScore(-15);

        if (fromPile.classList.contains('tableau') && fromPile.children.length > 0) {
            const top = fromPile.lastElementChild;
            if (top && top.classList.contains('face-down')) {
                top.classList.remove('face-down');
                top.draggable = true;
                updateScore(5);
            }
        }
        checkWinCondition();
        checkForWinnableState();
    }

    function dealCards() {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                const cardData = deck.pop();
                const cardEl = createCardElement(cardData);
                if (j !== i) cardEl.classList.add('face-down');
                tableauPiles[i].appendChild(cardEl);
            }
        }

        while (deck.length > 0) {
            const cardData = deck.pop();
            const cardEl = createCardElement(cardData);
            stockPile.appendChild(cardEl);
        }
    }

    function checkWinCondition() {
        let totalCardsInFoundation = 0;
        foundationPiles.forEach(fp => totalCardsInFoundation += fp.querySelectorAll('.card').length);
        if (totalCardsInFoundation === 52) {
            if (finalScoreDisplay) finalScoreDisplay.textContent = `Final Score: ${score}`;
            if (winningPlayerNameDisplay) winningPlayerNameDisplay.textContent = currentPlayerId;
            saveScore(currentPlayerId, score);
            renderLeaderboard();
            if (winModal) winModal.classList.add('show');
        }
    }

    function startNewGame() {
        deck = [];
        score = 0;
        cardIdCounter = 0;
        draggedCards = [];
        currentPlayerId = localStorage.getItem('currentPlayerId') || 'Guest';
        stockPile.innerHTML = '';
        wastePile.innerHTML = '';
        tableauPiles.forEach(p => p.innerHTML = '');
        foundationPiles.forEach(p => p.innerHTML = '');
        createDeck();
        shuffleDeck();
        dealCards();
        updateScore(0, true);
        updatePlayerStatus();
        if (winModal) winModal.classList.remove('show');
    }

    newGameButtons.forEach(btn => btn.addEventListener('click', startNewGame));
    if (autoFinishBtn) autoFinishBtn.style.display = 'none';

    startNewGame();

    __solitaire_initialized = true;
    __solitaire_reset = startNewGame;

    return { reset: startNewGame };
}
