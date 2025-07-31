/* ──────────────────────────────────────────
   Time-Cycle Gradient Clock  v3.3.1
   Now split in three sections:
     1) Time Manager  – original clock (unchanged)
     2) Story Manager – chat summary  + lorebook update
     3) Suggestion Generator – first-message helper
────────────────────────────────────────── */

const phases = [
  { name: 'Night',   emoji: '🌃', from: 21, to: 4  },
  { name: 'Morning', emoji: '🌅', from: 5,  to: 11 },
  { name: 'Noon',    emoji: '☀️', from: 12, to: 16 },
  { name: 'Evening', emoji: '🌇', from: 17, to: 20 }
];
const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/* ── clock state ───────────────────────── */
let hour = 6;        // 0-23
let dayCount = 1;
let date = { day:1, month:1, year:1 };
let collapsed = false;
let pos  = { left: 6, top: 6 };
let size = { width:260 };
const getDaysInMonth = (m,y)=>new Date(y,m,0).getDate();
const getWeekday     = ()    => weekdays[(dayCount-1)%7];
const getPhase       = ()    => phases.find(p =>
  p.from<=p.to ? (hour>=p.from&&hour<=p.to)
               : (hour>=p.from||hour<=p.to)
);
const hr12 = h=>((h+11)%12)+1, ampm=h=>(h<12?'AM':'PM');
const timeSummary = ()=>`[Time: ${getPhase().name}, ${getWeekday()}, ${hr12(hour)}:00 ${ampm(hour)}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`;

/* ── persistence ───────────────────────── */
function loadState(){
  const s=JSON.parse(localStorage.getItem('clockState'));
  if(!s)return;
  hour      =s.hour      ??hour;
  dayCount  =s.dayCount  ??dayCount;
  date      =s.date      ??date;
  collapsed =s.collapsed ??collapsed;
  pos       =s.pos       ??pos;
  size      =s.size      ??size;
}
function saveState(){
  localStorage.setItem('clockState',JSON.stringify({hour,dayCount,date,collapsed,pos,size}));
}
loadState();

/* ── container ─────────────────────────── */
const clock=document.createElement('div');
clock.id='calendar-clock';
document.body.appendChild(clock);
clock.style.left =`${pos.left}px`;
clock.style.top  =`${pos.top }px`;
clock.style.width=`${size.width}px`;

/* ── TIME MANAGER (old widget wrapped) ── */
clock.innerHTML=`
  <h3 class="section-title">Time Manager</h3>
  <div id="time-manager">
    <button id="toggle-btn"    title="Collapse / Expand">▾</button>
    <button id="edit-date-btn" title="Edit date">🖊️</button>

    <div id="time-label"></div>
    <p id="day-label"></p>
    <p id="weekday-label"></p>
    <p id="date-label"></p>
    <p id="summary-label"></p>

    <div id="bar-container">
      <button class="nav-arrow" id="prev-btn" title="Previous hour">&#8249;</button>
      <div id="progress-bar"><div id="progress-pointer"></div></div>
      <button class="nav-arrow" id="next-btn" title="Next hour">&#8250;</button>
    </div>

    <div id="resize-handle" title="Resize"></div>
  </div>

  <h3 class="section-title">Story Manager</h3>
  <div id="story-manager">
    <label for="lore-select">Lorebook Entry:</label>
    <select id="lore-select"></select>

    <div class="btn-row">
      <button id="summarize-btn">Summarize Chat</button>
      <button id="update-lore-btn">Update Lorebook</button>
    </div>

    <textarea id="chat-summary" rows="4" placeholder="Chat summary…" spellcheck="false"></textarea>
  </div>

  <h3 class="section-title">Suggestion Generator</h3>
  <div id="suggestion-manager">
    <label for="suggest-lore-select">Lorebook Entry:</label>
    <select id="suggest-lore-select"></select>

    <button id="generate-suggestion-btn">Generate Suggestion</button>
    <p id="suggestion-output"></p>
  </div>
`;

/* ── build 24-hour bar ticks ───────────── */
const progressBar=clock.querySelector('#progress-bar');
for(let h=0;h<24;h++){
  const tick=document.createElement('div');
  tick.className='hour-tick'+(h%6===0?' major':'');
  tick.style.left=`${(h/24)*100}%`;
  progressBar.appendChild(tick);
}

/* ── UI helpers ───────────────────────── */
function applyCollapsedUI(){
  clock.classList.toggle('collapsed',collapsed);
  document.getElementById('toggle-btn').textContent=collapsed?'▸':'▾';
}

/* ── drag-move whole widget ───────────── */
clock.onmousedown=e=>{
  if(['edit-date-btn','toggle-btn','resize-handle'].includes(e.target.id))return;
  e.preventDefault();
  const start={x:e.clientX,y:e.clientY},orig={left:clock.offsetLeft,top:clock.offsetTop};
  document.onmouseup=()=>{document.onmousemove=null;pos={left:clock.offsetLeft,top:clock.offsetTop};saveState();};
  document.onmousemove=ev=>{
    ev.preventDefault();
    clock.style.left=`${orig.left+ev.clientX-start.x}px`;
    clock.style.top =`${orig.top +ev.clientY-start.y}px`;
  };
};
/* ── resize only affects width (keep old) ─ */
document.getElementById('resize-handle').onmousedown=e=>{
  e.preventDefault();e.stopPropagation();
  const start={x:e.clientX,width:clock.offsetWidth};
  document.onmouseup=()=>{document.onmousemove=null;size={width:clock.offsetWidth};saveState();};
  document.onmousemove=ev=>{
    ev.preventDefault();
    const newW=Math.max(180,Math.min(start.width+ev.clientX-start.x,600));
    clock.style.width=`${newW}px`;
  };
};

