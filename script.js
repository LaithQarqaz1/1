// قائمة الإيموجيات
const cardsArray = [
    '🍎', '🍎', '🍌', '🍌', '🍉', '🍉', '🍋', '🍋',
    '🍇', '🍇', '🥭', '🥭', '🍊', '🍊', '🥥', '🥥'
];

// عناصر الواجهة
let grid = document.getElementById('grid');
let movesElement = document.getElementById('moves');
let timerElement = document.getElementById('timer');
let messageElement = document.getElementById('message');
let restartBtn = document.getElementById('restart-btn');

// متغيرات اللعبة
let cards = [];
let flippedCards = [];
let matchedCards = 0;
let moves = 0;
let timer;
let seconds = 0;

// وظيفة لتبديل ترتيب البطاقات بشكل عشوائي
function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

// وظيفة لإنشاء لوحة اللعبة
function createBoard() {
    shuffle(cardsArray); // تبديل ترتيب البطاقات بشكل عشوائي
    grid.innerHTML = '';
    cardsArray.forEach((item, index) => {
        let card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = item;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
        cards.push(card);
    });
}

// وظيفة لتقليب البطاقة
function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        this.textContent = this.dataset.value;
        flippedCards.push(this);
        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }
}

// وظيفة للتحقق من تطابق البطاقات المقلوبة
function checkForMatch() {
    moves++;
    movesElement.textContent = `الحركات: ${moves}`;
    let [card1, card2] = flippedCards;
    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCards += 2;
        flippedCards = [];
        if (matchedCards === cardsArray.length) {
            clearInterval(timer);
            messageElement.textContent = 'لقد فزت!';
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            flippedCards = [];
        }, 1000);
    }
}

// وظيفة لبدء العد الزمني
function startTimer() {
    timer = setInterval(() => {
        seconds++;
        timerElement.textContent = `الوقت: ${seconds} ثانية`;
    }, 1000);
}

// وظيفة لإعادة تعيين اللعبة
function resetGame() {
    clearInterval(timer);
    seconds = 0;
    moves = 0;
    matchedCards = 0;
    flippedCards = [];
    cards = [];
    movesElement.textContent = 'الحركات: 0';
    timerElement.textContent = 'الوقت: 0 ثانية';
    messageElement.textContent = '';
    createBoard();
    startTimer();
}

// إعادة تشغيل اللعبة عند النقر على زر إعادة البدء
restartBtn.addEventListener('click', resetGame);

// إنشاء لوحة اللعبة وبدء العد الزمني عند تحميل الصفحة
createBoard();
startTimer();
