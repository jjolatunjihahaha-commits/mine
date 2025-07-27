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

const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <div id="time-label">${states[idx].emoji} ${states[idx].name}</div>
  <div id="date-label">Day ${dayCount}, ${date.month}/${date.day}/${date.year}</div>
  <div id="phase-row">
    ${states.map(s=>`<span>${s.emoji}</span>`).join('')}
  </div>
  <div id="bar-container">
    <button class="nav-arrow" id="prev-btn">&#8249;</button>
    <div id="progress-bar"><div id="progress-pointer"></div></div>
    <button class="nav-arrow" id="next-btn">&#8250;</button>
  </div>
`;
document.body.appendChild(clock);
makeDraggable(clock);

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

// Manual nav
document.getElementById('prev-btn').onclick = () => {
  const prev = idx;
  idx = (idx - 1 + states.length) % states.length;
  if(prev === 0 && idx === states.length - 1) decrementDay();
  updateClock();
};
document.getElementById('next-btn').onclick = () => {
  const prev = idx;
  idx = (idx + 1) % states.length;
  if(prev === states.length - 1 && idx === 0) incrementDay();
  updateClock();
};

function incrementDay(){
  dayCount++;
  date.day++;
  if (date.day > 30) {
    date.day = 1;
    date.month++;
    if (date.month > 12) date.month = 1, date.year++;
  }
}
function decrementDay(){
  dayCount = Math.max(1, dayCount-1);
  date.day = Math.max(1, date.day-1);
}

// Core update
function updateClock(){
  document.getElementById('time-label').textContent =
    `${states[idx].emoji} ${states[idx].name}`;
  document.getElementById('date-label').textContent =
    `Day ${dayCount}, ${date.month}/${date.day}/${date.year}`;

  // Arrow under bar
  const pointer = document.getElementById('progress-pointer');
  const pos = ((idx + 0.5) / states.length) * 100;
  pointer.style.left = `${pos}%`;
}

// Auto-cycle
setInterval(()=>{
  const prev = idx;
  idx = (idx + 1) % states.length;
  if(prev === states.length - 1 && idx === 0) incrementDay();
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

updateClock();
