
const elements = [
  { number: 1, symbol: "H", name: "Vodorod" },
  { number: 2, symbol: "He", name: "Geliy" },
  { number: 3, symbol: "Li", name: "Litiy" },
  { number: 4, symbol: "Be", name: "Berilliy" },
  { number: 5, symbol: "B", name: "Bor" },
  { number: 6, symbol: "C", name: "Uglerod" },
  { number: 7, symbol: "N", name: "Azot" },
  { number: 8, symbol: "O", name: "Kislorod" },
  { number: 9, symbol: "F", name: "Ftor" },
  { number: 10, symbol: "Ne", name: "Neon" },
  { number: 11, symbol: "Na", name: "Natriy" },
  { number: 12, symbol: "Mg", name: "Magniy" },
  { number: 13, symbol: "Al", name: "Alyuminiy" },
  { number: 14, symbol: "Si", name: "Kremniy" },
  { number: 15, symbol: "P", name: "Fosfor" },
  { number: 16, symbol: "S", name: "Oltingugurt" },
  { number: 17, symbol: "Cl", name: "Xlor" },
  { number: 18, symbol: "Ar", name: "Argon" },
  { number: 19, symbol: "K", name: "Kaliy" },
  { number: 20, symbol: "Ca", name: "Kalsiy" }
];

const TOTAL_QUESTIONS = 15;
const QUESTION_TIME = 15;

let questions = [];
let currentQuestion = 0;
let score = 0;
let timeLeft = QUESTION_TIME;
let timer = null;
let answered = false;

let record = Number(localStorage.getItem("elementHunterRecord")) || 0;

const $ = id => document.getElementById(id);

// Elementlar jadvalini yaratish
function renderElements() {
  const grid = $("elementGrid");
  grid.innerHTML = "";

  elements.forEach(element => {
    const button = document.createElement("button");

    button.className = "element";
    button.dataset.number = element.number;

    button.innerHTML = `
      <span class="atomic-number">${element.number}</span>
      <span class="symbol">${element.symbol}</span>
      <span class="element-name">${element.name}</span>
    `;

    button.addEventListener("click", () => chooseElement(element));

    grid.appendChild(button);
  });
}

// Savollarni aralashtirish
function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Savollarni tayyorlash
function createQuestions() {
  const shuffled = shuffle(elements).slice(0, TOTAL_QUESTIONS);

  return shuffled.map((element, index) => {
    const type = index % 3;

    if (type === 0) {
      return {
        element,
        question: `${element.name} elementini toping!`,
        hint: `Belgisi: ${element.symbol}`,
        mission: "ELEMENT NOMI BO‘YICHA"
      };
    }

    if (type === 1) {
      return {
        element,
        question: `${element.symbol} belgili elementni toping!`,
        hint: `Element nomi: ${element.name}`,
        mission: "BELGISI BO‘YICHA"
      };
    }

    return {
      element,
      question: `Tartib raqami ${element.number} bo‘lgan elementni toping!`,
      hint: "Davriy jadvaldan to‘g‘ri raqamni qidiring.",
      mission: "TARTIB RAQAMI BO‘YICHA"
    };
  });
}

// Bosqich nomi
function getLevel(index) {
  if (index < 5) {
    return {
      number: 1,
      name: "Yangi kimyogar"
    };
  }

  if (index < 10) {
    return {
      number: 2,
      name: "Tajribali kimyogar"
    };
  }

  return {
    number: 3,
    name: "Kimyo ustasi"
  };
}

// Ball va rekord
function updateStats() {
  if (score > record) {
    record = score;
    localStorage.setItem("elementHunterRecord", record);
  }

  $("score").textContent = score;
  $("record").textContent = record;
}

// Savolni ekranga chiqarish
function loadQuestion() {
  if (currentQuestion >= TOTAL_QUESTIONS) {
    finishGame();
    return;
  }

  clearInterval(timer);
  answered = false;

  const q = questions[currentQuestion];
  const level = getLevel(currentQuestion);

  $("levelTag").textContent = level.number + "-DARAJA";
  $("levelName").textContent = level.name;

  $("missionType").textContent = q.mission;
  $("question").textContent = q.question;
  $("hint").textContent = q.hint;

  $("roundText").textContent =
    `${currentQuestion + 1} / ${TOTAL_QUESTIONS}`;

  $("progress").style.width =
    ((currentQuestion + 1) / TOTAL_QUESTIONS * 100) + "%";

  $("feedback").className = "feedback hidden";
  $("feedback").textContent = "";

  $("nextBtn").classList.add("hidden");

  document.querySelectorAll(".element").forEach(button => {
    button.disabled = false;
    button.classList.remove("correct", "wrong");
  });

  startTimer();
}

