const states = ['Morning','Noon','Evening','Night'];
let idx = 0;
let dayCount = 1;
let date = { day:1, month:1, year:1 };
const intervalMs = 5 * 60 * 1000;

// Create widget
const clockEl = document.createElement('div');
clockEl.id = 'calendar-clock';
clockEl.innerHTML = `
  <h2 id="time-label">${states[idx]}</h2>
  <p id="date-label">Day ${dayCount}, ${date.month}/${date.day}/${date.year}</p>
  <div class="clock-buttons">
    ${states.map((s,i)=>`<button data-i="${i}">${s}</button>`).join('')}
  </div>
`;
document.body.appendChild(clockEl);

// Make it draggable
makeDraggable(clockEl);

function makeDraggable(elm) {
  elm.style.position = 'fixed';
  elm.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e.preventDefault();
    let startX = e.clientX, startY = e.clientY;
    const origTop = elm.offsetTop, origLeft = elm.offsetLeft;
    document.onmouseup = () => document.onmousemove = null;
    document.onmousemove = (ev) => {
      ev.preventDefault();
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      elm.style.top = origTop + dy + 'px';
      elm.style.left = origLeft + dx + 'px';
    };
  }
}

// Buttons manual override
clockEl.querySelectorAll('button').forEach(btn => {
  btn.onclick = () => {
    const prev = idx;
    idx = parseInt(btn.dataset.i);
    if (prev === states.length - 1 && idx === 0) incrementDate();
    updateWidget();
  };
});

function incrementDate(){
  dayCount++;
  date.day++;
  if(date.day>30){
    date.day=1;
    date.month++;
    if(date.month>12){ date.month=1; date.year++; }
  }
}

function updateWidget(){
  document.getElementById('time-label').textContent = states[idx];
  document.getElementById('date-label').textContent =
    `Day ${dayCount}, ${date.month}/${date.day}/${date.year}`;
}

// Auto advanced cycle
setInterval(()=> {
  const prev = idx;
  idx = (idx +1) % states.length;
  if(prev === states.length -1 && idx === 0) incrementDate();
  updateWidget();
}, intervalMs);

// Prompt interceptor
globalThis.injectTimeOfDay = async function(chat) {
  const label = states[idx];
  const msg = {
    is_user: false,
    name: "TimeOfDay",
    send_date: Date.now(),
    mes: `[Time: ${label}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  };
  chat.unshift(msg);
};
