/* ──────────────────────────────────────────
   Time‑Cycle Gradient Clock – v2.5.0
   Collapse animation & summary line
────────────────────────────────────────── */

const states = [
  { emoji: '🌅', name: 'Morning' },
  { emoji: '☀️', name: 'Noon' },
  { emoji: '🌇', name: 'Evening' },
  { emoji: '🌃', name: 'Night' }
];

let idx        = 0;
let dayCount   = 1;
let date       = { day: 1, month: 1, year: 1 };
let collapsed  = false;
const intervalMs = 5 * 60 * 1000;

/* persistence */
function loadState() {
  const saved = JSON.parse(localStorage.getItem('clockState'));
  if (saved) {
    idx       = saved.idx        ?? idx;
    dayCount  = saved.dayCount   ?? dayCount;
    date      = saved.date       ?? date;
    collapsed = saved.collapsed  ?? collapsed;
  }
}
function saveState() {
  localStorage.setItem(
    'clockState',
    JSON.stringify({ idx, dayCount, date, collapsed })
  );
}

/* date helper */
const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();

/* widget skeleton */
const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <button id="toggle-btn" title="Collapse / Expand">▾</button>
  <button id="edit-date-btn" title="Edit date">🖊️</button>

  <div id="time-label"></div>
  <p id="day-label"></p>
  <p id="date-label"></p>

  <p id="summary-label"></p>

  <div id="bar-container">
    <button class="nav-arrow" id="prev-btn" title="Previous time">&#8249;</button>
    <div id="progress-bar"><div id="progress-pointer"></div></div>
    <button class="nav-arrow" id="next-btn" title="Next time">&#8250;</button>
  </div>
`;
document.body.appendChild(clock);

/* apply collapsed UI instantly */
function applyCollapsedUI() {
  clock.classList.toggle('collapsed', collapsed);
  document.getElementById('toggle-btn').textContent = collapsed ? '▸' : '▾';
}

/* draggable (ignore corner buttons) */
clock.onmousedown = e => {
  if (['edit-date-btn', 'toggle-btn'].includes(e.target.id)) return;
  e.preventDefault();
  const start = { x: e.clientX, y: e.clientY };
  const orig  = { left: clock.offsetLeft, top: clock.offsetTop };
  document.onmouseup   = () => (document.onmousemove = null);
  document.onmousemove = ev => {
    ev.preventDefault();
    clock.style.left = `${orig.left + ev.clientX - start.x}px`;
    clock.style.top  = `${orig.top  + ev.clientY - start.y}px`;
  };
};

/* navigation buttons */
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

/* collapse/expand */
document.getElementById('toggle-btn').onclick = () => {
  collapsed = !collapsed;
  applyCollapsedUI();
  saveState();
};

/* edit date */
document.getElementById('edit-date-btn').onclick = () => {
  const input = prompt(
    'Enter new date (MM/DD/YYYY):',
    `${date.month}/${date.day}/${date.year}`
  );
  if (!input) return;
  const parts = input.split('/').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    alert('Invalid format. Use MM/DD/YYYY.');
    return;
  }
  const [mm, dd, yyyy] = parts;
  const maxDay = getDaysInMonth(mm, yyyy);
  if (mm < 1 || mm > 12 || dd < 1 || dd > maxDay || yyyy < 1) {
    alert('Invalid date. Please try again.');
    return;
  }
  date = { month: mm, day: dd, year: yyyy };
  dayCount = ((yyyy - 1) * 360) + ((mm - 1) * 30) + dd; // approx
  updateClock();
};

/* date arithmetic */
function incrementDay() {
  dayCount++;
  date.day++;
  if (date.day > getDaysInMonth(date.month, date.year)) {
    date.day = 1;
    date.month++;
    if (date.month > 12) {
      date.month = 1;
      date.year++;
    }
  }
}
function decrementDay() {
  dayCount  = Math.max(1, dayCount - 1);
  date.day  = Math.max(1, date.day  - 1);
}

/* produce summary string */
function summaryText() {
  return `${states[idx].emoji} ${states[idx].name} — D${dayCount} — ${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}/${date.year}`;
}

/* render everything */
function updateClock() {
  /* main labels */
  document.getElementById('time-label').textContent =
    `${states[idx].emoji} ${states[idx].name} ${states[idx].emoji}`;

  document.getElementById('day-label').textContent  = `Day ${dayCount}`;
  document.getElementById('date-label').textContent =
    `${date.month}/${date.day}/${date.year}`;

  /* summary line */
  document.getElementById('summary-label').textContent = summaryText();

  /* pointer position */
  const pct = ((idx + 0.5) / states.length) * 100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;

  saveState();
}

/* auto‑cycle every 5 min */
setInterval(() => {
  const prevIdx = idx;
  idx = (idx + 1) % states.length;
  if (prevIdx === states.length - 1 && idx === 0) incrementDay();
  updateClock();
}, intervalMs);

/* chat timestamp */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({
    is_user  : false,
    name     : 'TimeOfDay',
    send_date: Date.now(),
    mes      : `[Time: ${states[idx].name}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  });
};

/* init */
loadState();
applyCollapsedUI();
updateClock();
