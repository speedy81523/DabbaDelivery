const startButton = document.getElementById("play-btn");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const action_card = document.querySelector(".action-card");
const ingredientEls = document.querySelectorAll(".ingredient");

const bentoCard = document.getElementById("bento-card");
const bubbleRow = document.getElementById("bubble-row");
const bentoGrid = document.getElementById("bento-grid");
const boxTimerFill = document.getElementById("box-timer-fill");

const converyorTrack = document.getElementById("conveyor-track");
const deliveryZone = document.getElementById("delivery-zone");
const boxesHandedDisplay = document.getElementById("boxes-handed");
const perfectBuildsDisplay = document.getElementById("perfect-builds");

const gameOverOverlay = document.getElementById("game-over-overlay");
const finalScoreDisplay = document.getElementById("final-score");
const finalBoxesDisplay = document.getElementById("final-boxes");
const finalPerfectDisplay = document.getElementById("final-perfect");
const playAgainButton = document.getElementById("play-again-btn");


startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click",startGame);
let timerInterval = null;
let score = 0;
let orders = 0;
let boxesHanded = 0;
let perfectBuilds = 0;
let gameActive = false;
let rushHourAnnounced = false;


const starting_seconds = 105;
let timeLeft = starting_seconds;

//ingredients
const INGREDIENT = {
  rice: "🍚",
  chicken: "🍗",
  sabzi: "🥬",
  papadum: "🥟",
  salt: "🧂",
}


const all_ingredients = Object.keys(INGREDIENT);

//lanes
const lane_count = 2;
const lane_gap = 10; //gap px between stacked rows
const stack_box_height = 220; //estimated box height for vertical stacking
let laneOccupants = new Array(lane_count).fill(null);

//boxes and belt
//const max_boxes = 1;
const spawn_time = 4;
const box_width = 320;
//const box_drag_type = "application/x-box-id"; // custom drag type for box drag
let activeBoxes = []; //box info like id,el

let boxIdCounter = 0;
let spawnCooldown = 0;

//current order
///let currentOrder = {};
//let mistakeMade = false;
//let boxDuration = 10;
//let boxTimeLeft = boxDuration;


