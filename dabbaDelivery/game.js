const startButton = document.getElementById("play-btn");
const timerDisplay = document.getElementById("timer");
const action_card = document.querySelector(".action-card");
const ingredient = document.querySelector(".ingredient");


startButton.addEventListener("click", startGame);
let timerInterval = null;
let score = 0;
let orders = 0;

const starting_seconds = 105;
let timeLeft = starting_seconds;

//format time
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `⏱ ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
 
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function dragIngredients(){
 
}
//start game function
function startGame(){
  // Game start logic here
  clearInterval(timerInterval);

  timeLeft = starting_seconds;
  score = 0;
  orders = 0;
  updateTimerDisplay();

  startButton.hidden = true;
  startButton.disabled = true;
  action_card.style.display = "none";
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
 
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

//end game function
function endGame(){
    clearInterval(timerInterval);
    timerInterval = null;
    timerDisplay.textContent = "⏱ 00:00";
    startButton.hidden = false;
    startButton.disabled = false;
   action_card.style.display = "flex";
}