/* ──────────────────────────────────────────
   Live-Sync Gradient Clock v5.0.0
   • XML-based Temporal Injection for advanced LLMs
   • Weekday/Weekend awareness
   • Real-time browser sync & bounds checking
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

/* ── Advanced XML Prompt Logic ──────────── */
const fullPrompt = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const mPad = String(m).padStart(2, '0');
  const phase = getPhase(h);
  const dayName = weekdays[now.getDay()];
  const isWeekend = (now.getDay() === 0 || now.getDay() === 6);
  const dayType = isWeekend ? "Weekend" : "Weekday";
  
  // Using XML tags drastically improves LLM adherence
  let xmlPrompt = `\n<temporal_context>\n`;
  xmlPrompt += `  <current_time>${hr12(h)}:${mPad} ${ampm(h)}</current_time>\n`;
  xmlPrompt += `  <current_date>${dayName}, ${now.toLocaleDateString()}</current_date>\n`;
  xmlPrompt += `  <phase>${phase.name} ${phase.emoji}</phase>\n`;
  xmlPrompt += `  <day_type>${dayType}</day_type>\n`;
  
  xmlPrompt += `  <system_directives>\n`;
  xmlPrompt += `    - Treat the <current_time> as an absolute, immutable anchor for this turn.\n`;
  xmlPrompt += `    - Calculate all time-based events accurately from this exact minute.\n`;
  
  // Phase & Day-Type Logic
  if (phase.name === 'Night') {
    xmlPrompt += `    - It is late night. Assume physical fatigue, low lighting, and resting states.\n`;
  } else if (phase.name === 'Morning') {
    xmlPrompt += `    - It is morning. Assume waking routines, breakfast, and starting the day.\n`;
  } else if (phase.name === 'Noon') {
    xmlPrompt += `    - It is midday. Assume peak daylight, high activity, or being in the middle of tasks.\n`;
  } else {
    xmlPrompt += `    - It is evening. Assume the day is winding down, dinner time, or transition to rest.\n`;
  }

  if (isWeekend) {
    xmlPrompt += `    - It is the weekend. {{char}} is likely off work/school, relaxing, or pursuing leisure/social activities.\n`;
  } else if (dayName === 'Friday' && phase.name === 'Evening') {
    xmlPrompt += `    - It is Friday night. {{char}} is likely relieved the work week is over and looking to unwind.\n`;
  } else if (!isWeekend && phase.name !== 'Night') {
    xmlPrompt += `    - It is a weekday. {{char}} is likely constrained by work, school, or daily obligations.\n`;
  }

  xmlPrompt += `  </system_directives>\n`;
  xmlPrompt += `</temporal_context>\n`;

  return xmlPrompt;
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

/* ── Update UI ─────────────────────────── */
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const mPad = String(m).padStart(2, '0');
  const phase = getPhase(h);

  document.getElementById('time-label').textContent = `${phase.emoji} ${hr12(h)}:${mPad} ${ampm(h)}`;
  document.getElementById('weekday-label').textContent = weekdays[now.getDay()];
  document.getElementById('date-label').textContent = now.toLocaleDateString();
  document.getElementById('summary-label').textContent = `${hr12(h)}:${mPad} ${ampm(h)}`;

  const pct = ((h + (m/60)) / 24) * 100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;
}

/* ── Interaction & Bounds ──────────────── */
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
    clock.style.left = `${Math.max(10, Math.min(newX, maxX))}px`;
    clock.style.top = `${Math.max(10, Math.min(newY, maxY))}px`;
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
