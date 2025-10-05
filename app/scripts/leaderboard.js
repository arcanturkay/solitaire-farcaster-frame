// app/scripts/leaderboard.js
export function initLeaderboard() {
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardTableBody = leaderboardModal ? leaderboardModal.querySelector('tbody') : null;
    const closeBtn = document.getElementById('close-leaderboard-btn');

    if (!leaderboardBtn || !leaderboardModal || !leaderboardTableBody || !closeBtn)
        return { saveScore: () => {}, renderLeaderboard: () => {} };

    function getScores() {
        const raw = localStorage.getItem('solitaireLeaderboard');
        if (!raw) return [];
        try { return JSON.parse(raw); } catch { return []; }
    }

    function saveScore(playerId, score) {
        const scores = getScores();
        const existing = scores.find(s => s.playerId === playerId);
        if (existing) {
            existing.totalScore += score;
        } else {
            scores.push({ playerId, totalScore: score });
        }
        localStorage.setItem('solitaireLeaderboard', JSON.stringify(scores));
    }

    function renderLeaderboard() {
        const scores = getScores();
        scores.sort((a, b) => b.totalScore - a.totalScore);
        leaderboardTableBody.innerHTML = '';
        scores.forEach((s, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i + 1}</td><td>${s.playerId}</td><td>${s.totalScore}</td>`;
            leaderboardTableBody.appendChild(tr);
        });
    }

    leaderboardBtn.addEventListener('click', () => {
        renderLeaderboard();
        leaderboardModal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => leaderboardModal.classList.remove('show'));

    return { saveScore, renderLeaderboard };
}
