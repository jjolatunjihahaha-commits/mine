/* ──────────────────────────────────────────
   Live-Sync Gradient Clock v4.1.0
   • Real-time browser sync
   • Boundary-restricted dragging
   • Realistic AI behavioral logic
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
  const m = String(now.getMinutes()).padStart(2, '0');
  const phase = getPhase(h);
  
  const timeString = `[Current Context: ${phase.name} ${phase.emoji}, ${weekdays[now.getDay()]}, ${hr12(h)}:${m} ${ampm(h)}, Date ${now.toLocaleDateString()}]`;
  
  let instructions = `\n\n{{char}} is aware of the current time (${phase.name}). `;
  if (phase.name === 'Night') {
    instructions += `{{char}}'s responses should reflect exhaustion, quietness, or being in bed. If not physically present with {{user}}, {{char}} prefers texting over calling.`;
  } else if (phase.name === 'Morning') {
    instructions += `{{char}} is likely waking up, starting a morning routine, or feeling the initial energy of the day.`;
  } else if (phase.name === 'Noon') {
    instructions += `It is the middle of the day. {{char}} is likely busy, active, or at work/school.`;
  } else {
    instructions += `The day is winding down. {{char}} is likely relaxing or having dinner.`;
  }

  return `${timeString}${instructions}\n{{char}} will always behave realistically in alignment with this specific time and day.`;
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
  const m = String(now.getMinutes()).padStart(2, '0');
  const phase = getPhase(h);

  document.getElementById('time-label').textContent = `${phase.emoji} ${phase.name} — ${hr12(h)}:${m} ${ampm(h)}`;
  document.getElementById('weekday-label').textContent = weekdays[now.getDay()];
  document.getElementById('date-label').textContent = now.toLocaleDateString();
  document.getElementById('summary-label').textContent = `${hr12(h)}:${m} ${ampm(h)} (${phase.name})`;

  const pct = ((h + (now.getMinutes()/60)) / 24) * 100;
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

    // Clamping logic: Prevent moving outside browser window
    const maxX = window.innerWidth - clock.offsetWidth - 10;
    const maxY = window.innerHeight - clock.offsetHeight - 10;
    
    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(10, Math.min(newY, maxY));

    clock.style.left = `${newX}px`;
    clock.style.top = `${newY}px`;
  };
  
  document.onmouseup = () => {
    document.onmousemove = null;
    localStorage.setItem('clockPos', JSON.stringify({
      left: clock.offsetLeft,
      top: clock.offsetTop
    }));
  };
};

// Accuracy check every 10 seconds
setInterval(updateClock, 10000);
updateClock();
applyUI();

/* ── SillyTavern Interceptor ───────────── */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({ is_user: false, name: 'System', send_date: Date.now(), mes: fullPrompt() });
};
