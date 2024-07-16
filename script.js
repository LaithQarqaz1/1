const allEmojis = [
    '🍎', '🍌', '🍉', '🍋', '🍇', '🥭', '🍊', '🥥',
    '🍍', '🌯', '🍒', '🍓', '🥝', '🍅', '🌽', '🧊',
    '🍈', '🍄', '🥑', '🥕', '🌶️', '🍏', '🍐', '🧁',
    '🍰', '🍫', '🍬', '🍭', '🍮', '🍵', '🍪', '🍩',
    '🍍', '🥞', '🥩', '🥧', '🍯', '🎂', '🌽', '☕',
    '🥜', '🍯', '🥯', '🍿', '🥓', '🌭', '🍔', '🍟',
    '🍕', '🍖', '🍗', '🍤', '🍣', '🍥', '🍙', '🍚',
    '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍦', '🍧'
];

const levels = [
    { gridSize: 4, difficulty: 'لا نهائي' },
    { gridSize: 4, difficulty: 'سهل' },
    { gridSize: 4, difficulty: 'متوسط' },
    { gridSize: 4, difficulty: 'صعب' },
    { gridSize: 4, difficulty: 'صعب2' },
    { gridSize: 6, difficulty: 'لا نهائي' },
    { gridSize: 6, difficulty: 'سهل' },
    { gridSize: 6, difficulty: 'متوسط' },
    { gridSize: 6, difficulty: 'صعب' },
    { gridSize: 6, difficulty: 'صعب2' },
    { gridSize: 8, difficulty: 'لا نهائي' },
    { gridSize: 8, difficulty: 'سهل' },
    { gridSize: 8, difficulty: 'متوسط' },
    { gridSize: 8, difficulty: 'صعب' },
    { gridSize: 8, difficulty: 'صعب2' },
    // يمكنك إضافة مستويات جديدة هنا
];

let currentLevelIndex = 0;
let gridSize;
let difficulty;
let emojis = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
let moves = 0;
let timer;
let timeLeft;
let maxMoves;
let gameStarted = false;

const gridElement = document.getElementById('grid');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const popupWin = document.getElementById('popup-win');
const popupLose = document.getElementById('popup-lose');
const loseReason = document.getElementById('lose-reason');
const restartButton = document.getElementById('restart-btn');
const themeButton = document.getElementById('toggle-theme-btn');
const gridButton = document.getElementById('toggle-grid-btn');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startGame() {
    currentLevelIndex = parseInt(localStorage.getItem('currentLevelIndex')) || 0;  // استرجاع المستوى الحالي من localStorage

    if (currentLevelIndex >= levels.length) {
        alert('لقد أكملت جميع المستويات! يمكنك إعادة اللعبة.');
        currentLevelIndex = 0;
    }

    let level = levels[currentLevelIndex];
    gridSize = level.gridSize;
    difficulty = level.difficulty;

    emojis = allEmojis.slice();
    shuffle(emojis);
    emojis = emojis.slice(0, (gridSize * gridSize) / 2);
    emojis = [...emojis, ...emojis];
    shuffle(emojis);
    createGrid();
    resetStats();
    gameStarted = false;

    // تحديث معلومات المستوى
    updateLevelInfo();
}



function updateLevelInfo() {
    let settings = getSettingsByDifficulty(difficulty, gridSize);
    document.getElementById('level-info').innerText = `***المستوى: ${currentLevelIndex + 1}***`;
    movesElement.textContent = `الحركات: ${settings.moves}`;
    timerElement.textContent = `الوقت: ${settings.time === Infinity ? 'لا نهائي' : settings.time + ' ثانية'}`;
}

document.addEventListener('DOMContentLoaded', startGame);


document.querySelector('.arrow').addEventListener('click', () => {
    window.location.href = 'index.html';
});

function createGrid() {
    gridElement.innerHTML = '';
    gridElement.className = `grid grid-${gridSize}x${gridSize}`;

    emojis.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.addEventListener('click', flipCard);
        gridElement.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    this.classList.add('flipped');
    this.textContent = this.dataset.emoji;

    // تشغيل صوت قلب البطاقة لكل بطاقة تُقلب
    document.getElementById('flip-sound').play();

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;

    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    isMatch ? disableCards() : unflipCards();
}

