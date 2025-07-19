let gameState = {
    score: 0,
    timeLeft: 30,
    targetColor: '',
    colors: [
        '#ff0000', // Vermelho
        '#0000ff', // Azul
        '#008000', // Verde
        '#ffff00', // Amarelo
        '#800080', // Roxo
        '#ffa500', // Laranja
        '#ffc0cb', // Rosa
        '#00ffff'  // Ciano
    ],
    colorNames: {
        '#ff0000': 'Vermelho',
        '#0000ff': 'Azul',
        '#008000': 'Verde',
        '#ffff00': 'Amarelo',
        '#800080': 'Roxo',
        '#ffa500': 'Laranja',
        '#ffc0cb': 'Rosa',
        '#00ffff': 'Ciano'
    },
    isPlaying: false,
    streak: 0,
    maxStreak: 0,
    playerName: '',
    gameTimer: null
};
let persistentRanking = [];
const elements = {
    startScreen: null,
    gameScreen: null,
    gameOverScreen: null,
    playerName: null,
    score: null,
    timer: null,
    streak: null,
    progress: null,
    targetColorName: null,
    gameGrid: null,
    finalPlayerName: null,
    finalScore: null,
    finalStreak: null,
    rankingList: null,
    rankingListGameOver: null
};
function initElements() {
    elements.startScreen = document.getElementById('start-screen');
    elements.gameScreen = document.getElementById('game-screen');
    elements.gameOverScreen = document.getElementById('game-over-screen');
    elements.playerName = document.getElementById('player-name');
    elements.score = document.getElementById('score');
    elements.timer = document.getElementById('timer');
    elements.streak = document.getElementById('streak');
    elements.progress = document.getElementById('progress');
    elements.targetColorName = document.getElementById('target-color-name');
    elements.gameGrid = document.getElementById('game-grid');
    elements.finalPlayerName = document.getElementById('final-player-name');
    elements.finalScore = document.getElementById('final-score');
    elements.finalStreak = document.getElementById('final-streak');
    elements.rankingList = document.getElementById('ranking-list');
    elements.rankingListGameOver = document.getElementById('ranking-list-game-over');
}
function startGame() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        alert('Por favor, digite seu nome!');
        return;
    }
    gameState.playerName = playerName;
    gameState.score = 0;
    gameState.timeLeft = 30;
    gameState.streak = 0;
    gameState.maxStreak = 0;
    gameState.isPlaying = true;
    elements.startScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    elements.gameOverScreen.classList.add('hidden');
    createGameGrid();
    chooseNewTargetColor();
    startTimer();
    updateUI();
}
function createGameGrid() {
    const grid = elements.gameGrid;
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 16; i++) {
        const square = document.createElement('div');
        square.classList.add('color-square');
        square.addEventListener('click', () => checkColor(square));
        fragment.appendChild(square);
    }
    grid.appendChild(fragment);
    colorizeGrid();
}
function colorizeGrid() {
    const squares = elements.gameGrid.children;
    const colors = gameState.colors;
    const targetColor = gameState.targetColor;
    const targetSquareIndex = Math.floor(Math.random() * 16);
    for (let i = 0; i < squares.length; i++) {
        let color;
        if (i === targetSquareIndex) {
            color = targetColor;
        } else {
            color = colors[Math.floor(Math.random() * colors.length)];
        }
        squares[i].style.backgroundColor = color;
        squares[i].dataset.color = color;
    }
}
function chooseNewTargetColor() {
    const colors = gameState.colors;
    gameState.targetColor = colors[Math.floor(Math.random() * colors.length)];
    elements.targetColorName.textContent = gameState.colorNames[gameState.targetColor];
}
function checkColor(square) {
    if (!gameState.isPlaying) return;
    const clickedColor = square.dataset.color;
    if (clickedColor === gameState.targetColor) {
        gameState.score += 10 + (gameState.streak * 5);
        gameState.streak++;
        if (gameState.streak > gameState.maxStreak) {
            gameState.maxStreak = gameState.streak;
        }
        square.style.transform = 'scale(1.2)';
        square.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.7)';
        setTimeout(() => {
            square.style.transform = '';
            square.style.boxShadow = '';
        }, 200);
    } else {
        gameState.score = Math.max(0, gameState.score - 5);
        gameState.streak = 0;
        square.style.border = '3px solid #ff0000';
        square.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
        setTimeout(() => {
            square.style.border = '3px solid rgba(255, 255, 255, 0.3)';
            square.style.boxShadow = '';
        }, 500);
    }
    chooseNewTargetColor();
    colorizeGrid();
    updateUI();
}
function startTimer() {
    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        updateUI();
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.timer.textContent = gameState.timeLeft;
    elements.streak.textContent = gameState.streak;
    const progress = ((30 - gameState.timeLeft) / 30) * 100;
    elements.progress.style.width = progress + '%';
}
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameTimer);
    saveResult()
    elements.gameScreen.classList.add('hidden');
    elements.gameOverScreen.classList.remove('hidden');
    elements.finalPlayerName.textContent = gameState.playerName;
    elements.finalScore.textContent = gameState.score;
    elements.finalStreak.textContent = gameState.maxStreak;
    showRanking(elements.rankingListGameOver);
}
function saveResult() {
    const result = {
        name: gameState.playerName,
        score: gameState.score,
        maxStreak: gameState.maxStreak,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
        totalClicks: Math.floor((30 - gameState.timeLeft) * 2.5)
    };
    persistentRanking.push(result);
    persistentRanking.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return b.maxStreak - a.maxStreak;
    });
    persistentRanking = persistentRanking.slice(0, 15);
}
function showRanking(container = elements.rankingList) {
    if (persistentRanking.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">Nenhum record ainda! Seja o primeiro!</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    persistentRanking.forEach((result, index) => {
        const item = document.createElement('div');
        item.classList.add('ranking-item');
        
        if (index === 0) item.classList.add('first');
        else if (index === 1) item.classList.add('second');
        else if (index === 2) item.classList.add('third');

        // Definir medalhas
        let medal = '';
        if (index === 0) medal = 'top1';
        else if (index === 1) medal = 'top2';
        else if (index === 2) medal = 'top3';
        else medal = `${index + 1}º`;
        const efficiency = result.maxStreak > 0 ? Math.round(result.score / result.maxStreak) : result.score;
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="medal">${medal}</span>
                    <strong>${result.name}</strong>
                </div>
                <div style="text-align: right;">
                    <div><strong>${result.score}</strong> pontos</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Sequência: ${result.maxStreak}</div>
                </div>
            </div>
            <div class="ranking-stats">
                <span>${result.date} às ${result.time || 'N/A'}</span>
                <span>Eficiência: ${efficiency} pts/seq</span>
            </div>
        `;

        fragment.appendChild(item);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}
function restartGame() {
    elements.gameOverScreen.classList.add('hidden');
    elements.startScreen.classList.remove('hidden');
    elements.playerName.value = gameState.playerName;
    showRanking();
}
window.addEventListener('load', function() {
    initElements();
    showRanking();
    elements.playerName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startGame();
        }
    });
});