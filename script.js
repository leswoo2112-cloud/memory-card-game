const board = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const modeSelect = document.getElementById("modeSelect");
const timeText = document.getElementById("time");
const scoreText = document.getElementById("score");
const totalText = document.getElementById("total");
const bestText = document.getElementById("best");
const guide = document.getElementById("guide");
const countdown = document.getElementById("countdown");

const icons = [
  "🍎", "🍌", "🍇", "🍓", "🐶", "🐱", "⚽", "🚗",
  "⭐", "🎵", "🎈", "🍀", "🐹", "🦊", "🍕", "🚀",
  "🌙", "☀️"
];

let firstCard = null;
let secondCard = null;
let lock = false;
let score = 0;
let totalPairs = 8;
let time = 90;
let timer = null;
let currentMode = "brain";
let started = false;

function getBestKey() {
  return "memoryBest_" + currentMode;
}

function loadBest() {
  bestText.textContent = localStorage.getItem(getBestKey()) || 0;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function setModeInfo() {
  currentMode = modeSelect.value;

  if (currentMode === "brain") {
    time = 90;
    totalPairs = 8;
    guide.textContent = "🟢 치매 예방 모드: 5초 동안 카드를 보고 기억해용.";
  } else if (currentMode === "normal") {
    time = 60;
    totalPairs = 8;
    guide.textContent = "🔵 일반 모드: 3초 동안 보고 짝을 맞춰용.";
  } else {
    time = 45;
    totalPairs = 18;
    guide.textContent = "🔴 스피드 모드: 6×6 카드, 빠르게 맞춰용!";
  }

  timeText.textContent = time;
  totalText.textContent = totalPairs;
  scoreText.textContent = 0;
  loadBest();
}

function makeBoard() {
  board.innerHTML = "";
  board.className = "board " + currentMode;

  const selectedIcons = icons.slice(0, totalPairs);
  const gameIcons = shuffle([...selectedIcons, ...selectedIcons]);

  gameIcons.forEach(icon => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.icon = icon;

    card.innerHTML = `
      <div class="inner">
        <div class="front">🧠</div>
        <div class="back">${icon}</div>
      </div>
    `;

    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });
}

function previewCards() {
  const previewTime = currentMode === "brain" ? 5 : currentMode === "normal" ? 3 : 2;
  let count = previewTime;

  document.querySelectorAll(".card").forEach(card => {
    card.classList.add("open");
  });

  countdown.textContent = count + "초 기억!";

  const previewTimer = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.textContent = count + "초 기억!";
    } else {
      clearInterval(previewTimer);
      document.querySelectorAll(".card").forEach(card => {
        card.classList.remove("open");
      });
      countdown.textContent = "START!";
      setTimeout(() => {
        countdown.textContent = "";
        startTimer();
        started = true;
      }, 700);
    }
  }, 1000);
}

function startGame() {
  clearInterval(timer);
  setModeInfo();

  firstCard = null;
  secondCard = null;
  lock = false;
  score = 0;
  started = false;

  scoreText.textContent = score;
  startBtn.disabled = true;

  makeBoard();
  previewCards();
}

function startTimer() {
  timer = setInterval(() => {
    time--;
    timeText.textContent = time;

    if (time <= 0) {
      endGame(false);
    }
  }, 1000);
}

function flipCard(card) {
  if (!started) return;
  if (lock) return;
  if (card.classList.contains("open")) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("open");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lock = true;

  if (firstCard.dataset.icon === secondCard.dataset.icon) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    score++;
    scoreText.textContent = score;

    firstCard = null;
    secondCard = null;
    lock = false;

    if (navigator.vibrate) navigator.vibrate(40);

    if (score === totalPairs) {
      endGame(true);
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove("open");
      secondCard.classList.remove("open");

      firstCard = null;
      secondCard = null;
      lock = false;
    }, 650);
  }
}

function endGame(success) {
  clearInterval(timer);
  started = false;
  startBtn.disabled = false;

  if (success) {
    const usedTime =
      currentMode === "brain" ? 90 - time :
      currentMode === "normal" ? 60 - time :
      45 - time;

    const best = Number(localStorage.getItem(getBestKey()) || 0);

    if (best === 0 || usedTime < best) {
      localStorage.setItem(getBestKey(), usedTime);
      bestText.textContent = usedTime;
    }

    alert("🎉 성공!\n걸린 시간: " + usedTime + "초\n최고기록: " + bestText.textContent + "초");
  } else {
    alert("⏰ 시간 종료!\n다시 도전해봐용!");
  }
}

modeSelect.addEventListener("change", setModeInfo);
startBtn.addEventListener("click", startGame);

setModeInfo();
makeBoard();