function createShards(card) {
    const shardCount = 20;
    for (let i = 0; i < shardCount; i++) {
        const shard = document.createElement('div');
        shard.classList.add('shard');
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        shard.style.setProperty('--shard-x', `${x}px`);
        shard.style.setProperty('--shard-y', `${y}px`);
        card.appendChild(shard);
    }
}

function disableCards() {
    createShards(firstCard);
    createShards(secondCard);

    document.getElementById('match-sound').play();

    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
    matches++;
    if (matches === emojis.length / 2) {
        setTimeout(showWinPopup, 1000);
    }
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.textContent = '';
        secondCard.textContent = '';
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
    moves++;
    movesElement.textContent = `الحركات: ${maxMoves - moves}`;
    if (moves >= maxMoves) {
        setTimeout(() => showLosePopup('لقد استنفدت جميع الحركات'), 500);
    }
}

function resetStats() {
    matches = 0;
    moves = 0;
    clearInterval(timer);

    let settings = getSettingsByDifficulty(difficulty, gridSize);
    timeLeft = settings.time;
    maxMoves = settings.moves;

    movesElement.textContent = `الحركات: ${maxMoves}`;
    timerElement.textContent = `الوقت: ${timeLeft === Infinity ? 'لا نهائي' : timeLeft + ' ثانية'}`;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft > 0 && timeLeft !== Infinity) {
            timeLeft--;
            timerElement.textContent = `الوقت: ${timeLeft} ثانية`;
            if (timeLeft <= 0) {
                showLosePopup('لقد نفد الوقت');
            }
        }
    }, 1000);
}

function getSettingsByDifficulty(difficulty, gridSize) {
    const settings = {
        "4": {
            "سهل": { time: 65, moves: 50 },
            "متوسط": { time: 45, moves: 30 },
            "صعب": { time: 35, moves: 25 },
            "صعب2": { time: 35, moves: 20 },
            "لا نهائي": { time: Infinity, moves: Infinity }
        },
        "6": {
            "سهل": { time: 165, moves: 100 },
            "متوسط": { time: 120, moves: 75 },
            "صعب": { time: 80, moves: 55 },
            "صعب2": { time: 80, moves: 45 },
            "لا نهائي": { time: Infinity, moves: Infinity }
        },
        "8": {
            "سهل": { time: 220, moves: 150 },
            "متوسط": { time: 180, moves: 125 },
            "صعب": { time: 120, moves: 100 },
            "صعب2": { time: 100, moves: 85 },
            "لا نهائي": { time: Infinity, moves: Infinity }
        }
    };

    return settings[gridSize][difficulty];
}

function showWinPopup() {
    isGameActive = false;
    clearInterval(timer);
    popupWin.classList.add('active');
    setTimeout(() => {
        popupWin.classList.remove('active');
        currentLevelIndex++;
        startGame();
    }, 2000);
}

function nextLevel() {
    popupWin.classList.remove('active');
    currentLevelIndex++;
    
    // حفظ المستوى الحالي في localStorage
    localStorage.setItem('currentLevelIndex', currentLevelIndex);
    
    // تحقق إذا كانت جميع المستويات قد انتهت
    if (currentLevelIndex >= levels.length) {
        alert('لقد أكملت جميع المستويات! يمكنك إعادة اللعبة.');
        currentLevelIndex = 0; // إعادة تعيين للمستوى الأول
        localStorage.setItem('currentLevelIndex', currentLevelIndex);
    }

    startGame();
    lockBoard = false;
}

function showLosePopup(reason) {
    loseReason.textContent = reason;
    popupLose.classList.add('active');
    lockBoard = true;
}

function resetCurrentLevel() {
    popupWin.classList.remove('active');
    popupLose.classList.remove('active');
    startGame();
    lockBoard = false;
}

function toggleTheme() {
    const currentTheme = document.body.dataset.theme;
    let newTheme;
    switch (currentTheme) {
        case 'dark':
            newTheme = 'light';
            break;
        case 'light':
            newTheme = 'background1';
            break;
        case 'background1':
            newTheme = 'background2';
            break;
        case 'background2':
        default:
            newTheme = 'dark';
            break;
    }
    document.body.dataset.theme = newTheme;
}

document.body.dataset.theme = 'dark'; // تعيين الثيم الافتراضي


restartButton.addEventListener('click', resetCurrentLevel);
themeButton.addEventListener('click', toggleTheme);

startGame();
