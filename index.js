const states = [
  { label: '🌅 Morning' },
  { label: '☀️ Noon' },
  { label: '🌇 Evening' },
  { label: '🌃 Night' },
  { label: '🌌 Midnight' }
];
let idx = 0;
let dayCount = 1;
let date = { day: 1, month: 1, year: 1 };
const intervalMs = 5 * 60 * 1000;

const clockEl = document.createElement('div');
clockEl.id = 'calendar-clock';
clockEl.innerHTML = `
  <h2 id="time-label">${states[idx].label}</h2>
  <p id="date-label">Day ${dayCount}, ${date.month}/${date.day}/${date.year}</p>
  <div class="clock-buttons">
    ${states.map((s,i)=>`<button data-i="${i}">${s.label}</button>`).join('')}
  </div>
`;
document.body.appendChild(clockEl);
makeDraggable(clockEl);

function makeDraggable(elm){
  elm.style.position = 'fixed';
  elm.onmousedown = function(e){
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

clockEl.querySelectorAll('button').forEach(btn=>{
  btn.onclick = () => {
    const prev = idx;
    idx = parseInt(btn.dataset.i);
    if (prev === states.length - 1 && idx === 0) incrementDate();
    updateWidget();
  };
});

function incrementDate(){
  dayCount++; date.day++;
  if (date.day > 30){
    date.day = 1; date.month++;
    if (date.month > 12){ date.month = 1; date.year++; }
  }
}

function updateWidget(){
  document.getElementById('time-label').textContent = states[idx].label;
  document.getElementById('date-label').textContent =
    `Day ${dayCount}, ${date.month}/${date.day}/${date.year}`;
  clockEl.querySelectorAll('button').forEach((b,i)=> b.disabled = (i === idx));
}

setInterval(()=>{
  const prev = idx;
  idx = (idx + 1) % states.length;
  if (prev === states.length - 1 && idx === 0) incrementDate();
  updateWidget();
}, intervalMs);

globalThis.injectTimeOfDay = async function(chat){
  const label = states[idx].label.replace(/[^\x00-\x7F]/g,''); // remove emoji for system text
  const sys = {
    is_user: false,
    name: "TimeOfDay",
    send_date: Date.now(),
    mes: `[Time: ${label}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  };
  chat.unshift(sys);
};

updateWidget();
