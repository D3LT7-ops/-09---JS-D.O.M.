class ColorChallengeGame {
    constructor() {
        this.colors = [
            { name: 'Vermelho', value: '#FF4444' },
            { name: 'Azul', value: '#4444FF' },
            { name: 'Verde', value: '#44FF44' },
            { name: 'Amarelo', value: '#FFFF44' },
            { name: 'Roxo', value: '#FF44FF' },
            { name: 'Laranja', value: '#FF8844' },
            { name: 'Rosa', value: '#FF88FF' },
            { name: 'Ciano', value: '#44FFFF' },
            { name: 'Marrom', value: '#8B4513' },
            { name: 'Cinza', value: '#888888' },
            { name: 'Lime', value: '#88FF88' },
            { name: 'Índigo', value: '#4B0082' }
        ];  
        this.gameState = {
            isPlaying: false,
            score: 0,
            timeLeft: 30,
            targetColor: null,
            gridColors: [],
            level: 1,
            combo: 0,
            maxCombo: 0,
            playerName: '',
            gameTimer: null,
            gridSize: 4
        }; 
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            end: document.getElementById('end-screen'),
            ranking: document.getElementById('ranking-screen')
        }; 
        this.elements = {
            scoreDisplay: document.getElementById('score'),
            timerDisplay: document.getElementById('timer'),
            targetColor: document.getElementById('target-color'),
            targetColorName: document.getElementById('target-color-name'),
            colorGrid: document.getElementById('color-grid'),
            comboDisplay: document.getElementById('combo'),
            levelDisplay: document.getElementById('level'),
            playerNameInput: document.getElementById('player-name'),
            finalPlayerName: document.getElementById('final-player-name'),
            finalScore: document.getElementById('final-score'),
            finalLevel: document.getElementById('final-level'),
            finalCombo: document.getElementById('final-combo'),
            rankingList: document.getElementById('ranking-list')
        }; 
        this.initializeEventListeners();
        this.loadRanking();
    }   
    initializeEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('ranking-btn').addEventListener('click', () => this.showRanking());
        document.getElementById('play-again-btn').addEventListener('click', () => this.startGame());
        document.getElementById('view-ranking-btn').addEventListener('click', () => this.showRanking());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showStartScreen());
        document.getElementById('back-from-ranking-btn').addEventListener('click', () => this.showStartScreen());
        this.elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
    }   
    startGame() {
        const playerName = this.elements.playerNameInput.value.trim();
        if (!playerName) {
            alert('Por favor, digite seu nome para jogar!');
            this.elements.playerNameInput.focus();
            return;
        }        
        this.gameState.playerName = playerName;
        this.resetGameState();
        this.showScreen('game');
        this.generateNewRound();
        this.startTimer();
    } 
    resetGameState() {
        this.gameState.isPlaying = true;
        this.gameState.score = 0;
        this.gameState.timeLeft = 30;
        this.gameState.level = 1;
        this.gameState.combo = 0;
        this.gameState.maxCombo = 0;
        this.updateDisplay();
    }   
    generateNewRound() {
        this.gameState.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.generateColorGrid();
        this.updateTargetColor();
        this.updateColorGrid();
    }   
    generateColorGrid() {
        const gridSize = this.gameState.gridSize;
        const totalSquares = gridSize * gridSize;
        this.gameState.gridColors = [];
        this.gameState.gridColors.push(this.gameState.targetColor);
        for (let i = 1; i < totalSquares; i++) {
            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.gameState.gridColors.push(randomColor);
        }
        this.shuffleArray(this.gameState.gridColors);
    }   
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }    
    updateTargetColor() {
        this.elements.targetColor.style.backgroundColor = this.gameState.targetColor.value;
        this.elements.targetColorName.textContent = this.gameState.targetColor.name;
    }   
    updateColorGrid() {
        this.elements.colorGrid.innerHTML = '';    
        this.gameState.gridColors.forEach((color, index) => {
            const square = document.createElement('div');
            square.className = 'color-square';
            square.style.backgroundColor = color.value;
            square.addEventListener('click', () => this.handleColorClick(color, square));
            this.elements.colorGrid.appendChild(square);
        });
    }   
    handleColorClick(clickedColor, square) {
        if (!this.gameState.isPlaying) return;
        
        if (clickedColor.name === this.gameState.targetColor.name) {
            this.handleCorrectClick(square);
        } else {
            this.handleWrongClick(square);
        }
    }    
    handleCorrectClick(square) {
        square.classList.add('correct');
        const basePoints = 10;
        const comboBonus = this.gameState.combo * 2;
        const levelBonus = this.gameState.level * 5;
        const points = basePoints + comboBonus + levelBonus; 
        this.gameState.score += points;
        this.gameState.combo++;
        this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
        if (this.gameState.combo > 0 && this.gameState.combo % 10 === 0) {
            this.gameState.level++;
            this.gameState.gridSize = Math.min(5, 3 + Math.floor(this.gameState.level / 2));
        }
        this.updateDisplay();
        setTimeout(() => {
            this.generateNewRound();
        }, 300);
    }
    handleWrongClick(square) {
        square.classList.add('wrong');
        this.gameState.score = Math.max(0, this.gameState.score - 5);
        this.gameState.combo = 0;  
        this.updateDisplay();
        setTimeout(() => {
            square.classList.remove('wrong');
        }, 500);
    }
    
    updateDisplay() {
        this.elements.scoreDisplay.textContent = this.gameState.score;
        this.elements.timerDisplay.textContent = this.gameState.timeLeft;
        this.elements.comboDisplay.textContent = this.gameState.combo;
        this.elements.levelDisplay.textContent = this.gameState.level;
    }
    
    startTimer() {
        this.gameState.gameTimer = setInterval(() => {
            this.gameState.timeLeft--;
            this.updateDisplay();
            
            if (this.gameState.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    endGame() {
        this.gameState.isPlaying = false;
        clearInterval(this.gameState.gameTimer);
        this.saveResult();
        this.showFinalResults();
        this.showScreen('end');
    }
    
    showFinalResults() {
        this.elements.finalPlayerName.textContent = this.gameState.playerName;
        this.elements.finalScore.textContent = this.gameState.score;
        this.elements.finalLevel.textContent = this.gameState.level;
        this.elements.finalCombo.textContent = this.gameState.maxCombo;
    }
    
    saveResult() {
        const ranking = this.loadRanking();
        
        const newResult = {
            name: this.gameState.playerName,
            score: this.gameState.score,
            level: this.gameState.level,
            maxCombo: this.gameState.maxCombo,
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        ranking.push(newResult);
        ranking.sort((a, b) => b.score - a.score);
        const topRanking = ranking.slice(0, 10);
        this.saveRanking(topRanking);
    }   
    loadRanking() {
        if (!window.gameRanking) {
            window.gameRanking = [];
        }
        return [...window.gameRanking];
    }   
    saveRanking(ranking) {
        window.gameRanking = ranking;
    }    
    showRanking() {
        const ranking = this.loadRanking();
        this.elements.rankingList.innerHTML = '';       
        if (ranking.length === 0) {
            this.elements.rankingList.innerHTML = '<div class="no-ranking">Nenhum resultado ainda. Seja o primeiro a jogar!</div>';
        } else {
            ranking.forEach((result, index) => {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                if (index === 0) item.classList.add('gold');
                else if (index === 1) item.classList.add('silver');
                else if (index === 2) item.classList.add('bronze');
                
                const position = index + 1;
                const medal = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : `${position}º`;
                item.innerHTML = `
                    <div class="ranking-position">${medal}</div>
                    <div class="ranking-name">${result.name}</div>
                    <div class="ranking-score">${result.score} pts</div>
                `;
                
                this.elements.rankingList.appendChild(item);
            });
        }
        
        this.showScreen('ranking');
    }   
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });   
        this.screens[screenName].classList.remove('hidden');
    }    
    showStartScreen() {
        this.showScreen('start');
        this.elements.playerNameInput.focus();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ColorChallengeGame();
});
