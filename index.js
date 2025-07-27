const states = [
  { emoji:'🌅', name:'Morning' },
  { emoji:'☀️', name:'Noon' },
  { emoji:'🌇', name:'Evening' },
  { emoji:'🌃', name:'Night' },
  { emoji:'🌌', name:'Midnight' }
];
let idx = 0, dayCount = 1;
const date = { day:1, month:1, year:1 };
const intervalMs = 5 * 60 * 1000;

const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <div id="time-label">${states[idx].emoji} ${states[idx].name}</div>
  <div id="date-label">Day ${dayCount}, ${date.month}/${date.day}/${date.year}</div>
  <div class="clock-buttons">
    ${states.map((s,i)=>`<button data-i="${i}">${s.emoji} ${s.name}</button>`).join('')}
  </div>
  <div id="progress-bar"></div>
`;
document.body.appendChild(clock);
makeDraggable(clock);

function makeDraggable(elm) {
  elm.onmousedown = e => {
    e.preventDefault();
    const start = { x:e.clientX, y:e.clientY };
    const orig = { left:elm.offsetLeft, top:elm.offsetTop };
    document.onmouseup = () => document.onmousemove = null;
    document.onmousemove = ev => {
      ev.preventDefault();
      elm.style.left = orig.left + ev.clientX - start.x + 'px';
      elm.style.top = orig.top + ev.clientY - start.y + 'px';
    };
  };
}

clock.querySelectorAll('button').forEach(btn=>{
  btn.onclick = () => {
    const prev = idx;
    idx = +btn.dataset.i;
    if (prev === states.length - 1 && idx === 0) incrementDay();
    updateClock();
  };
});

function incrementDay(){
  dayCount++;
  date.day++;
  if(date.day > 30){
    date.day = 1;
    date.month++;
    if(date.month > 12) { date.month = 1; date.year++; }
  }
}

function updateClock(){
  document.getElementById('time-label').textContent = `${states[idx].emoji} ${states[idx].name}`;
  document.getElementById('date-label').textContent = `Day ${dayCount}, ${date.month}/${date.day}/${date.year}`;

  clock.querySelectorAll('button').forEach((btn,i)=> btn.disabled = (i === idx));

  const bar = document.getElementById('progress-bar');
  const leftPercent = ((idx + 0.5) / states.length) * 100;
  bar.style.setProperty('--arrow-left', `${leftPercent}%`);
  bar.style.setProperty('position','relative');
  bar.style.setProperty('pointer-events','none');
  bar.style.setProperty('overflow','visible');
  bar.style.setProperty('padding','0');
  bar.style.setProperty('--arrow', leftPercent + '%');
  bar.style.setProperty('--', '');
  bar.style.setProperty('left', '');
  bar.style.setProperty('right', '');
  // directly position ::after
  bar.style.setProperty('--arrow-left', `${leftPercent}%`);
  // access pseudo
  bar.querySelector('::after');
  // but simpler:
  const after = bar;
  after.style.setProperty('--'), null;
  // fallback: use style tag
  bar.style.cssText += '';
  updateArrow(bar, leftPercent);
}

function updateArrow(bar,leftPercent){
  bar.style.setProperty('--arrow-pointer', '');
  const arrow = bar;
  arrow.style.setProperty('--arrow-left', leftPercent + '%');
  // apply inline via pseudo
  bar.style.setProperty('position','relative');
  bar.style.setProperty('--arrow-left-pos', leftPercent +'%');
  // final: use bar as container
  const disp = bar;
  disp.style.setProperty('--arrow-left', leftPercent+'%');
  // cartoon: but actual:
  const pb = bar;
  const left = leftPercent;
  pb.style.setProperty('--arrow-left', leftPercent+'%');
  // arrow after via dynamic class
  bar.setAttribute('data-idx', idx);
}

setInterval(()=>{
  const prev = idx;
  idx = (idx + 1) % states.length;
  if(prev === states.length - 1 && idx === 0) incrementDay();
  updateClock();
}, intervalMs);

// Prompt injection
globalThis.injectTimeOfDay = async (chat) => {
  chat.unshift({
    is_user: false,
    name: "TimeOfDay",
    send_date: Date.now(),
    mes: `[Time: ${states[idx].name}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  });
};

updateClock();
