/* ──────────────────────────────────────────
   Time-Cycle Gradient Clock  v3.3.0
   • 24-hour system ― 1 hour passes every 5 real minutes
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

/* one in-widget hour passes every 5 real minutes */
const intervalMs = 5 * 60 * 1000;

/* ── persistence ───────────────────────── */
function loadState() {
  const s = JSON.parse(localStorage.getItem('clockState'));
  if (!s) return;
  hour       = s.hour      ?? hour;
  dayCount   = s.dayCount  ?? dayCount;
  date       = s.date      ?? date;
  collapsed  = s.collapsed ?? collapsed;
  pos        = s.pos       ?? pos;
  size       = s.size      ?? size;
}
function saveState() {
  localStorage.setItem('clockState',
    JSON.stringify({ hour, dayCount, date, collapsed, pos, size })
  );
}
loadState();

/* ── helpers ───────────────────────────── */
const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
const getWeekday     = ()     => weekdays[(dayCount - 1) % 7];
const getPhase       = ()     => phases.find(p =>
  p.from <= p.to ? (hour >= p.from && hour <= p.to)
                 : (hour >= p.from || hour <= p.to)
);
const hr12           = h => ((h + 11) % 12) + 1;
const ampm           = h => (h < 12 ? 'AM' : 'PM');
const timeSummary    = () =>
  `[Time: ${getPhase().name}, ${getWeekday()}, ${hr12(hour)}:00 ${ampm(hour)}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`;

/*  ▼▼▼  UPDATED SECTION  ▼▼▼  */
const fullPrompt = () => {
  const phase = getPhase();
  const base  = `${timeSummary()}\n\n{{char}} will always talk and behave in context of the current day and time.`;
  const extra = (phase.name === 'Noon' || phase.name === 'Night')
    ? ' Any messages to or from {{user}} are assumed to be text or phone call during this time, unless explicitly stated otherwise.'
    : '';
  return base + extra;
};
/*  ▲▲▲  UPDATED SECTION  ▲▲▲  */

 /* ── build widget ─────────────────────── */
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

/* saved position / size */
clock.style.left  = `${pos.left}px`;
clock.style.top   = `${pos.top }px`;
clock.style.width = `${size.width}px`;

/* ── add 24 tick lines ─────────────────── */
const progressBar = clock.querySelector('#progress-bar');
for (let h = 0; h < 24; h++) {
  const tick = document.createElement('div');
  tick.className = 'hour-tick' + (h % 6 === 0 ? ' major' : '');
  tick.style.left = `${(h / 24) * 100}%`;
  progressBar.appendChild(tick);
}

/* ── UI helpers ───────────────────────── */
function applyCollapsedUI() {
  clock.classList.toggle('collapsed', collapsed);
  document.getElementById('toggle-btn').textContent = collapsed ? '▸' : '▾';
}

/* drag-move */
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

/* resize */
document.getElementById('resize-handle').onmousedown = e => {
  e.preventDefault(); e.stopPropagation();
  const start = { x: e.clientX, width: clock.offsetWidth };

  document.onmouseup = () => {
    document.onmousemove = null;
    size = { width: clock.offsetWidth };
    saveState();
  };
  document.onmousemove = ev => {
    ev.preventDefault();
    const newW = Math.max(180, Math.min(start.width + ev.clientX - start.x, 600));
    clock.style.width = `${newW}px`;
  };
};

/* nav buttons */
document.getElementById('prev-btn').onclick = () => {
  hour--; if (hour < 0) { hour = 23; decrementDay(); }
  updateClock();
};
document.getElementById('next-btn').onclick = () => {
  hour++; if (hour > 23) { hour = 0; incrementDay(); }
  updateClock();
};

/* collapse toggle */
document.getElementById('toggle-btn').onclick = () => {
  collapsed = !collapsed;
  applyCollapsedUI();
  saveState();
};

