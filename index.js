const states = [
  { emoji:'🌅', name:'Morning' },
  { emoji:'☀️', name:'Noon' },
  { emoji:'🌇', name:'Evening' },
  { emoji:'🌃', name:'Night' },
  { emoji:'🌌', name:'Midnight' }
];
let idx = 0,
    dayCount = 1,
    date = { day:1, month:1, year:1 };
const intervalMs = 5 * 60 * 1000;

// Build widget
const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <div id="time-label">
    ${states[idx].emoji} ${states[idx].name} ${states[idx].emoji}
  </div>
  <p id="day-label">Day ${dayCount}</p>
  <p id="date-label">${date.month}/${date.day}/${date.year}</p>
  <div id="bar-container">
    <button class="nav-arrow" id="prev-btn">&#8249;</button>
    <div id="progress-bar"><div id="progress-pointer"></div></div>
    <button class="nav-arrow" id="next-btn">&#8250;</button>
  </div>
`;
document.body.appendChild(clock);
makeDraggable(clock);

// Make draggable
function makeDraggable(elm) {
  elm.onmousedown = e => {
    e.preventDefault();
    const start = { x:e.clientX, y:e.clientY };
    const orig = { left:elm.offsetLeft, top:elm.offsetTop };
    document.onmouseup = () => document.onmousemove = null;
    document.onmousemove = ev => {
      ev.preventDefault();
      elm.style.left = `${orig.left + ev.clientX - start.x}px`;
      elm.style.top = `${orig.top + ev.clientY - start.y}px`;
    };
  };
}

// Manual navigation
document.getElementById('prev-btn').onclick = () => {
  const prevIdx = idx;
  idx = (idx - 1 + states.length) % states.length;
  if (prevIdx === 0 && idx === states.length - 1) decrementDay();
  updateClock();
};
document.getElementById('next-btn').onclick = () => {
  const prevIdx = idx;
  idx = (idx + 1) % states.length;
  if (prevIdx === states.length - 1 && idx === 0) incrementDay();
  updateClock();
};

function incrementDay() {
  dayCount++;
  date.day++;
  if (date.day > 30) {
    date.day = 1;
    date.month++;
    if (date.month > 12) {
      date.month = 1;
      date.year++;
    }
  }
}
function decrementDay() {
  dayCount = Math.max(1, dayCount - 1);
  date.day = Math.max(1, date.day - 1);
}

// Update display & pointer
function updateClock() {
  document.getElementById('time-label').textContent =
    `${states[idx].emoji} ${states[idx].name} ${states[idx].emoji}`;
  document.getElementById('day-label').textContent = `Day ${dayCount}`;
  document.getElementById('date-label').textContent =
    `${date.month}/${date.day}/${date.year}`;

  const pointer = document.getElementById('progress-pointer');
  const percent = ((idx + 0.5) / states.length) * 100;
  pointer.style.left = `${percent}%`;
}

// Auto-cycle every 5 minutes
setInterval(() => {
  const prevIdx = idx;
  idx = (idx + 1) % states.length;
  if (prevIdx === states.length - 1 && idx === 0) incrementDay();
  updateClock();
}, intervalMs);

// Prompt injection
globalThis.injectTimeOfDay = async function(chat) {
  chat.unshift({
    is_user: false,
    name: "TimeOfDay",
    send_date: Date.now(),
    mes: `[Time: ${states[idx].name}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  });
};

// Initial render
updateClock();
