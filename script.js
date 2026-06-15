const SOUND_URL =
"https://tmpfiles.org/dl/wwwgU01Ubd7l/universfield-slime-impact-3524731-audiotrimmer.com2.mp3";

const letters = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const targetEl = document.getElementById("target");
const messageEl = document.getElementById("message");
const timerBar = document.getElementById("timerBar");
const keys = document.querySelectorAll(".key");

let score = 0;
let combo = 0;
let target = "";
let secondTarget = "";
let forbiddenKey = "";
let timeLeft = 100;
let gameInterval;
let eventMode = "normal";

function playSound() {
  const sound = new Audio(SOUND_URL);
  sound.volume = 0.85;
  sound.play();
}

function pressVisual(keyName) {
  const key = document.querySelector(`[data-key="${keyName}"]`);
  if (!key) return;

  key.classList.add("pressed");

  setTimeout(() => key.classList.remove("pressed"), 110);
}

function clearGlows() {
  document.querySelectorAll(".target-key").forEach(k => k.classList.remove("target-key"));
  document.querySelectorAll(".danger-key").forEach(k => k.classList.remove("danger-key"));
}

function randomLetter(except = []) {
  let pick;
  do {
    pick = letters[Math.floor(Math.random() * letters.length)];
  } while (except.includes(pick));
  return pick;
}

function setGlow(keyName, className) {
  const key = document.querySelector(`[data-key="${keyName}"]`);
  if (key) key.classList.add(className);
}

function chooseEvent() {
  const roll = Math.random();

  if (roll < 0.55) return "normal";
  if (roll < 0.72) return "double";
  if (roll < 0.87) return "forbidden";
  if (roll < 0.96) return "turbo";
  return "mirror";
}

function newTarget() {
  clearGlows();

  eventMode = chooseEvent();
  forbiddenKey = "";
  secondTarget = "";

  target = randomLetter();

  if (eventMode === "double") {
    secondTarget = randomLetter([target]);
    targetEl.textContent = target + " / " + secondTarget;
    messageEl.textContent = "hit either target!";
    setGlow(target, "target-key");
    setGlow(secondTarget, "target-key");
  } else if (eventMode === "forbidden") {
    forbiddenKey = randomLetter([target]);
    targetEl.textContent = target;
    messageEl.textContent = "hit " + target + " but NOT " + forbiddenKey;
    setGlow(target, "target-key");
    setGlow(forbiddenKey, "danger-key");
  } else if (eventMode === "turbo") {
    targetEl.textContent = target;
    messageEl.textContent = "TURBO! hit " + target;
    setGlow(target, "target-key");
  } else if (eventMode === "mirror") {
    targetEl.textContent = target;
    messageEl.textContent = "MIRROR MODE! wrong keys score";
    setGlow(target, "danger-key");
  } else {
    targetEl.textContent = target;
    messageEl.textContent = "hit " + target;
    setGlow(target, "target-key");
  }

  timeLeft = Math.max(28, 100 - combo * 3);

  if (eventMode === "turbo") {
    timeLeft = Math.max(20, timeLeft - 25);
  }
}

function hitCorrect() {
  let points = 10 + combo;

  if (eventMode === "turbo") points *= 2;
  if (eventMode === "double") points += 5;

  score += points;
  combo += 1;

  scoreEl.textContent = score;
  comboEl.textContent = combo;

  messageEl.textContent = "sticky combo +" + combo;
  newTarget();
}

function hitWrong() {
  combo = 0;
  comboEl.textContent = combo;
  messageEl.textContent = "miss!";
  newTarget();
}

function triggerKey(keyName) {
  playSound();
  pressVisual(keyName);

  if (eventMode === "mirror") {
    if (keyName !== target) hitCorrect();
    else hitWrong();
    return;
  }

  if (eventMode === "forbidden" && keyName === forbiddenKey) {
    messageEl.textContent = "you hit the forbidden key!";
    hitWrong();
    return;
  }

  if (keyName === target || keyName === secondTarget) {
    hitCorrect();
  } else {
    hitWrong();
  }
}

function startTimer() {
  clearInterval(gameInterval);

  gameInterval = setInterval(() => {
    timeLeft -= 1;
    timerBar.style.width = timeLeft + "%";

    if (timeLeft <= 0) {
      combo = 0;
      comboEl.textContent = combo;
      messageEl.textContent = "too slow!";
      newTarget();
    }
  }, 50);
}

keys.forEach(key => {
  key.addEventListener("click", () => triggerKey(key.dataset.key));
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) triggerKey(key);
});

newTarget();
startTimer();
