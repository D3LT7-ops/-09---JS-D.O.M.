let gameState = {
    score: 0,
    timeLeft: 30,
    targetColor: '',
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'],
    colorNames: {
        'red': 'Vermelho',
        'blue': 'Azul', 
        'green': 'Verde',
        'yellow': 'Amarelo',
        'purple': 'Roxo',
        'orange': 'Laranja',
        'pink': 'Rosa',
        'cyan': 'Ciano'
    },
    isPlaying: false,
    streak: 0,
    maxStreak: 0,
    playerName: '',
    gameTimer: null
};

function startGame() {
    const playerName = document.getElementById('player-name').value.trim();
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

    // Trocar telas
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');

    createGameGrid();
    chooseNewTargetColor();
    startTimer();
    updateUI();
}
function createGameGrid() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const square = document.createElement('div');
        square.classList.add('color-square');
        square.onclick = () => checkColor(square);
        grid.appendChild(square);
    }
    colorizeGrid();
}

function colorizeGrid() {
    const squares = document.querySelectorAll('.color-square');
    squares.forEach(square => {
        const randomColor = gameState.colors[Math.floor(Math.random() * gameState.colors.length)];
        square.style.backgroundColor = randomColor;
        square.dataset.color = randomColor;
    });
}

function chooseNewTargetColor() {
    gameState.targetColor = gameState.colors[Math.floor(Math.random() * gameState.colors.length)];
    document.getElementById('target-color-name').textContent = gameState.colorNames[gameState.targetColor];
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
        setTimeout(() => {
            square.style.transform = 'scale(1)';
        }, 200);
        
    } else {
        gameState.score = Math.max(0, gameState.score - 5);
        gameState.streak = 0;
        square.style.border = '3px solid red';
        setTimeout(() => {
            square.style.border = '3px solid rgba(255, 255, 255, 0.3)';
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
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('timer').textContent = gameState.timeLeft;
    document.getElementById('streak').textContent = gameState.streak;
    const progress = ((30 - gameState.timeLeft) / 30) * 100;
    document.getElementById('progress').style.width = progress + '%';
}
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameTimer);
    saveResult();
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-player-name').textContent = gameState.playerName;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-streak').textContent = gameState.maxStreak;
    showRanking();
}

function saveResult() {
    let rankings = JSON.parse(localStorage.getItem('colorChallengeRanking')) || [];
    
    const result = {
        name: gameState.playerName,
        score: gameState.score,
        maxStreak: gameState.maxStreak,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
        totalClicks: Math.floor((30 - gameState.timeLeft) * 2.5) // Estimativa de cliques
    };
    
    rankings.push(result);
    rankings.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return b.maxStreak - a.maxStreak;
    });

    rankings = rankings.slice(0, 15);
    
    localStorage.setItem('colorChallengeRanking', JSON.stringify(rankings));
}
function showRanking() {
    const rankings = JSON.parse(localStorage.getItem('colorChallengeRanking')) || [];
    const rankingList = document.getElementById('ranking-list');
    
    if (rankings.length === 0) {
        rankingList.innerHTML = '<p style="text-align: center; opacity: 0.7;">Nenhum record ainda! Seja o primeiro!</p>';
        return;
    }
    rankingList.innerHTML = '';  
    rankings.forEach((result, index) => {
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
                <span> ${result.date} às ${result.time || 'N/A'}</span>
                <span> Eficiência: ${efficiency} pts/seq</span>
            </div>
        `;
        
        rankingList.appendChild(item);
    });
    const clearBtn = document.createElement('button');
    clearBtn.classList.add('clear-ranking-btn');
    clearBtn.textContent = 'Limpar Ranking';
    clearBtn.onclick = clearRanking;
    rankingList.appendChild(clearBtn);
}

function clearRanking() {
    if (confirm('Tem certeza que deseja limpar todo o ranking?')) {
        localStorage.removeItem('colorChallengeRanking');
        showRanking();
    }
}

function restartGame() {
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('player-name').value = gameState.playerName;
}

window.onload = function() {
    showRanking();
};