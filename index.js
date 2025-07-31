/* ──────────────────────────────────────────
   Time-Cycle Gradient Clock  v3.3.0
   • 24-hour system ― manual advance only (no auto progression)
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

/* one in-widget hour previously passed every 5 real minutes */
const intervalMs = 5 * 60 * 1000;

/* ── persistence ───────────────────────── */
function loadState() {
  const s = JSON.parse(localStorage.getItem('clockState'));
  return s ?? { hour: 9, day: 1, month: 1, year: 2025, collapsed:false };
}
function saveState() {
  localStorage.setItem('clockState', JSON.stringify({ hour, day, month, year, collapsed }));
}

/* state */
let { hour, day, month, year, collapsed } = loadState();

/* ── helpers ───────────────────────────── */
function two(n){return n.toString().padStart(2,'0');}
function labelHour(h){return`${h%12||12}${h<12?' AM':' PM'}`;}
function fullPrompt(){return`Current in-widget time: ${labelHour(hour)} on ${weekdays[(day+3)%7]}, ${two(day)}/${two(month)}/${year}`;}

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
    <div id="day-bar"></div>
    <div id="progress-pointer"></div>
    <button class="nav-arrow" id="next-btn" title="Next hour">&#8250;</button>
  </div>
`;
document.body.appendChild(clock);

/* ── UI toggle ────────────────────────── */
function applyCollapsedUI(){
  clock.classList.toggle('collapsed',collapsed);
  document.getElementById('toggle-btn').innerText = collapsed?'▴':'▾';
}
document.getElementById('toggle-btn').onclick = () => {
  collapsed = !collapsed; applyCollapsedUI(); saveState();
};

/* ── date editor ──────────────────────── */
document.getElementById('edit-date-btn').onclick = () => {
  const input = prompt('Enter date as DD/MM/YYYY',`${two(day)}/${two(month)}/${year}`);
  if(!input) return;
  const [d,m,y] = input.split('/').map(Number);
  if(d>0&&d<=31&&m>0&&m<=12&&y>1900){
    day=d; month=m; year=y; updateClock();
  }
};

/* ── hour nav buttons ─────────────────── */
document.getElementById('prev-btn').onclick = () => { hour = (hour+23)%24; updateClock(); };
document.getElementById('next-btn').onclick = () => { hour = (hour+1)%24;  updateClock(); };

/* ── keyboard shortcuts ───────────────── */
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')  { hour=(hour+23)%24; updateClock(); }
  if(e.key==='ArrowRight') { hour=(hour+1)%24;  updateClock(); }
});

/* ── rendering ────────────────────────── */
function incrementDay(){
  day++; const daysInMonth = new Date(year,month,0).getDate();
  if(day>daysInMonth){day=1;month++; if(month>12){month=1;year++;}}
}
function currentPhase(h){
  return phases.find(p => p.from<=p.to ? h>=p.from && h<=p.to
                                      : h>=p.from || h<=p.to);
}
function updateClock(){
  /* labels */
  document.getElementById('time-label').innerText = labelHour(hour);
  document.getElementById('day-label').innerText  = `Day ${two(day)}`;
  document.getElementById('weekday-label').innerText = weekdays[(day+3)%7];
  document.getElementById('date-label').innerText = `${two(day)}/${two(month)}/${year}`;

  /* summary */
  const phase = currentPhase(hour);
  document.getElementById('summary-label').innerText = `${phase.emoji} Good ${phase.name}!`;

  /* progress bar */
  const pct = (hour+0.5)/24*100;
  document.getElementById('progress-pointer').style.left = `${pct}%`;

  saveState();
}

/* auto-advance */
/* setInterval(() => {
  hour++; if (hour > 23) { hour = 0; incrementDay(); }
  updateClock();
}, intervalMs); */  // DISABLED – widget now advances only via manual controls.

/* LLM interceptor */
globalThis.injectTimeOfDay = async chat => {
  chat.unshift({ is_user:false, name:'System', send_date:Date.now(), mes:fullPrompt() });
};

/* init */
applyCollapsedUI();
updateClock();