// Vaqtni boshlash
function startTimer() {
  clearInterval(timer);

  timeLeft = QUESTION_TIME;
  $("timer").textContent = timeLeft;
  $("timer").style.color = "#ffc857";

  timer = setInterval(() => {
    timeLeft--;

    $("timer").textContent = timeLeft;

    if (timeLeft <= 5) {
      $("timer").style.color = "#ff6868";
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      timeOut();
    }
  }, 1000);
}

// Element tanlash
function chooseElement(element) {
  if (answered) return;

  const correct = questions[currentQuestion].element;
  const selectedButton = document.querySelector(
    `.element[data-number="${element.number}"]`
  );

  if (element.number === correct.number) {
    answered = true;
    clearInterval(timer);

    selectedButton.classList.add("correct");

    const gained = 10 + Math.floor(timeLeft / 3);
    score += gained;

    updateStats();

    showFeedback(
      `🎉 Ajoyib! To‘g‘ri topdingiz!<br>
      Element: <b>${correct.name}</b><br>
      Belgisi: <b>${correct.symbol}</b><br>
      Tartib raqami: <b>${correct.number}</b><br>
      <b>+${gained} ball!</b>`,
      "success"
    );

    endQuestion();
  } else {
    answered = true;
    clearInterval(timer);

    selectedButton.classList.add("wrong");

    showFeedback(
      `❌ Bu noto‘g‘ri javob.<br>
      To‘g‘ri javob: <b>${correct.name} (${correct.symbol})</b><br>
      Tartib raqami: <b>${correct.number}</b>`,
      "error"
    );

    const correctButton = document.querySelector(
      `.element[data-number="${correct.number}"]`
    );

    correctButton.classList.add("correct");

    endQuestion();
  }
}

// Vaqt tugashi
function timeOut() {
  if (answered) return;

  answered = true;

  const correct = questions[currentQuestion].element;

  const correctButton = document.querySelector(
    `.element[data-number="${correct.number}"]`
  );

  correctButton.classList.add("correct");

  showFeedback(
    `⏰ Vaqt tugadi!<br>
    To‘g‘ri javob: <b>${correct.name} (${correct.symbol})</b><br>
    Tartib raqami: <b>${correct.number}</b>`,
    "error"
  );

  endQuestion();
}

// Javob natijasini chiqarish
function showFeedback(message, type) {
  const box = $("feedback");

  box.innerHTML = message;
  box.className = "feedback " + type;
}

// Savolni tugatish
function endQuestion() {
  document.querySelectorAll(".element").forEach(button => {
    button.disabled = true;
  });

  $("nextBtn").classList.remove("hidden");

  if (currentQuestion === TOTAL_QUESTIONS - 1) {
    $("nextBtn").textContent = "NATIJANI KO‘RISH 🏆";
  } else {
    $("nextBtn").textContent = "KEYINGI SAVOL ➜";
  }
}

// Keyingi savol
function nextQuestion() {
  if (!answered) return;

  currentQuestion++;
  loadQuestion();
}

// O‘yin yakuni
function finishGame() {
  clearInterval(timer);

  $("gameArea").classList.add("hidden");
  $("resultScreen").classList.remove("hidden");

  $("finalScore").textContent = score;
  $("finalRecord").textContent = record;

  if (score >= 180) {
    $("resultMessage").textContent =
      "Ajoyib! Siz haqiqiy kimyo ustasisiz!";
  } else if (score >= 100) {
    $("resultMessage").textContent =
      "Yaxshi natija! Kimyo bilimlaringiz rivojlanmoqda!";
  } else {
    $("resultMessage").textContent =
      "Yaxshi urinish! Yana mashq qilib ko‘ring!";
  }
}

// O‘yinni qayta boshlash
function restartGame() {
  clearInterval(timer);

  currentQuestion = 0;
  score = 0;
  questions = createQuestions();

  $("gameArea").classList.remove("hidden");
  $("resultScreen").classList.add("hidden");

  updateStats();
  loadQuestion();
}

// Tugmalar
$("nextBtn").addEventListener("click", nextQuestion);
$("restartBtn").addEventListener("click", restartGame);

// O‘yinni ishga tushirish
renderElements();
questions = createQuestions();
updateStats();
loadQuestion();
