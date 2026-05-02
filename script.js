let currentBalance = 35;
let gameMinutes = 360; 
let currentZoom = 1;
let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;

const challenges = [
  "Scavenge the yard for 10 minutes.",
  "Check the perimeter for intruders.",
  "Ride both cirles in one go.",
  "Collect 5 sticks for building.",
  "Create sink and drying rack.",
  "Create Oven and cooking station.",
  "Hide from the neighbor's dog!",
  "Water the tulips in the garden."
];

// 1. GAME FLOW
function startGame() {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('main-game-interface').classList.remove('hidden');
  document.getElementById('main-challenge-text').innerText = "Day 1: Scavenge the yard for 10 minutes.";
}

function updateBalance(type) {
  const amountInput = document.getElementById('amount');
  const amount = parseInt(amountInput.value);
  
  if (isNaN(amount)) {
    alert("Please enter a number first!");
    return;
  }

  if (type === 'spend') {
    currentBalance -= amount;
    alert("Spent: $" + amount);
  } 
  else if (type === 'request') {
    // This creates a 50/50 coin flip
    if (Math.random() > 0.5) {
      currentBalance += amount;
      alert("SUCCESS! You received $" + amount);
    } else {
      alert("DENIED! No money this time.");
    }
  }

  // This updates the big gold number on your screen
  document.getElementById('balance').innerText = `$${currentBalance.toLocaleString()}`;
  amountInput.value = ''; // Clears the box
}
// 2. CLOCK LOGIC
setInterval(() => {
  gameMinutes++;
  
  // Every 10 minutes, change the challenge!
  if (gameMinutes % 10 === 0) {
    changeChallenge();
  }

  let hours = Math.floor(gameMinutes / 60);
  let mins = gameMinutes % 60;
  let timeStr = (hours < 10 ? "0"+hours : hours) + ":" + (mins < 10 ? "0"+mins : mins);
  document.getElementById('clock-display').innerText = `Day 1 | ${timeStr}`;
}, 1000);

// 3. MAP LOGIC
function showMenu(id) {
  document.getElementById(id + '-menu').classList.remove('hidden');
}

function closeMenus() {
  document.querySelectorAll('.overlay').forEach(m => m.classList.add('hidden'));
}

function adjustZoom(amount) {
  currentZoom += amount;
  if (currentZoom < 0.5) currentZoom = 0.5;
  if (currentZoom > 4) currentZoom = 4;
  applyMapTransform();
}

function resetZoom() {
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  applyMapTransform();
}

function applyMapTransform() {
  const mapImg = document.getElementById('tactical-map-img');
  mapImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}

// 4. DRAGGING LOGIC
const viewport = document.getElementById('map-viewport');

viewport.addEventListener('mousedown', (e) => {
  isDragging = true;
  viewport.style.cursor = 'grabbing';
  startX = e.pageX - translateX;
  startY = e.pageY - translateY;
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  viewport.style.cursor = 'grab';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  translateX = e.pageX - startX;
  translateY = e.pageY - startY;
  applyMapTransform();
});

function buyItem(cost, name) {
  if (currentBalance >= cost) {
    currentBalance -= cost;
    // Update the money display
    document.getElementById('balance').innerText = `$${currentBalance.toLocaleString()}`;
    // Change the challenge text to show you bought it
    document.getElementById('main-challenge-text').innerText = `You bought: ${name}!`;
    alert("Purchase Successful!");
  } else {
    alert("Not enough money!");
  }
}

function changeChallenge() {
  const randomIndex = Math.floor(Math.random() * challenges.length);
  const newChallenge = challenges[randomIndex];
  document.getElementById('main-challenge-text').innerText = `New Goal: ${newChallenge}`;
}
let currentSaveSlot = null;

function openSaveMenu() {
  showMenu('save');
  renderSaveSlots();
}

function renderSaveSlots() {
  const saveList = document.getElementById('save-list');
  saveList.innerHTML = '';
  
  // We will check for 3 possible save slots
  for (let i = 1; i <= 3; i++) {
    const data = localStorage.getItem('neighborhood_save_' + i);
    const slotDiv = document.createElement('div');
    slotDiv.style.border = "1px solid #444";
    slotDiv.style.margin = "5px";
    slotDiv.style.padding = "5px";

    if (data) {
      const savedGame = JSON.parse(data);
      slotDiv.innerHTML = `
        <p>Slot ${i}: $${savedGame.balance}</p>
        <button onclick="loadGame(${i})">LOAD</button>
        <button onclick="deleteGame(${i})" style="background:red; color:white;">DEL</button>
      `;
    } else {
      slotDiv.innerHTML = `<p>Slot ${i}: [EMPTY]</p>`;
    }
    saveList.appendChild(slotDiv);
  }
}

function saveCurrentGame() {
  if (!currentSaveSlot) currentSaveSlot = 1; // Default to slot 1 if new
  const gameData = {
    balance: currentBalance,
    minutes: gameMinutes,
    challenge: document.getElementById('main-challenge-text').innerText
  };
  localStorage.setItem('neighborhood_save_' + currentSaveSlot, JSON.stringify(gameData));
}

function loadGame(slot) {
  const data = localStorage.getItem('neighborhood_save_' + slot);
  if (data) {
    const savedGame = JSON.parse(data);
    currentBalance = savedGame.balance;
    gameMinutes = savedGame.minutes;
    currentSaveSlot = slot;
    
    document.getElementById('balance').innerText = `$${currentBalance.toLocaleString()}`;
    document.getElementById('main-challenge-text').innerText = savedGame.challenge;
    
    closeMenus();
    startGame(); // Skip the intro screen
  }
}

function createNewGame() {
  // Find first empty slot
  for (let i = 1; i <= 3; i++) {
    if (!localStorage.getItem('neighborhood_save_' + i)) {
      currentSaveSlot = i;
      currentBalance = 35; // Start fresh
      gameMinutes = 360;
      saveCurrentGame();
      loadGame(i);
      return;
    }
  }
  alert("All slots full! Delete a game first.");
}

function deleteGame(slot) {
  if (confirm("Delete this save forever?")) {
    localStorage.removeItem('neighborhood_save_' + slot);
    renderSaveSlots();
  }
}

// AUTO-SAVE: Save every 30 seconds
setInterval(saveCurrentGame, 30000);