/* edit date */
document.getElementById('edit-date-btn').onclick = () => {
  const inp = prompt('Enter new date (MM/DD/YYYY):', `${date.month}/${date.day}/${date.year}`);
  if (!inp) return;
  const [mm, dd, yy] = inp.split('/').map(Number);
  if ([mm, dd, yy].some(isNaN) || mm < 1 || mm > 12 ||
      dd < 1 || dd > getDaysInMonth(mm, yy) || yy < 1)
    return alert('Invalid date.');
  date = { month: mm, day: dd, year: yy };
  dayCount = ((yy - 1) * 360) + ((mm - 1) * 30) + dd;
  updateClock();
};

/* day math */
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

/* render clock */
function updateClock() {
  const phase = getPhase();

  document.getElementById('time-label').textContent =
    `${phase.emoji} ${phase.name} ${phase.emoji} — ${hr12(hour)}:00 ${ampm(hour)}`;
  document.getElementById('day-label').textContent      = `Day ${dayCount}`;
  document.getElementById('weekday-label').textContent  = getWeekday();
  document.getElementById('date-label').textContent     = `${date.month}/${date.day}/${date.year}`;
  document.getElementById('summary-label').textContent  = timeSummary();

  const pct = ((hour + 0.5) / 24) * 100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;

  saveState();
}

/* LLM interceptor */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({ is_user:false, name:'System', send_date:Date.now(), mes:fullPrompt() });
};

/* init */
applyCollapsedUI();
updateClock();
/* ── PART 2: Story Manager ───────────────────────── */
const storyContainer = document.createElement('div');
storyContainer.id = 'story-manager-section';
storyContainer.innerHTML = `
  <h3>📚 Story Manager</h3>
  <button id="summarize-chat-btn">Summarize Chat</button>
  <select id="lorebook-entry-select">
    <option value="entry1">Entry 1</option>
    <option value="entry2">Entry 2</option>
  </select>
  <button id="update-lorebook-btn">Update Lorebook</button>
  <textarea id="chat-summary" placeholder="Summary will appear here..." rows="4"></textarea>
`;
document.getElementById('calendar-clock').appendChild(storyContainer);

/* ── PART 3: Suggestion Generator ────────────────── */
const suggestionContainer = document.createElement('div');
suggestionContainer.id = 'suggestion-generator-section';
suggestionContainer.innerHTML = `
  <h3>💡 Suggestion Generator</h3>
  <select id="reference-entry-select">
    <option value="entry1">Entry 1</option>
    <option value="entry2">Entry 2</option>
  </select>
  <button id="generate-suggestion-btn">Generate First Message Suggestion</button>
  <textarea id="message-suggestion" placeholder="Suggested first message..." rows="3"></textarea>
`;
document.getElementById('calendar-clock').appendChild(suggestionContainer);

/* ── Logic for Story Tools ───────────────────────── */
document.getElementById('summarize-chat-btn').onclick = () => {
  // Placeholder logic for chat summarization
  const fakeSummary = "Summary of the chat goes here based on current conversation.";
  document.getElementById('chat-summary').value = fakeSummary;
};

document.getElementById('update-lorebook-btn').onclick = () => {
  const entry = document.getElementById('lorebook-entry-select').value;
  const content = document.getElementById('chat-summary').value;
  localStorage.setItem(`lorebook_${entry}`, content);
  alert(`Lorebook entry "${entry}" updated.`);
};

/* ── Logic for Suggestion Generator ──────────────── */
document.getElementById('generate-suggestion-btn').onclick = () => {
  const entry = document.getElementById('reference-entry-select').value;
  const lore = localStorage.getItem(`lorebook_${entry}`) || "No lore found.";
  const suggestion = `Based on "${entry}":\nLet's begin by referencing the last event...\n\n${lore.slice(0, 120)}...`;
  document.getElementById('message-suggestion').value = suggestion;
};
