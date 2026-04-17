/* ──────────────────────────────────────────
   Live-Sync Gradient Clock v4.0.0
   • Real-time browser sync
   • Enhanced AI behavioral logic
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
  const day = weekdays[now.getDay()];
  const dateStr = now.toLocaleDateString();

  let timeString = `[Current Context: ${phase.name} ${phase.emoji}, ${day}, ${hr12(h)}:${m} ${ampm(h)}, Date ${dateStr}]`;
  
  // Realistic behavioral instructions for the AI
  let instructions = `\n\n{{char}} is aware of the current time (${phase.name}). `;
  
  if (phase.name === 'Night') {
    instructions += `{{char}}'s responses should reflect exhaustion, quietness, or being in bed. If not in the same room, {{char}} prefers texting over calling.`;
  } else if (phase.name === 'Morning') {
    instructions += `{{char}} is likely waking up, getting coffee, or starting a routine. Responses might be slow or energetic depending on personality.`;
  } else if (phase.name === 'Noon') {
    instructions += `It is the middle of the day. {{char}} is likely active, working, or out. Responses should be realistic regarding their current availability.`;
  } else if (phase.name === 'Evening') {
    instructions += `The day is winding down. {{char}} might be having dinner or relaxing.`;
  }

  return `${timeString}${instructions}\n{{char}} will always behave in alignment with this specific time and day.`;
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

let collapsed = localStorage.getItem('clockCollapsed') === 'true';

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

/* ── UI Interaction ────────────────────── */
const applyUI = () => {
  clock.classList.toggle('collapsed', collapsed);
  document.getElementById('toggle-btn').textContent = collapsed ? '▸' : '▾';
};

document.getElementById('toggle-btn').onclick = () => {
  collapsed = !collapsed;
  localStorage.setItem('clockCollapsed', collapsed);
  applyUI();
};

// Dragging functionality
clock.onmousedown = e => {
  if (e.target.id === 'toggle-btn') return;
  const start = { x: e.clientX, y: e.clientY };
  const orig = { left: clock.offsetLeft, top: clock.offsetTop };
  document.onmousemove = ev => {
    clock.style.left = `${orig.left + ev.clientX - start.x}px`;
    clock.style.top = `${orig.top + ev.clientY - start.y}px`;
  };
  document.onmouseup = () => document.onmousemove = null;
};

setInterval(updateClock, 10000); // Update every 10s for accuracy
updateClock();
applyUI();

/* ── SillyTavern Interceptor ───────────── */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({ is_user: false, name: 'System', send_date: Date.now(), mes: fullPrompt() });
};
