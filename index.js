/* ──────────────────────────────────────────
   Live-Sync Gradient Clock v4.3.0
   • Real-time browser sync
   • Advanced Temporal Anchoring Prompt
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

/* ── Advanced Prompt Engineering ────────── */
const fullPrompt = () => {
  const now = new Date();
  const h = now.getHours();
  const mPad = String(now.getMinutes()).padStart(2, '0');
  const phase = getPhase(h);
  const timeString = `${hr12(h)}:${mPad} ${ampm(h)}`;
  const dateString = `${weekdays[now.getDay()]}, ${now.toLocaleDateString()}`;

  // Temporal Anchoring & Pacing Directives
  let prompt = `[SYSTEM NOTE: Strict Temporal Anchor]\n`;
  prompt += `The current in-universe time is EXACTLY ${timeString} on ${dateString}.\n\n`;
  prompt += `{{char}} MUST adhere to the following chronological rules:\n`;
  prompt += `1. Accuracy: Acknowledge the exact time (${timeString}) when determining current actions, logic, and availability.\n`;
  prompt += `2. Narrative Pacing: Progress the scene in realistic, minute-by-minute increments. Do not skip forward in time, hallucinate future events, or assume hours have passed unless explicitly directed by {{user}}.\n`;
  
  // Environmental & Behavioral Nudges
  prompt += `3. Phase Context: It is currently ${phase.name} ${phase.emoji}. `;
  
  if (phase.name === 'Night') {
    prompt += `Maintain late-night environmental consistency (darkness, quietness). {{char}} should reflect appropriate energy levels (tiredness, sleeping, or relaxing).`;
  } else if (phase.name === 'Morning') {
    prompt += `Maintain early-day environmental consistency (sunrise, morning light). {{char}} is likely waking up, doing morning routines, or starting their day.`;
  } else if (phase.name === 'Noon') {
    prompt += `Maintain mid-day environmental consistency (daylight). {{char}} is currently in the middle of their active daily schedule, work, or activities.`;
  } else {
    prompt += `Maintain evening environmental consistency (sunset, dusk). {{char}} is likely concluding their daily tasks, dining, or winding down.`;
  }

  return prompt;
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
    
    // Boundary calculations
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
