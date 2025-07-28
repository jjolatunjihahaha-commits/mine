/* ──────────────────────────────────────────
   Time‑Cycle Gradient Clock  v3.0.0
   • 24‑hour time system
   • Auto‑advance 1 hour every 5 minutes
   • Time‑of‑day phase derived from hour
────────────────────────────────────────── */

const phases = [
  { name: 'Night',   emoji: '🌃', from: 21, to: 4  },  // 21‑04
  { name: 'Morning', emoji: '🌅', from: 5,  to: 11 },  // 05‑11
  { name: 'Noon',    emoji: '☀️', from: 12, to: 16 },  // 12‑16
  { name: 'Evening', emoji: '🌇', from: 17, to: 20 }   // 17‑20
];

const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

let hour = 6;                 // current hour (0‑23)
let dayCount = 1;             // Day 1 = Monday
let date = { day: 1, month: 1, year: 1 };

let collapsed = false;
let pos  = { left: 6, top: 6 };
let size = { width: 260 };

/* advance 1 in‑widget hour every 5 real‑minutes */
const intervalMs = 5 * 60 * 1000;

/* ── persistence helpers ─────────────────── */
function loadState() {
  const saved = JSON.parse(localStorage.getItem('clockState'));
  if (!saved) return;
  hour       = saved.hour      ?? hour;
  dayCount   = saved.dayCount  ?? dayCount;
  date       = saved.date      ?? date;
  collapsed  = saved.collapsed ?? collapsed;
  pos        = saved.pos       ?? pos;
  size       = saved.size      ?? size;
}
function saveState() {
  localStorage.setItem('clockState',
    JSON.stringify({ hour, dayCount, date, collapsed, pos, size })
  );
}
loadState();

/* ── utility fns ─────────────────────────── */
const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
const getWeekday     = ()     => weekdays[(dayCount - 1) % 7];
const getPhase       = ()     => phases.find(p =>
  p.from <= p.to ? (hour >= p.from && hour <= p.to)
                 : (hour >= p.from || hour <= p.to)
);
const timeSummary    = () =>
  `[Time: ${getPhase().name}, ${getWeekday()}, ${String(hour).padStart(2,'0')}:00, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`;
const fullPrompt     = () =>
  `${timeSummary()}\n\n{{char}} will always talk and behave in context of the current day and time.`;

 /* ── build widget ───────────────────────── */
const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <button id="toggle-btn"     title="Collapse / Expand">▾</button>
  <button id="edit-date-btn"  title="Edit date">🖊️</button>

  <div id="time-label"></div>
  <p   id="day-label"></p>
  <p   id="weekday-label"></p>
  <p   id="date-label"></p>
  <p   id="summary-label"></p>

  <div id="bar-container">
    <button class="nav-arrow" id="prev-btn" title="Previous hour">&#8249;</button>
    <div id="progress-bar"><div id="progress-pointer"></div></div>
    <button class="nav-arrow" id="next-btn" title="Next hour">&#8250;</button>
  </div>

  <div id="resize-handle" title="Resize"></div>
`;
document.body.appendChild(clock);

/* apply saved position & size */
clock.style.left  = `${pos.left}px`;
clock.style.top   = `${pos.top }px`;
clock.style.width = `${size.width}px`;

/* ── collapse helper ────────────────────── */
function applyCollapsedUI() {
  clock.classList.toggle('collapsed', collapsed);
  document.getElementById('toggle-btn').textContent = collapsed ? '▸' : '▾';
}

/* ── drag‑move widget ───────────────────── */
clock.onmousedown = e => {
  if (['edit-date-btn','toggle-btn','resize-handle'].includes(e.target.id)) return;
  e.preventDefault();
  const start = { x: e.clientX, y: e.clientY };
  const orig  = { left: clock.offsetLeft, top: clock.offsetTop };

  document.onmouseup = () => {
    document.onmousemove = null;
    pos = { left: clock.offsetLeft, top: clock.offsetTop };
    saveState();
  };
  document.onmousemove = ev => {
    ev.preventDefault();
    clock.style.left = `${orig.left + ev.clientX - start.x}px`;
    clock.style.top  = `${orig.top  + ev.clientY - start.y}px`;
  };
};

/* ── resize handle ──────────────────────── */
document.getElementById('resize-handle').onmousedown = e => {
  e.preventDefault();
  e.stopPropagation();
  const start = { x: e.clientX, width: clock.offsetWidth };

  document.onmouseup = () => {
    document.onmousemove = null;
    size = { width: clock.offsetWidth };
    saveState();
  };
  document.onmousemove = ev => {
    ev.preventDefault();
    let newW = start.width + (ev.clientX - start.x);
    newW = Math.max(180, Math.min(newW, 600));
    clock.style.width = `${newW}px`;
  };
};

/* ── navigation buttons ─────────────────── */
document.getElementById('prev-btn').onclick = () => {
  hour--;
  if (hour < 0) { hour = 23; decrementDay(); }
  updateClock();
};
document.getElementById('next-btn').onclick = () => {
  hour++;
  if (hour > 23) { hour = 0; incrementDay(); }
  updateClock();
};

/* ── collapse toggle ────────────────────── */
document.getElementById('toggle-btn').onclick = () => {
  collapsed = !collapsed;
  applyCollapsedUI();
  saveState();
};

/* ── edit date ──────────────────────────── */
document.getElementById('edit-date-btn').onclick = () => {
  const input = prompt('Enter new date (MM/DD/YYYY):', `${date.month}/${date.day}/${date.year}`);
  if (!input) return;
  const [mm, dd, yy] = input.split('/').map(Number);
  if ([mm, dd, yy].some(isNaN) || mm < 1 || mm > 12 ||
      dd < 1 || dd > getDaysInMonth(mm, yy) || yy < 1)
    return alert('Invalid date.');
  date = { month: mm, day: dd, year: yy };
  dayCount = ((yy - 1) * 360) + ((mm - 1) * 30) + dd;
  updateClock();
};

/* ── date math ─────────────────────────── */
function incrementDay() {
  dayCount++; date.day++;
  if (date.day > getDaysInMonth(date.month, date.year)) {
    date.day = 1; date.month++;
    if (date.month > 12) { date.month = 1; date.year++; }
  }
}
function decrementDay() {
  dayCount = Math.max(1, --dayCount);
  date.day--;
  if (date.day < 1) {
    date.month--;
    if (date.month < 1) { date.month = 12; date.year = Math.max(1, --date.year); }
    date.day = getDaysInMonth(date.month, date.year);
  }
}

/* ── render UI ─────────────────────────── */
function updateClock() {
  const phase = getPhase();

  document.getElementById('time-label'    ).textContent =
    `${phase.emoji} ${phase.name} ${phase.emoji} — ${String(hour).padStart(2,'0')}:00`;
  document.getElementById('day-label'     ).textContent = `Day ${dayCount}`;
  document.getElementById('weekday-label' ).textContent = getWeekday();
  document.getElementById('date-label'    ).textContent = `${date.month}/${date.day}/${date.year}`;
  document.getElementById('summary-label' ).textContent = timeSummary();

  const pct = ((hour + 0.5) / 24) * 100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;

  saveState();
}

/* ── auto‑cycle ────────────────────────── */
setInterval(() => {
  hour++;
  if (hour > 23) { hour = 0; incrementDay(); }
  updateClock();
}, intervalMs);

/* ── LLM interceptor – inject EVERY time ─ */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({
    is_user  : false,
    name     : 'System',
    send_date: Date.now(),
    mes      : fullPrompt()
  });
};

/* ── init ─────────────────────────────── */
applyCollapsedUI();
updateClock();
