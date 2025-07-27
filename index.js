/* ──────────────────────────────────────────
   Time‑Cycle Gradient Clock  v2.5.2
   • Correct arrow direction
   • Remembers drag position
────────────────────────────────────────── */

const states = [
  { emoji:'🌅', name:'Morning' },
  { emoji:'☀️', name:'Noon'    },
  { emoji:'🌇', name:'Evening' },
  { emoji:'🌃', name:'Night'   }
];

let idx = 0, dayCount = 1;
let date = { day:1, month:1, year:1 };
let collapsed = false;
let pos = { left: 6, top: 6 };          // default position
const intervalMs = 5 * 60 * 1000;

/* ── persistence ───────────────────────── */
function loadState(){
  const saved = JSON.parse(localStorage.getItem('clockState'));
  if(!saved) return;
  idx        = saved.idx        ?? idx;
  dayCount   = saved.dayCount   ?? dayCount;
  date       = saved.date       ?? date;
  collapsed  = saved.collapsed  ?? collapsed;
  pos        = saved.pos        ?? pos;
}
function saveState(){
  localStorage.setItem('clockState',
    JSON.stringify({ idx, dayCount, date, collapsed, pos })
  );
}

/* ── helpers ───────────────────────────── */
const getDaysInMonth = (m,y) => new Date(y,m,0).getDate();
const summaryText = () =>
  `${states[idx].emoji} ${states[idx].name} — D${dayCount} — ${String(date.month).padStart(2,'0')}/${String(date.day).padStart(2,'0')}/${date.year}`;

/* ── build widget ──────────────────────── */
const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <button id="toggle-btn"     title="Collapse / Expand">▾</button>
  <button id="edit-date-btn"  title="Edit date">🖊️</button>

  <div id="time-label"></div>
  <p   id="day-label"></p>
  <p   id="date-label"></p>

  <p   id="summary-label"></p>

  <div id="bar-container">
    <button class="nav-arrow" id="prev-btn" title="Previous time">&#8249;</button>
    <div id="progress-bar"><div id="progress-pointer"></div></div>
    <button class="nav-arrow" id="next-btn" title="Next time">&#8250;</button>
  </div>
`;
document.body.appendChild(clock);

/* apply saved position */
clock.style.left = `${pos.left}px`;
clock.style.top  = `${pos.top }px`;

/* ── collapse UI helper ────────────────── */
function applyCollapsedUI(){
  clock.classList.toggle('collapsed', collapsed);
  document.getElementById('toggle-btn').textContent = collapsed ? '▸' : '▾';
}

/* ── drag & save position ──────────────── */
clock.onmousedown = e=>{
  if(['edit-date-btn','toggle-btn'].includes(e.target.id)) return; // ignore buttons
  e.preventDefault();
  const start = { x:e.clientX, y:e.clientY };
  const orig  = { left:clock.offsetLeft, top:clock.offsetTop };

  document.onmouseup = ev=>{
    document.onmousemove = null;
    // save final position
    pos = { left: clock.offsetLeft, top: clock.offsetTop };
    saveState();
  };
  document.onmousemove = ev=>{
    ev.preventDefault();
    clock.style.left = `${orig.left + ev.clientX - start.x}px`;
    clock.style.top  = `${orig.top  + ev.clientY - start.y}px`;
  };
};

/* ── navigation buttons ────────────────── */
document.getElementById('prev-btn').onclick = ()=>{
  const prev = idx;
  idx = (idx-1+states.length)%states.length;
  if(prev===0 && idx===states.length-1) decrementDay();
  updateClock();
};
document.getElementById('next-btn').onclick = ()=>{
  const prev = idx;
  idx = (idx+1)%states.length;
  if(prev===states.length-1 && idx===0) incrementDay();
  updateClock();
};

/* ── collapse toggle ───────────────────── */
document.getElementById('toggle-btn').onclick = ()=>{
  collapsed = !collapsed;
  applyCollapsedUI();
  saveState();
};

/* ── edit date ─────────────────────────── */
document.getElementById('edit-date-btn').onclick = ()=>{
  const input = prompt('Enter new date (MM/DD/YYYY):', `${date.month}/${date.day}/${date.year}`);
  if(!input) return;
  const [mm,dd,yy] = input.split('/').map(Number);
  if([mm,dd,yy].some(isNaN)||mm<1||mm>12||dd<1||dd>getDaysInMonth(mm,yy)||yy<1)
    return alert('Invalid date.');
  date = { month:mm, day:dd, year:yy };
  dayCount = ((yy-1)*360)+((mm-1)*30)+dd;
  updateClock();
};

/* ── date math ─────────────────────────── */
function incrementDay(){
  dayCount++; date.day++;
  if(date.day>getDaysInMonth(date.month,date.year)){
    date.day=1; date.month++;
    if(date.month>12){ date.month=1; date.year++; }
  }
}
function decrementDay(){
  dayCount = Math.max(1, dayCount-1);
  date.day = Math.max(1, date.day-1);
}

/* ── render all UI ─────────────────────── */
function updateClock(){
  document.getElementById('time-label').textContent = `${states[idx].emoji} ${states[idx].name} ${states[idx].emoji}`;
  document.getElementById('day-label' ).textContent = `Day ${dayCount}`;
  document.getElementById('date-label').textContent = `${date.month}/${date.day}/${date.year}`;
  document.getElementById('summary-label').textContent = summaryText();

  const pct = ((idx+0.5)/states.length)*100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;

  saveState();
}

/* ── auto‑cycle ────────────────────────── */
setInterval(()=>{
  const prev = idx;
  idx = (idx+1)%states.length;
  if(prev===states.length-1 && idx===0) incrementDay();
  updateClock();
}, intervalMs);

/* ── chat timestamp hook ───────────────── */
globalThis.injectTimeOfDay = async chat=>{
  chat.unshift({
    is_user:false,
    name:'TimeOfDay',
    send_date:Date.now(),
    mes:`[Time: ${states[idx].name}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  });
};

/* ── init ──────────────────────────────── */
loadState();
applyCollapsedUI();
updateClock();
