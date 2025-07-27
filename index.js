const states = [
  { label:'🌅', name: 'Morning' },
  { label:'☀️', name: 'Noon' },
  { label:'🌇', name: 'Evening' },
  { label:'🌃', name: 'Night' },
  { label:'🌌', name: 'Midnight' }
];
let idx = 0;
let dayCount = 1;
let date = { day:1, month:1, year:1 };
const intervalMs = 5 * 60 * 1000;

// Build widget
const clockEl = document.createElement('div');
clockEl.id = 'calendar-clock';
clockEl.innerHTML = `
  <h2 id="time-label">${states[idx].label}</h2>
  <div class="clock-segments"><div class="segment-indicator" id="indicator"></div></div>
  <p id="date-label">Day ${dayCount}, ${date.month}/${date.day}/${date.year}</p>
  <div class="clock-buttons">
    ${states.map((s,i)=>`<button data-i="${i}">${s.label}</button>`).join('')}
  </div>
`;
document.body.appendChild(clockEl);
makeDraggable(clockEl);

// Dragging
function makeDraggable(elm) {
  elm.style.position = 'fixed';
  elm.onmousedown = e => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const origLeft = elm.offsetLeft, origTop = elm.offsetTop;
    document.onmouseup = () => document.onmousemove = null;
    document.onmousemove = ev => {
      ev.preventDefault();
      elm.style.left = origLeft + (ev.clientX - startX) + 'px';
      elm.style.top = origTop + (ev.clientY - startY) + 'px';
    };
  };
}

// Manual override buttons
clockEl.querySelectorAll('button').forEach(btn=>{
  btn.onclick = () => {
    const prev = idx;
    idx = parseInt(btn.dataset.i);
    if (prev === states.length-1 && idx === 0) incrementDate();
    updateWidget();
  };
});

function incrementDate(){
  dayCount++;
  date.day++;
  if(date.day > 30){ date.day = 1; date.month++;
    if(date.month >12){ date.month=1; date.year++; }
  }
}

function updateWidget(){
  document.getElementById('time-label').textContent = states[idx].label;
  document.getElementById('date-label').textContent =
    `Day ${dayCount}, ${date.month}/${date.day}/${date.year}`;
  // rotate indicator segment
  const deg = idx * (360 / states.length);
  document.getElementById('indicator').style.transform = `rotate(${deg}deg)`;
  clockEl.querySelectorAll('button').forEach((b,i)=> b.disabled = (i===idx));
}

// Auto cycle
setInterval(()=>{
  const prev = idx;
  idx = (idx+1) % states.length;
  if(prev === states.length-1 && idx===0) incrementDate();
  updateWidget();
}, intervalMs);

// Prompt injection
globalThis.injectTimeOfDay = async function(chat){
  const label = states[idx].name;
  const sys = { is_user:false, name:"TimeOfDay",
    send_date:Date.now(),
    mes:`[Time: ${label}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  };
  chat.unshift(sys);
};

updateWidget();
