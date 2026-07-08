const gameBoard = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const timeText = document.getElementById("time");
const scoreText = document.getElementById("score");

const icons = ["🍎", "🍌", "🍇", "🍓", "🐶", "🐱", "⚽", "🚗"];

let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let score = 0;
let time = 60;
let timer;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startGame() {
  score = 0;
  time = 60;
  firstCard = null;
  secondCard = null;
  lock = false;

  scoreText.textContent = score;
  timeText.textContent = time;
  startBtn.disabled = true;

  const gameIcons = shuffle([...icons, ...icons]);
  gameBoard.innerHTML = "";

  gameIcons.forEach(icon => {
    const card = document.createElement("div");
    card.className = "card hidden";
    card.textContent = icon;

    card.addEventListener("click", () => flipCard(card));

    gameBoard.appendChild(card);
  });

  clearInterval(timer);
  timer = setInterval(() => {
    time--;
    timeText.textContent = time;

    if (time <= 0) {
      endGame(false);
    }
  }, 1000);
}

function flipCard(card) {
  if (lock) return;
  if (!card.classList.contains("hidden")) return;
  if (card.classList.contains("matched")) return;

  card.classList.remove("hidden");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lock = true;

  if (firstCard.textContent === secondCard.textContent) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    score++;
    scoreText.textContent = score;

    firstCard = null;
    secondCard = null;
    lock = false;

    if (score === 8) {
      endGame(true);
    }
  } else {
    setTimeout(() => {
      firstCard.classList.add("hidden");
      secondCard.classList.add("hidden");

      firstCard = null;
      secondCard = null;
      lock = false;
    }, 700);
  }
}

function endGame(success) {
  clearInterval(timer);
  startBtn.disabled = false;

  if (success) {
    alert("성공! 모든 카드를 맞췄어용!");
  } else {
    alert("시간 종료! 다시 도전해봐용!");
  }
}

startBtn.addEventListener("click", startGame);