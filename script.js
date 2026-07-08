const board = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const modeSelect = document.getElementById("modeSelect");
const levelSelect = document.getElementById("levelSelect");
const timeSelect = document.getElementById("timeSelect");
const timeText = document.getElementById("time");
const scoreText = document.getElementById("score");
const totalText = document.getElementById("total");
const bestText = document.getElementById("best");
const guide = document.getElementById("guide");
const countdown = document.getElementById("countdown");
const starsText = document.getElementById("stars");

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
let maxTime = 90;
let timer = null;
let currentMode = "brain";
let currentLevel = "easy";
let started = false;

function getBestKey() {
  return "memoryBest_" + currentMode + "_" + currentLevel + "_" + maxTime;
}

function loadBest() {
  bestText.textContent = localStorage.getItem(getBestKey()) || 0;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function setGameInfo() {
  currentMode = modeSelect.value;
  currentLevel = levelSelect.value;
  maxTime = Number(timeSelect.value);
  time = maxTime;

  totalPairs = currentLevel === "easy" ? 8 : 18;

  timeText.textContent = time;
  totalText.textContent = totalPairs;
  scoreText.textContent = 0;
  starsText.textContent = "⭐ 별 평가: -";

  if (currentMode === "brain") {
    guide.textContent = "🟢 치매 예방 모드: 카드를 오래 보고 기억해용.";
  } else if (currentMode === "normal") {
    guide.textContent = "🔵 일반 모드: 같은 그림 2장을 찾아용.";
  } else {
    guide.textContent = "🔴 스피드 모드: 빠르게 맞추면 높은 별점!";
  }

  loadBest();
}

function makeBoard() {
  board.innerHTML = "";
  board.className = "board " + currentLevel;

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

function getPreviewTime() {
  if (currentMode === "brain") return 5;
  if (currentMode === "normal") return 3;
  return 2;
}

function previewCards() {
  let count = getPreviewTime();
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.classList.add("open");
  });

  countdown.textContent = count + "초 기억하세요!";

  const preview = setInterval(() => {
    count--;

    if (count > 0) {
      countdown.textContent = count + "초 기억하세요!";
    } else {
      clearInterval(preview);

      cards.forEach(card => {
        card.classList.remove("open");
      });

      countdown.textContent = "시작!";

      setTimeout(() => {
        countdown.textContent = "";
        started = true;
        startTimer();
      }, 700);
    }
  }, 1000);
}

function startGame() {
  clearInterval(timer);
  setGameInfo();

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

function getStars(usedTime) {
  const ratio = usedTime / maxTime;

  if (ratio <= 0.35) return "⭐⭐⭐";
  if (ratio <= 0.65) return "⭐⭐";
  return "⭐";
}

function endGame(success) {
  clearInterval(timer);
  started = false;
  startBtn.disabled = false;

  if (success) {
    const usedTime = maxTime - time;
    const stars = getStars(usedTime);
    const best = Number(localStorage.getItem(getBestKey()) || 0);

    if (best === 0 || usedTime < best) {
      localStorage.setItem(getBestKey(), usedTime);
      bestText.textContent = usedTime;
    }

    starsText.textContent = "⭐ 별 평가: " + stars;

    alert(
      "🎉 성공!\n" +
      "걸린 시간: " + usedTime + "초\n" +
      "별 평가: " + stars + "\n" +
      "최고기록: " + bestText.textContent + "초"
    );
  } else {
    starsText.textContent = "⭐ 별 평가: 실패";
    alert("⏰ 시간 종료!\n다시 도전해봐용!");
  }
}

function resetPreview() {
  clearInterval(timer);
  started = false;
  startBtn.disabled = false;
  setGameInfo();
  makeBoard();
}

modeSelect.addEventListener("change", resetPreview);
levelSelect.addEventListener("change", resetPreview);
timeSelect.addEventListener("change", resetPreview);
startBtn.addEventListener("click", startGame);

setGameInfo();
makeBoard();