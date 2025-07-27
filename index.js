let timeStates = ['Morning', 'Noon', 'Evening', 'Night'];
let currentStateIndex = 0;
let dayCount = 1;
let currentDate = new Date(1, 0, 1); // 1 Jan 0001

const clockEl = document.createElement('div');
clockEl.id = 'calendar-clock';

const timeTitle = document.createElement('h2');
const dateLabel = document.createElement('p');
const btnContainer = document.createElement('div');
btnContainer.classList.add('clock-buttons');

let buttons = [];

timeStates.forEach((state, index) => {
  const btn = document.createElement('button');
  btn.textContent = state;
  btn.onclick = () => {
    currentStateIndex = index;
    updateClockDisplay();
  };
  buttons.push(btn);
  btnContainer.appendChild(btn);
});

clockEl.appendChild(timeTitle);
clockEl.appendChild(dateLabel);
clockEl.appendChild(btnContainer);
document.body.appendChild(clockEl);

function updateClockDisplay() {
  const currentTime = timeStates[currentStateIndex];
  timeTitle.textContent = currentTime;
  dateLabel.textContent = `Day ${dayCount}, ${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
  buttons.forEach((btn, idx) => {
    btn.disabled = idx === currentStateIndex;
  });

  // Optional: send system prompt to character
  const prompt = `[SYSTEM TIME: ${currentTime}, Day ${dayCount}, ${currentDate.getDate()}/${currentDate.getMonth() + 1}]`;
  sendSystemPromptToCharacter(prompt);
}

function advanceTime() {
  currentStateIndex++;
  if (currentStateIndex >= timeStates.length) {
    currentStateIndex = 0;
    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }
  updateClockDisplay();
}

function sendSystemPromptToCharacter(prompt) {
  // Replace this with SillyTavern's proper system prompt interface
  console.log(prompt); // For testing
}

updateClockDisplay();
setInterval(advanceTime, 5 * 60 * 1000); // Every 5 minutes