/* ── nav buttons ──────────────────────── */
document.getElementById('prev-btn').onclick=()=>{
  hour--;if(hour<0){hour=23;decrementDay();}updateClock();
};
document.getElementById('next-btn').onclick=()=>{
  hour++;if(hour>23){hour=0;incrementDay();}updateClock();
};

/* ── collapse toggle ─────────────────── */
document.getElementById('toggle-btn').onclick=()=>{
  collapsed=!collapsed;applyCollapsedUI();saveState();
};

/* ── edit date ───────────────────────── */
document.getElementById('edit-date-btn').onclick=()=>{
  const inp=prompt('Enter new date (MM/DD/YYYY):',`${date.month}/${date.day}/${date.year}`);
  if(!inp)return;
  const [mm,dd,yy]=inp.split('/').map(Number);
  if([mm,dd,yy].some(isNaN)||mm<1||mm>12||dd<1||dd>getDaysInMonth(mm,yy)||yy<1)
    return alert('Invalid date.');
  date={month:mm,day:dd,year:yy};
  dayCount=((yy-1)*360)+((mm-1)*30)+dd;
  updateClock();
};

/* ── day math ────────────────────────── */
function incrementDay(){dayCount++;date.day++;
  if(date.day>getDaysInMonth(date.month,date.year)){date.day=1;date.month++;
    if(date.month>12){date.month=1;date.year++;}}
}
function decrementDay(){dayCount=Math.max(1,--dayCount);date.day--;
  if(date.day<1){date.month--;
    if(date.month<1){date.month=12;date.year=Math.max(1,--date.year);}
    date.day=getDaysInMonth(date.month,date.year);}
}

/* ── render clock ─────────────────────── */
function updateClock(){
  const phase=getPhase();
  document.getElementById('time-label').textContent=
    `${phase.emoji} ${phase.name} ${phase.emoji} — ${hr12(hour)}:00 ${ampm(hour)}`;
  document.getElementById('day-label').textContent     =`Day ${dayCount}`;
  document.getElementById('weekday-label').textContent =getWeekday();
  document.getElementById('date-label').textContent    =`${date.month}/${date.day}/${date.year}`;
  document.getElementById('summary-label').textContent =timeSummary();

  const pct=((hour+0.5)/24)*100;
  document.getElementById('progress-pointer').style.left=`${pct}%`;
  saveState();
}

/* ──────────────────────────────────────────
   STORY MANAGER  (chat summary + lore update)
────────────────────────────────────────── */
if(!globalThis.worldInfo)globalThis.worldInfo={};  // basic store

const loreSelect      = document.getElementById('lore-select');
const suggestSelect   = document.getElementById('suggest-lore-select');
const chatSummaryBox  = document.getElementById('chat-summary');
const suggestionOut   = document.getElementById('suggestion-output');

function refreshLoreOptions(){
  const keys=Object.keys(globalThis.worldInfo);
  [loreSelect,suggestSelect].forEach(sel=>{
    const cur=sel.value;
    sel.innerHTML=keys.map(k=>`<option value="${k}">${k}</option>`).join('');
    if(keys.includes(cur))sel.value=cur;
  });
}
refreshLoreOptions();

/* simple concatenation summary (placeholder) */
function summarizeChat(){
  let summary='Chat history unavailable.';
  if(globalThis.chatHistory && globalThis.chatHistory.length){
    summary=globalThis.chatHistory.slice(-30).map(m=>`${m.name||'User'}: ${m.mes||m.text||m.content||''}`).join('\n');
  }
  chatSummaryBox.value=summary;
}

/* push summary into selected lorebook entry */
function updateLorebook(){
  const entry=loreSelect.value.trim();
  if(!entry){alert('Select a lorebook entry first.');return;}
  const text=chatSummaryBox.value.trim();
  if(!text){alert('Summary is empty.');return;}
  if(!globalThis.worldInfo[entry])globalThis.worldInfo[entry]={chunks:[]};
  globalThis.worldInfo[entry].chunks.push({date:Date.now(),text});
  refreshLoreOptions();
  alert('Lorebook updated ✅');
}

/* ──────────────────────────────────────────
   SUGGESTION GENERATOR
────────────────────────────────────────── */
function generateSuggestion(){
  const entry=suggestSelect.value.trim();
  if(!entry||!globalThis.worldInfo[entry]||!globalThis.worldInfo[entry].chunks.length){
    suggestionOut.textContent='(No content in that lorebook entry.)'; return;
  }
  const latest=globalThis.worldInfo[entry].chunks.slice(-1)[0].text;
  suggestionOut.textContent=`Maybe start with: “${latest.slice(0,120).replace(/\n/g,' ')}…”`;
}

/* ── button hooks ─────────────────────── */
document.getElementById('summarize-btn').onclick = summarizeChat;
document.getElementById('update-lore-btn').onclick = updateLorebook;
document.getElementById('generate-suggestion-btn').onclick = generateSuggestion;

/* ──────────────────────────────────────────
   LLM interceptor (unchanged)
────────────────────────────────────────── */
const fullPrompt=()=>{
  const phase=getPhase(),base=`${timeSummary()}

{{char}} will always talk and behave in context of the current day and time.`;
  const extra=(phase.name==='Noon'||phase.name==='Night')
    ?' Any messages to or from {{user}} are assumed to be text or phone call during this time, unless explicitly stated otherwise.'
    :'';
  return base+extra;
};
globalThis.injectTimeOfDay=async chat=>{
  chat.unshift({is_user:false,name:'System',send_date:Date.now(),mes:fullPrompt()});
};

/* ── init ─────────────────────────────── */
applyCollapsedUI();
updateClock();
