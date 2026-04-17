/* ──────────────────────────────────────────
   Live-Sync Gradient Clock v4.3.0
   • Real-time browser sync
   • Generic High-Precision Injection
   • Boundary-restricted dragging
────────────────────────────────────────── */

const phases = [
  { name: 'Night',   emoji: '🌃', from: 21, to: 4  },
  { name: 'Morning', emoji: '🌅', from: 5,  to: 11 },
  { name: 'Noon',    emoji: '☀️', from: 12, to: 16 },
  { name: 'Evening', emoji: '🌇', from: 17, to: 20 }
];

const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* ── Helpers ───────────────────────────── */
const getPhase = (h) => phases.find(p => 
  p.from <= p.to ? (h >= p.from && h <= p.to) : (h >= p.from || h <= p.to)
);

const ampm = h => (h < 12 ? 'AM' : 'PM');
const hr12 = h => ((h + 11) % 12) + 1;

/* ── Realism Injection Logic ────────────── */
const fullPrompt = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const mPad = String(m).padStart(2, '0');
  const phase = getPhase(h);
  
  const timeString = `[Current Context: ${phase.name} ${phase.emoji}, ${weekdays[now.getDay()]}, ${hr12(h)}:${mPad} ${ampm(h)}, Date ${now.toLocaleDateString()}]`;
  
  // Generic high-accuracy instructions
  let instructions = `\n\n{{char}} is strictly aware that the current time is exactly ${hr12(h)}:${mPad} ${ampm(h)}. `;
  instructions += `{{char}} must maintain perfect temporal logic and situational awareness based on this specific minute. All actions, references to the passage of time, and future plans must be mathematically consistent with this timestamp. `;
  
  if (phase.name === 'Night') {
    instructions += `{{char}}'s behavior reflects the late hour (e.g., lower energy, quiet environment). Communication is digital unless physically together.`;
  } else if (phase.name === 'Morning') {
    instructions += `{{char}}'s behavior reflects the start of the day and morning routines.`;
  } else if (phase.name === 'Noon') {
    instructions += `{{char}}'s behavior reflects midday activity, professional or social obligations, and high wakefulness.`;
  } else {
    instructions += `{{char}}'s behavior reflects the transition into the evening and winding down.`;
  }

  return `${timeString}${instructions}\n{{char}} will always prioritize logical time-consistency in every response.`;
};

/* ── Build UI ──────────────────────────── */
const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <button id="toggle-btn" title="Collapse / Expand">▾</button>
  <div id="time-label"></div>
  <p id="weekday-label"></p>
  <p id="date-label"></p>
  <p id="summary-label"></p>
  <div id="bar-container">
    <div id="progress-bar"><div id="progress-pointer"></div></div>
  </div>
`;
document.body.appendChild(clock);

/* ── State & Storage ───────────────────── */
let collapsed = localStorage.getItem('clockCollapsed') === 'true';
let pos = JSON.parse(localStorage.getItem('clockPos')) || { left: 20, top: 20 };

clock.style.left = `${pos.left}px`;
clock.style.top = `${pos.top}px`;

/* ── Update Logic ──────────────────────── */
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const mPad = String(m).padStart(2, '0');
  const phase = getPhase(h);

  document.getElementById('time-label').textContent = `${phase.emoji} ${phase.name} — ${hr12(h)}:${mPad} ${ampm(h)}`;
  document.getElementById('weekday-label').textContent = weekdays[now.getDay()];
  document.getElementById('date-label').textContent = now.toLocaleDateString();
  document.getElementById('summary-label').textContent = `${hr12(h)}:${mPad} ${ampm(h)}`;

  const pct = ((h + (m/60)) / 24) * 100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;
}

/* ── Dragging & Bounds ─────────────────── */
const applyUI = () => {
  clock.classList.toggle('collapsed', collapsed);
  document.getElementById('toggle-btn').textContent = collapsed ? '▸' : '▾';
};

document.getElementById('toggle-btn').onclick = () => {
  collapsed = !collapsed;
  localStorage.setItem('clockCollapsed', collapsed);
  applyUI();
};

clock.onmousedown = e => {
  if (e.target.id === 'toggle-btn') return;
  const startX = e.clientX - clock.offsetLeft;
  const startY = e.clientY - clock.offsetTop;

  document.onmousemove = ev => {
    let newX = ev.clientX - startX;
    let newY = ev.clientY - startY;
    const maxX = window.innerWidth - clock.offsetWidth - 10;
    const maxY = window.innerHeight - clock.offsetHeight - 10;
    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(10, Math.min(newY, maxY));
    clock.style.left = `${newX}px`;
    clock.style.top = `${newY}px`;
  };
  
  document.onmouseup = () => {
    document.onmousemove = null;
    localStorage.setItem('clockPos', JSON.stringify({ left: clock.offsetLeft, top: clock.offsetTop }));
  };
};

setInterval(updateClock, 10000);
updateClock();
applyUI();

/* ── SillyTavern Interceptor ───────────── */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({ is_user: false, name: 'System', send_date: Date.now(), mes: fullPrompt() });
};
