const states = [
  { emoji: '🌅', name: 'Morning' },
  { emoji: '☀️', name: 'Noon' },
  { emoji: '🌇', name: 'Evening' },
  { emoji: '🌃', name: 'Night' },
  { emoji: '🌌', name: 'Midnight' }
];
let idx = 0, day = 1;
let date = { day:1, month:1, year:1 };
const interval = 5 * 60 * 1000;

// Build widget structure
const widget = document.createElement('div');
widget.id = 'calendar-clock';
widget.innerHTML = `
  <div class="clock-face">
    <div class="indicator" id="indicator"></div>
    <div id="time-emoji">${states[idx].emoji}</div>
  </div>
  <div id="date-label">Day ${day}, ${date.month}/${date.day}/${date.year}</div>
  <div class="clock-buttons">
    ${states.map((s,i)=>`<button data-i="${i}">${s.emoji}</button>`).join('')}
  </div>
`;
document.body.appendChild(widget);
initDrag(widget);

// Button handlers
widget.querySelectorAll('button').forEach(btn => {
  btn.onclick = () => {
    const prev = idx;
    idx = parseInt(btn.dataset.i);
    if (prev === states.length - 1 && idx === 0) incrementDay();
    refresh();
  };
});

function incrementDay(){
  day++; date.day++;
  if (date.day > 30) { date.day=1; date.month++; if (date.month>12){date.month=1;date.year++} }
}

function refresh(){
  document.getElementById('time-emoji').textContent = states[idx].emoji;
  document.getElementById('date-label').textContent =
    `Day ${day}, ${date.month}/${date.day}/${date.year}`;
  const deg = idx * (360 / states.length);
  document.getElementById('indicator').style.transform = `rotate(${deg}deg)`;
  widget.querySelectorAll('button').forEach((b,i)=> b.disabled = (i === idx));
}

setInterval(()=>{
  const prev = idx;
  idx = (idx + 1) % states.length;
  if (prev === states.length -1 && idx === 0) incrementDay();
  refresh();
}, interval);

// Prompt injection
globalThis.injectTimeOfDay = async function(chat) {
  chat.unshift({
    is_user: false,
    name: "TimeOfDay",
    send_date: Date.now(),
    mes: `[Time: ${states[idx].name}, Day ${day}, Date ${date.month}/${date.day}/${date.year}]`
  });
};

refresh();

function initDrag(el) {
  el.onmousedown = e => {
    e.preventDefault();
    const start = { x:e.clientX, y:e.clientY };
    const orig = { left: el.offsetLeft, top: el.offsetTop };
    document.onmouseup = () => document.onmousemove = null;
    document.onmousemove = ev => {
      ev.preventDefault();
      el.style.left = orig.left + (ev.clientX - start.x) + 'px';
      el.style.top = orig.top + (ev.clientY - start.y) + 'px';
    };
  };
}
