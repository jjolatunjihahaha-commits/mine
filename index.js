const states = [
  { emoji:'🌅', name:'Morning' },
  { emoji:'☀️', name:'Noon' },
  { emoji:'🌇', name:'Evening' },
  { emoji:'🌃', name:'Night' },
  { emoji:'🌌', name:'Midnight' }
];
let idx = 0, dayCount = 1;
let date = { day:1, month:1, year:1 };
const intervalMs = 5 * 60 * 1000;

// Build the widget
const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <div id="time-label">${states[idx].emoji} ${states[idx].name} ${states[idx].emoji}</div>
  <div id="date-label">Day ${dayCount}, ${date.month}/${date.day}/${date.year}</div>
  <div id="bar-container">
    <div id="progress-bar"><div id="progress-pointer"></div></div>
  </div>
`;
document.body.appendChild(clock);

// Make it draggable
function makeDraggable(elm) {
  elm.onmousedown = e => {
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY };
    const orig = { left: elm.offsetLeft, top: elm.offsetTop };
    document.onmouseup = () => (document.onmousemove = null);
    document.onmousemove = ev => {
      ev.preventDefault();
      elm.style.left = `${orig.left + ev.clientX - start.x}px`;
      elm.style.top = `${orig.top + ev.clientY - start.y}px`;
    };
  };
}
makeDraggable(clock);

// Increment date when wrapping past Midnight→Morning
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

// Update display and arrow position
function updateClock() {
  document.getElementById('time-label').textContent =
    `${states[idx].emoji} ${states[idx].name} ${states[idx].emoji}`;
  document.getElementById('date-label').textContent =
    `Day ${dayCount}, ${date.month}/${date.day}/${date.year}`;

  const pointer = document.getElementById('progress-pointer');
  const pos = ((idx + 0.5) / states.length) * 100;
  pointer.style.left = `${pos}%`;
}

// Auto-cycle every 5 minutes
setInterval(() => {
  const prev = idx;
  idx = (idx + 1) % states.length;
  if (prev === states.length - 1 && idx === 0) incrementDay();
  updateClock();
}, intervalMs);

// Prompt injection so characters see the time-of-day
globalThis.injectTimeOfDay = async function(chat) {
  chat.unshift({
    is_user: false,
    name: "TimeOfDay",
    send_date: Date.now(),
    mes: `[Time: ${states[idx].name}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  });
};

// Initial draw
updateClock();
