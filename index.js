/* ──────────────────────────────────────────
   Time-Cycle Gradient Clock  v3.3.1
   • 24-hour system ― manual advance (prev / next buttons)
   • Bar shows 24 hour ticks + smooth day-night gradient
   • AM / PM added to labels & injected summary
────────────────────────────────────────── */

const phases = [
  { name: 'Night',   emoji: '🌃', from: 21, to: 4  },
  { name: 'Morning', emoji: '🌅', from: 5,  to: 11 },
  { name: 'Noon',    emoji: '☀️', from: 12, to: 16 },
  { name: 'Evening', emoji: '🌇', from: 17, to: 20 }
];

const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

let hour = 6;        // 0-23
let dayCount = 1;
let date = { day: 1, month: 1, year: 1 };

let collapsed = false;
let pos  = { left: 6, top: 6 };
let size = { width: 260 };

/* manual advance only (auto progression disabled) */
const intervalMs = 5 * 60 * 1000; // preserved for potential future use, but unused now

/* ── persistence ───────────────────────── */
function loadState() {
  const s = JSON.parse(localStorage.getItem('clockState')); if (!s) return;
  ({ hour, dayCount, date, collapsed, pos, size } = s);
}
function saveState() {
  localStorage.setItem('clockState', JSON.stringify({ hour, dayCount, date, collapsed, pos, size }));
}

/* ── helpers ───────────────────────────── */
function phaseFor(h) {
  return phases.find(p => p.from <= p.to ? h >= p.from && h <= p.to : h >= p.from || h <= p.to);
}
function pad(n) { return (''+n).padStart(2,'0'); }
function getDaysInMonth(m, y) { return (m===2?28:30) + (m===2 && y%4===0); }
function fullPrompt() {
  return `It is ${weekdays[(dayCount-1)%7]}, ${date.month}/${date.day}/${date.year}, hour ${hour} (${phaseFor(hour).name}).`;
}

/* ── UI setup ──────────────────────────── */
const clock = document.getElementById('clock');
const summary = document.getElementById('summary');
const bar = document.getElementById('bar');
const pp = document.getElementById('progress-pointer');

function updateClock() {
  const pct = (hour / 24) * 100;
  bar.style.background = `linear-gradient(to right, var(--night) 0%, var(--night) ${(phases[0].to+1)/24*100}%, var(--morning) ${(phases[1].from)/24*100}%, var(--morning) ${(phases[1].to+1)/24*100}%, var(--noon) ${(phases[2].from)/24*100}%, var(--noon) ${(phases[2].to+1)/24*100}%, var(--evening) ${(phases[3].from)/24*100}%, var(--evening) 100%)`;
  pp.style.left = `${pct}%`;
  summary.textContent = `${phaseFor(hour).emoji}  ${phaseFor(hour).name} · ${pad(hour)}:00  ·  ${weekdays[(dayCount-1)%7]}  ${date.month}/${date.day}/${date.year}`;
  saveState();
}

/* ── draggable & resizable ─────────────── */
clock.onmousedown = ev => {
  if (ev.target !== clock) return;
  const start = { x: ev.clientX, y: ev.clientY, ...pos, width: size.width };
  document.onmousemove = ev2 => {
    ev2.preventDefault();
    pos.left = start.left + (ev2.clientX - start.x);
    pos.top  = start.top  + (ev2.clientY - start.y);
    clock.style.left = `${pos.left}px`; clock.style.top = `${pos.top}px`;
  };
  document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; saveState(); };
};

document.getElementById('resize-handle').onmousedown = ev => {
  ev.stopPropagation();
  const start = { x: ev.clientX, width: size.width };
  document.onmousemove = ev2 => {
    ev2.preventDefault();
    size.width = Math.max(180, Math.min(start.width + ev2.clientX - start.x, 600));
    clock.style.width = `${size.width}px`;
  };
  document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; saveState(); };
};

/* ── nav buttons ───────────────────────── */
document.getElementById('prev-btn').onclick = () => { hour--; if (hour < 0) { hour = 23; decrementDay(); } updateClock(); };
document.getElementById('next-btn').onclick = () => { hour++; if (hour > 23) { hour = 0; incrementDay(); } updateClock(); };
document.getElementById('toggle-btn').onclick = () => { collapsed = !collapsed; applyCollapsedUI(); saveState(); };

document.getElementById('edit-date-btn').onclick = () => {
  const inp = prompt('Enter new date (MM/DD/YYYY):', `${date.month}/${date.day}/${date.year}`);
  if (!inp) return;
  const [mm, dd, yy] = inp.split('/').map(Number);
  if ([mm, dd, yy].some(isNaN) || mm < 1 || mm > 12 || dd < 1 || dd > getDaysInMonth(mm, yy) || yy < 1)
    return alert('Invalid date.');
  date = { month: mm, day: dd, year: yy };
  dayCount = ((yy - 1) * 360) + ((mm - 1) * 30) + dd;
  updateClock();
};

/* ── day math ─────────────────────────── */
function incrementDay() { dayCount++; date.day++; if (date.day > 30) { date.day = 1; date.month++; if (date.month > 12) { date.month = 1; date.year++; } } }
function decrementDay() { dayCount--; date.day--; if (date.day < 1)  { date.day = 30; date.month--; if (date.month < 1) { date.month = 12; date.year--; } } }

/* auto-advance disabled by user request */
// setInterval removed — use the Prev / Next buttons to advance time manually.

/* LLM interceptor (unchanged) */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({ is_user:false, name:'System', send_date:Date.now(), mes:fullPrompt() });
};

/* ── init ─────────────────────────────── */
loadState();
applyCollapsedUI();
updateClock();
