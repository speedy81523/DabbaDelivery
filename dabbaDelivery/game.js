const startButton = document.getElementById("play-btn");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const action_card = document.querySelector(".action-card");
const ingredientEls = document.querySelectorAll(".ingredient");
 
const bentoCard = document.getElementById("bento-card");
const bubbleRow = document.getElementById("bubble-row");
const bentoGrid = document.getElementById("bento-grid");
const boxTimerFill = document.getElementById("box-timer-fill");
 
const boxesHandedDisplay = document.getElementById("boxes-handed");
const perfectBuildsDisplay = document.getElementById("perfect-builds");


startButton.addEventListener("click", startGame);
let timerInterval = null;
let score = 0;
let orders = 0;
let boxesHanded = 0;
let perfectBuilds = 0;
let gameActive = false;


const starting_seconds = 105;
let timeLeft = starting_seconds;

//ingredients
const INGREDIENT = {
  rice: "🍚",
  dal: "🥣",
  sabzi: "🥬",
  papadum: "🥟",
  salt: "🧂",
}

const all_ingredients = Object.keys(INGREDIENT);

//current order
let currentOrder = {};
let mistakeMade = false;
let boxDuration = 10;
let boxTimeLeft = boxDuration;


//format time
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `⏱ ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
 
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function  updateHUD(){
  boxesHandedDisplay.textContent = boxesHanded;
  perfectBuildsDisplay.textContent = perfectBuilds;
}

function updateScoreDisplay(){
  scoreDisplay.textContent = `⭐ ${score}`;
}

//get box duration
function getBoxDuration(){
  const elapsedFraction = 1 - timeLeft /starting_seconds;
  const duration = 10 - elapsedFraction * 4;
  return Math.max(6,Math.round(duration));
}

//drag ingredient
function pickRandomIngredient(count){
  const pool = [...all_ingredients];
  const picked = [];
  while (picked.length < count && pool.length){
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx,1)[0]);
  }
  return picked;
}
//set ingredients to lock
function setIngredientLocked(locked){
  ingredientEls.forEach((el) => el.classList.toggle("locked",locked));
}

ingredientEls.forEach((ingredient) => {
  ingredient.addEventListener("dragstart",(e) =>{
    if (!gameActive){
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain",ingredient.dataset.ingredient);
    e.dataTransfer.effectAllowed = "copy";
    ingredient.classList.add("dragging");
  });

  ingredient.addEventListener("dragend",() =>{
    ingredient.classList.remove("dragging");
  });
});

const compartments = bentoGrid.querySelectorAll(".compartment");
compartments.forEach((compartment) =>{
  compartment.addEventListener("dragover",(e)=>{
    if (!gameActive) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    compartment.classList.add("drag-over");
  });
  compartment.addEventListener("dragleave",()=>{
    compartment.classList.remove("drag-over");
  });
  compartment.addEventListener("drop",(e)=>{
    e.preventDefault();
    compartment.classList.remove("drag-over");
    if(!gameActive)
      return;
    if(compartment.classList.contains("filled"))
      return;

    const dropped = e.dataTransfer.getData("text/plain");
    const slot = Number(compartment.dataset.slot);
    const expected = currentOrder[slot];

    if (dropped === expected){
      compartment.textContent = INGREDIENT[dropped];
      compartment.classList.add("filled");
      checkOrderComplete();
    }
    else{
      mistakeMade = true;
      compartment.classList.add("wrong");
      setTimeout(() => compartment.classList.remove("wrong"),350);
    }
  });
});

//generating order
function generateOrder(){
  currentOrder = pickRandomIngredient(3);
  mistakeMade = false;

  compartments.forEach((compartment,i)=>{
    compartment.dataset.expects = currentOrder[i];
    compartment.textContent = String(i+1);
    compartment.classList.remove("filled","wrong");
  });

  const bubbles = bubbleRow.querySelectorAll(".bubble");
  bubbles.forEach((bubble,i) =>{
    bubble.textContent = INGREDIENT[currentOrder[i]];
  });

  boxDuration = getBoxDuration();
  boxTimeLeft = boxDuration;
  boxTimerFill.style.width = "100%";
  boxTimerFill.style.background = "";

  bentoCard.classList.remove("complete","failed");
  bentoCard.classList.add("pop-in");
  setTimeout(()=>bentoCard.classList.remove("pop-in"),350);

}

//check order is complete
function checkOrderComplete(){
  const allFilled = [...compartments].every((c)=>c.classList.contains("filled"));
  if (!allFilled)
    return;

  score += 1;
  boxesHanded += 1;
  if (!mistakeMade){
    perfectBuilds += 1;
  }
  updateScoreDisplay();
  updateHUD();

  bentoCard.classList.add("complete");
  setTimeout(()=>{
    if(gameActive)
      generateOrder();
  },450);
}

//fail order
function failOrder(){
  bentoCard.classList.add("failed");
  setTimeout(()=>{
    if(gameActive)
      generateOrder();
  },350);
}

//start game function
function startGame(){
  // Game start logic here
  clearInterval(timerInterval);

  timeLeft = starting_seconds;
  score = 0;
  orders = 0;
  boxesHanded = 0;
  perfectBuilds = 0;
  gameActive = true;


  updateTimerDisplay();
  updateScoreDisplay();
  updateHUD();
  setIngredientLocked(false);

  startButton.hidden = true;
  startButton.disabled = true;
  action_card.style.display = "none";

  generateOrder();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
 
    boxTimeLeft--;
    const pct = Math.max(0,(boxTimeLeft/boxDuration)*100);
    boxTimerFill.style.width = `${pct}%`;
    if (pct<30){
      boxTimerFill.style.background = "#e05252";
    }
    if (boxTimeLeft <= 0){
      failOrder();
    }
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

//end game function
function endGame(){
    clearInterval(timerInterval);
    timerInterval = null;
    gameActive = false;

    timerDisplay.textContent = "⏱ 00:00";
    startButton.hidden = false;
    startButton.disabled = false;
    startButton.textContent = "▶ Play Again";
    action_card.style.display = "flex";

    setIngredientLocked(true);
    bentoCard.classList.remove("complete","failed","pop-in");
}