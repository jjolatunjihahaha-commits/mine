/* ──────────────────────────────────────────
   Live-Sync Gradient Clock v4.3.0
   • Real-time browser sync
   • Advanced Temporal Prompt Engineering
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

/* ── Advanced Prompt Engineering Logic ──── */
const fullPrompt = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const mPad = String(m).padStart(2, '0');
  const phase = getPhase(h);
  
  // 1. Absolute Anchoring
  const systemClock = `[SYSTEM CLOCK: The current local time is ${hr12(h)}:${mPad} ${ampm(h)}. Phase: ${phase.name} ${phase.emoji}. Today is ${weekdays[now.getDay()]}, ${now.toLocaleDateString()}.]`;
  
  // 2. Strict Chronological Directive (Generic & Accurate)
  const temporalDirective = `[TEMPORAL DIRECTIVE: {{char}} is acutely aware of the exact time and date. All actions, dialogue, and perceptions of time passing must be logically anchored to the SYSTEM CLOCK. {{char}} must maintain precise chronological consistency, paying close attention to the exact hour and minute when referencing past events, estimating durations, or planning future actions.]`;
  
  // 3. Behavioral Grounding
  let phaseDirective = `[ENVIRONMENT: `;
  if (phase.name === 'Night') {
    phaseDirective += `It is nighttime. {{char}}'s behavior should realistically reflect the late hour (e.g., lowered energy, preparation for rest, quietness). If separated from {{user}}, asynchronous communication like text messaging is expected.]`;
  } else if (phase.name === 'Morning') {
    phaseDirective += `It is morning. {{char}}'s behavior should realistically reflect the start of the day (e.g., waking routines, morning activities, rising energy).]`;
  } else if (phase.name === 'Noon') {
    phaseDirective += `It is midday. {{char}} is likely engaged in their primary daily activities, responsibilities, or work.]`;
  } else {
    phaseDirective += `It is evening. {{char}}'s behavior should realistically reflect the day winding down (e.g., evening meals, relaxation, transitioning away from work).]`;
  }

  return `${systemClock}\n${temporalDirective}\n${phaseDirective}`;
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
  // Inject with a high priority formatting style
  chat.unshift({ is_user: false, name: 'System', send_date: Date.now(), mes: fullPrompt() });
};