//format time
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `⏱ ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function updateHUD() {
  boxesHandedDisplay.textContent = boxesHanded;
  perfectBuildsDisplay.textContent = perfectBuilds;
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `⭐ ${score}`;
}

//get box duration (movement speed ramps up)
function getBoxDuration() {
  const elapsedFraction = 1 - timeLeft / starting_seconds;
  const duration = 11 - elapsedFraction * 4;
  return Math.max(6, Math.round(duration));
}

//get num of boxes allowed on belt, used with getboxduration
function getMaxBoxes(){
  const elapsedFraction = 1 - timeLeft / starting_seconds;
  if(elapsedFraction >= 0.5)
    return 2;
  return 1;
}

//rush hour banner
function maybeAnnounceRushHour(){
  if(rushHourAnnounced)
    return;
  if(getMaxBoxes()<2)
  return;

  rushHourAnnounced = true;
  const banner = document.getElementById("rush-hour-banner");
  banner.classList.remove("show");
  void banner.offsetWidth;
  banner.classList.add("show");
}

function findFreeLane(){
  return laneOccupants.findIndex((occupant)=>occupant===null); //find empty lane
}
//on top of each other
function getBoxTopOffset(lane) {
  return 18 + lane * (stack_box_height + lane_gap);
}
//drag ingredient
function pickRandomIngredient(count) {
  const pool = [...all_ingredients];
  const picked = [];
  while (picked.length < count && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}
//set ingredients to lock
function setIngredientLocked(locked) {
  ingredientEls.forEach((el) => el.classList.toggle("locked", locked));
}

//new system for drag and drop also work for phone touch
//drag ingredients
//ingredientEls.forEach((ingredient) => {
 // ingredient.addEventListener("dragstart", (e) => {
   // if (!gameActive) {
    //  e.preventDefault();
     // return;
   // }
   // e.dataTransfer.setData("text/plain", ingredient.dataset.ingredient);
   // e.dataTransfer.effectAllowed = "copy";
   // ingredient.classList.add("dragging");
  //});

 // ingredient.addEventListener("dragend", () => {
  //  ingredient.classList.remove("dragging");
  //});
//});

//const compartments = bentoGrid.querySelectorAll(".compartment");
//compartments.forEach((compartment) => {
  //compartment.addEventListener("dragover", (e) => {
   // if (!gameActive) return;
    //e.preventDefault();
    //e.dataTransfer.dropEffect = "copy";
    //compartment.classList.add("drag-over");
  //});
  //compartment.addEventListener("dragleave", () => {
  //  compartment.classList.remove("drag-over");
 // });
  //compartment.addEventListener("drop", (e) => {
    //e.preventDefault();
   // compartment.classList.remove("drag-over");
  //  if (!gameActive)
    //  return;
    //if (compartment.classList.contains("filled"))
    //  return;

   // const dropped = e.dataTransfer.getData("text/plain");
    //const slot = Number(compartment.dataset.slot);
    //const expected = currentOrder[slot];

    //if (dropped === expected) {
    //  compartment.textContent = INGREDIENT[dropped];
    //  compartment.classList.add("filled");
   //   checkOrderComplete();
   // }
   // else {
    //  mistakeMade = true;
    // compartment.classList.add("wrong");
    //  setTimeout(() => compartment.classList.remove("wrong"), 350);
   // }
 // });
//});

//generating order
//function generateOrder() {
  //currentOrder = pickRandomIngredient(3);
 // mistakeMade = false;

 // compartments.forEach((compartment, i) => {
   // compartment.dataset.expects = currentOrder[i];
    //compartment.textContent = String(i + 1);
    //compartment.classList.remove("filled", "wrong");
 // });

 // const bubbles = bubbleRow.querySelectorAll(".bubble");
  //bubbles.forEach((bubble, i) => {
   // bubble.textContent = INGREDIENT[currentOrder[i]];
 // });

 // boxDuration = getBoxDuration();
 // boxTimeLeft = boxDuration;
 // boxTimerFill.style.width = "100%";
 // boxTimerFill.style.background = "";

  //bentoCard.classList.remove("complete", "failed");
 // bentoCard.classList.add("pop-in");
  //setTimeout(() => bentoCard.classList.remove("pop-in"), 350);

//}

//check order is complete
//function checkOrderComplete() {
  //const allFilled = [...compartments].every((c) => c.classList.contains("filled"));
  //if (!allFilled)
   // return;

 // score += 1;
 // boxesHanded += 1;
 // if (!mistakeMade) {
  //  perfectBuilds += 1;
 // }
 // updateScoreDisplay();
 // updateHUD();

  //bentoCard.classList.add("complete");
  //setTimeout(() => {
  // if (gameActive)
   //   generateOrder();
  ///}, 450);
//}

//fail order
//function failOrder() {
 // bentoCard.classList.add("failed");
  //setTimeout(() => {
   // if (gameActive)
    //  generateOrder();
  //}, 350);
//}

let activeDrag = null;
//floating element
function createGhost(sourceEl,x,y){
  const rect = sourceEl.getBoundingClientRect();
  const ghost = sourceEl.cloneNode(true);
  ghost.classList.add("drag-ghost");
  ghost.style.width = `${rect.width}px`;
  ghost.style.left = `${x - rect.width / 2}px`;
  ghost.style.top = `${y - rect.height / 2}px`;
  document.body.appendChild(ghost);
  return ghost;
}

function moveGhost(ghost, x, y) {
  const rect = ghost.getBoundingClientRect();
  ghost.style.left = `${x - rect.width / 2}px`;
  ghost.style.top = `${y - rect.height / 2}px`;
}

function clearHighlight(){
  if(activeDrag && activeDrag.highlightEl){
    activeDrag.highlightEl.classList.remove("drag-over");
    activeDrag.highlightEl = null;
  }
}

function endDrag(){
  if(!activeDrag) 
    return;
  activeDrag.ghost.remove();
  clearHighlight();
  activeDrag = null;
}

//dropping into box, box should be created and destroyed dynamically
//figure which compartment is targeted
//converyorTrack.addEventListener("dragover",(e)=>{
 // const compartment = e.target.closest(".compartment");
 // if(!compartment||!gameActive)
   // return;
  //e.preventDefault();
  //e.dataTransfer.dropEffect = "copy";
  //compartment.classList.add("drag-over");
//});
//converyorTrack.addEventListener("dragleave",(e)=>{
  //const compartment = e.target.closest(".compartment");
 // if(compartment)
   // compartment.classList.remove("drag-over");
//});
//converyorTrack.addEventListener("drop",(e)=>{
  //const compartment = e.target.closest(".compartment");
  //if (!compartment||!gameActive)
   // return;
 // e.preventDefault();

  //compartment.classList.remove("drag-over");
  //i//f(compartment.classList.contains("filled"))
   // return;

 // const boxEl = compartment.closest(".bento-box");
 // const box = activeBoxes.find((b)=>b.el === boxEl);
  //if (!box)
  //  return;

 // const dropped = e.dataTransfer.getData("text/plain");
  //const slot = Number(compartment.dataset.slot);
  //const expected = box.order[slot];
  
  //if (dropped === expected){
  //  compartment.textContent = INGREDIENT[dropped];
 // //  compartment.classList.add("filled");
  //  checkBoxComplete(box);    
 // }
 // else{
  //  box.mistakeMade = true;
   // compartment.classList.add("wrong");
  //  setTimeout(()=>compartment.classList.remove("wrong"),350);
 // }
//});

ingredientEls.forEach((ingredient) =>{
  ingredient.addEventListener("pointerdown",(e)=>{
    if(!gameActive || ingredient.classList.contains("locked"))
      return;
    e.preventDefault();
    ingredient.setPointerCapture(e.pointerId);
    ingredient.classList.add("dragging");

    activeDrag = {
      type: "ingredient",
      pointerId: e.pointerId,
      sourceEl: ingredient,
      ingredientName: ingredient.dataset.ingredient,
      ghost: createGhost(ingredient, e.clientX, e.clientY),
      highlightEl: null,
    };
  });
  ingredient.addEventListener("pointermove",(e)=>{
    if(!activeDrag||activeDrag.pointerId !== e.pointerId|| activeDrag.type !== "ingredient")
      return;
    moveGhost(activeDrag.ghost,e.clientX,e.clientY);

    const target = document.elementFromPoint(e.clientX,e.clientY);
    const compartment = target && target.closest(".compartment");
    if(activeDrag.highlightEl && activeDrag.highlightEl !== compartment){
      clearHighlight();
    }
    if (compartment && !compartment.classList.contains("filled")){
      compartment.classList.add("drag-over");
      activeDrag.highlightEl = compartment;
    }
  });
  ingredient.addEventListener("pointerup",(e)=>{
    if(!activeDrag||activeDrag.pointerId !== e.pointerId || activeDrag.type !== "ingredient")
      return;
    ingredient.classList.remove("dragging");
    const target = document.elementFromPoint(e.clientX,e.clientY);
    const compartment = target && target.closest(".compartment");

    if(compartment && !compartment.classList.contains("filled")){
      const boxEl = compartment.closest(".bento-box");
      const box = activeBoxes.find((b)=>b.el===boxEl);
      if (box){
        const slot = Number(compartment.dataset.slot);
        const expected = box.order[slot];

        if (activeDrag.ingredientName === expected){
          compartment.textContent = INGREDIENT[activeDrag.ingredientName];
          compartment.classList.add("filled");
          checkBoxComplete(box);
        }
        else{
          box.mistakeMade = true;
          compartment.classList.add("wrong");
          setTimeout(()=>compartment.classList.remove("wrong"),350);
        }
      }
    }
    endDrag();
  });
  ingredient.addEventListener("pointercancel",()=>{
    ingredient.classList.remove("dragging");
    endDrag();
  });

});

//dragging finised box onto van
function attachBoxDragHandlers(box){
  const el = box.el;
  
  el.addEventListener("pointerdown",(e)=>{
    if (!box.ready || box.delivered)
      return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");

    activeDrag = {
      type: "box",
      pointerId: e.pointerId,
      box,
      ghost: createGhost(el, e.clientX, e.clientY),
      highlightEl: null,
    };
  });
  el.addEventListener("pointermove",(e)=>{
    if (!activeDrag || activeDrag.pointerId !== e.pointerId || activeDrag.type !== "box" || activeDrag.box !== box) return;
    moveGhost(activeDrag.ghost, e.clientX, e.clientY);
 
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const overZone = target && target.closest("#delivery-zone");
 
    if (overZone) {
      deliveryZone.classList.add("drag-over");
      activeDrag.highlightEl = deliveryZone;
    }
     else {
      clearHighlight();
    }
  });
  el.addEventListener("pointerup",(e)=>{
    if(!activeDrag || activeDrag.pointerId !== e.pointerId || activeDrag.type !== "box" || activeDrag.box !== box)
      return;
    el.classList.remove("dragging");

    const target = document.elementFromPoint(e.clientX,e.clientY);
    const overZone = target && target.closest("#delivery-zone");
    if(overZone){
      deliverBox(box);
    }
    endDrag();
  });
  el.addEventListener("pointercancel",()=>{
    el.classList.remove("dragging");
    endDrag();
  });
}
//function getBoxDragId(dataTransfer) {
 // if (!dataTransfer) return null;
 // return dataTransfer.getData(box_drag_type) || dataTransfer.getData("text/plain") || null;
//}

//drag box to delivery
//deliveryZone.addEventListener("dragover",(e)=>{
 // if (!gameActive) 
  //  return;
  //e.preventDefault();
  //e.dataTransfer.dropEffect = "move";
  ////deliveryZone.classList.add("drag-over");
//});

//deliveryZone.addEventListener("dragleave",()=>{
 // deliveryZone.classList.remove("drag-over");
//});

//deliveryZone.addEventListener("drop",(e)=>{
  //deliveryZone.classList.remove("drag-over");
  //const idStr = getBoxDragId(e.dataTransfer);
  //if (!idStr || !gameActive)
  //  return;
  //e.preventDefault();

  //const box = activeBoxes.find((b)=>b.id === Number(idStr));
  //if (!box||!box.ready) return;
//
  //deliverBox(box);
//})
//spawn box
function spawnBox(){
  const lane = findFreeLane();
  if (lane === -1)
    return;
  const order = pickRandomIngredient(3);
  const duration = getBoxDuration();
  const id = ++boxIdCounter;

  const el = document.createElement("div");
  el.className = "bento-box pop-in";
  el.style.left = `-${box_width+ 20}px`;
  el.innerHTML = `
    <div class="bubble-row">
      <div class="bubble">${INGREDIENT[order[0]]}</div>
      <div class="bubble">${INGREDIENT[order[1]]}</div>
      <div class="bubble">${INGREDIENT[order[2]]}</div>
    </div>
    <div class="box-timer"><div class="box-timer-fill"></div></div>
    <div class="bento-grid">
      <div class="compartment" data-slot="0">${INGREDIENT[order[0]]}</div>
      <div class="compartment" data-slot="1">${INGREDIENT[order[1]]}</div>
      <div class="compartment" data-slot="2">${INGREDIENT[order[2]]}</div>
    </div>
    <div class="lock-hint">Drag the right ingredient into each slot</div>
  `;
  converyorTrack.appendChild(el);
  setTimeout(()=>el.classList.remove("pop-in"),350);
  
  el.style.top = `${getBoxTopOffset(lane)}px`;
  //box details
  const box = {
    id,
    el,
    lane,
    compartments: el.querySelectorAll(".compartment"),
    timerFill: el.querySelector(".box-timer-fill"),
    lockHint: el.querySelector(".lock-hint"),
    order,
    mistakeMade: false,
    elapsed: 0,
    duration,
    ready: false, //true when all compartments are filled
    delivered: false, //true when dropped at bike
  };

  laneOccupants[lane] = box; //reserve lane

 
  attachBoxDragHandlers(box);
  activeBoxes.push(box);
}

//remove box from DOM after exit animation
function removeBox(box){
  activeBoxes = activeBoxes.filter((b)=>b.id !== box.id);
  laneOccupants[box.lane] = null; //free lane
  box.el.addEventListener("animationend",()=> box.el.remove(),{once: true});
  setTimeout(()=>box.el.remove(),600);//in case animation end dosen't play
}

//check if order is complete for box
function checkBoxComplete(box){
  const allFilled = [...box.compartments].every((c)=>c.classList.contains("filled")); //check if every compartment is filled
  if(!allFilled)
    return;
  box.ready = true;
  box.el.classList.add("ready");
  box.timerFill.style.width = "100%";
  box.timerFill.style.background = "var(--accent-3)";
  box.lockHint.textContent = "Drag this box down to the van!";
}

//box delivered
function deliverBox(box){
  box.delivered = true;
  score += 1;
  boxesHanded += 1;
  if(!box.mistakeMade){
    perfectBuilds += 1;
  }
  updateScoreDisplay();
  updateHUD();
  box.el.classList.remove("ready");
  box.el.classList.add("delivered");
  removeBox(box);
}

//box ran out of time before completed
function missBox(box){
  box.el.classList.add("failed");
  removeBox(box);
}

//belt ticks (spawn and moving boxes)
function tickBelt(){

  maybeAnnounceRushHour();
  const trackWidth = converyorTrack.clientWidth;
  const travelDistance = trackWidth + box_width + 40;
  const firstBox = activeBoxes[0];
  const boxWidth = firstBox ? firstBox.el.offsetWidth : box_width;


  activeBoxes.forEach((box)=>{
   if(box.ready)
    return;
   box.elapsed += 1;
   const pct = Math.min(1,box.elapsed/box.duration);
   box.el.style.left = `${-(boxWidth + 20) + pct * travelDistance}px`
   const remainingPct = Math.max(0, (1 - pct) * 100);
   box.timerFill.style.width = `${remainingPct}%`;
   box.timerFill.style.background = remainingPct < 30 ? "#e05252" : "";
 
   if (pct >= 1) {
     missBox(box);
   }
  });
  spawnCooldown -= 1;
  if (spawnCooldown <= 0 && activeBoxes.length < getMaxBoxes()){
    spawnBox();
    spawnCooldown = spawn_time;
  }
}
//start game function
function startGame() {
  // Game start logic here
  clearInterval(timerInterval);

  timeLeft = starting_seconds;
  score = 0;
  orders = 0;
  boxesHanded = 0;
  perfectBuilds = 0;
  gameActive = true;
  rushHourAnnounced = false;
  document.getElementById("rush-hour-banner").classList.remove("show");
  gameOverOverlay.classList.remove("show");

  endDrag();
  activeBoxes.forEach((box) => box.el.remove());
  activeBoxes = [];
  laneOccupants = new Array(lane_count).fill(null);
  spawnCooldown = 0; //spawn one box right away

  updateTimerDisplay();
  updateScoreDisplay();
  updateHUD();
  setIngredientLocked(false);

  startButton.hidden = true;
  startButton.disabled = true;
  action_card.style.display = "none";

  timerInterval = setInterval(()=>{
    timeLeft--;
    updateTimerDisplay();
    tickBelt();

    if(timeLeft<=0){
      endGame();
    }
  },800);
   
}

//end game function
function endGame() {
  clearInterval(timerInterval);
  timerInterval = null;
  gameActive = false;

  endDrag();
  timerDisplay.textContent = "⏱ 00:00";
  //startButton.hidden = false;
  //startButton.disabled = false;
  //startButton.textContent = "▶ Play Again";
  //action_card.style.display = "flex";

  setIngredientLocked(true);
  activeBoxes.forEach((box)=>box.el.remove());
  activeBoxes = [];
  laneOccupants = new Array(lane_count).fill(null);

  finalScoreDisplay.textContent = `⭐ ${score}`;
  finalBoxesDisplay.textContent = boxesHanded;
  finalPerfectDisplay.textContent = perfectBuilds;
  gameOverOverlay.classList.add("show");
}