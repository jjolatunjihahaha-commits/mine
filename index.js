/* ──────────────────────────────────────────
   Time‑Cycle Gradient Clock  v2.6.0
   • NEW: shows weekday (Sun‑Sat)
   • Still remembers drag & state
────────────────────────────────────────── */

const states = [
  { emoji:'🌅', name:'Morning' },
  { emoji:'☀️', name:'Noon'    },
  { emoji:'🌇', name:'Evening' },
  { emoji:'🌃', name:'Night'   }
];

/* NEW → weekday names */
const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

let idx = 0, dayCount = 1;
let date = { day:1, month:1, year:1 };
let collapsed = false;
let pos = { left: 6, top: 6 };          // default position
const intervalMs = 5 * 60 * 1000;

/* ── persistence (unchanged) ───────────── */
function loadState(){ … }
function saveState(){ … }

/* ── helpers ───────────────────────────── */
const getDaysInMonth = (m,y) => new Date(y,m,0).getDate();

/* UPDATED → now includes weekday */
const summaryText = () =>{
  const dow = weekdays[new Date(date.year, date.month-1, date.day).getDay()];
  return `${states[idx].emoji} ${states[idx].name} — ${dow} — D${dayCount} — ${String(date.month).padStart(2,'0')}/${String(date.day).padStart(2,'0')}/${date.year}`;
};

/* ── build widget ──────────────────────── */
const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <button id="toggle-btn"     title="Collapse / Expand">▾</button>
  <button id="edit-date-btn"  title="Edit date">🖊️</button>

  <div id="time-label"></div>
  <p   id="day-label"></p>

  <!-- NEW line -->
  <p   id="weekday-label"></p>

  <p   id="date-label"></p>
  <p   id="summary-label"></p>

  <div id="bar-container">
    <button class="nav-arrow" id="prev-btn" title="Previous time">&#8249;</button>
    <div id="progress-bar"><div id="progress-pointer"></div></div>
    <button class="nav-arrow" id="next-btn" title="Next time">&#8250;</button>
  </div>
`;
document.body.appendChild(clock);

/* … (code in the middle is unchanged) … */

/* ── render all UI ─────────────────────── */
function updateClock(){
  const dowName = weekdays[new Date(date.year, date.month-1, date.day).getDay()];

  document.getElementById('time-label' ).textContent = `${states[idx].emoji} ${states[idx].name} ${states[idx].emoji}`;
  document.getElementById('day-label'  ).textContent = `Day ${dayCount}`;
  document.getElementById('weekday-label').textContent = dowName;              // NEW
  document.getElementById('date-label' ).textContent = `${date.month}/${date.day}/${date.year}`;
  document.getElementById('summary-label').textContent = summaryText();

  const pct = ((idx+0.5)/states.length)*100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;

  saveState();
}

/* rest of file (incrementDay, decrementDay, interval, injector, init) stays as‑is */
