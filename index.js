const states = [
  { label: '🌅 Morning', emoji: '🌅' },
  { label: '☀️ Noon', emoji: '☀️' },
  { label: '🌇 Evening', emoji: '🌇' },
  { label: '🌃 Night', emoji: '🌃' },
  { label: '🌙 Midnight', emoji: '🌙' }
];
let idx = 0;
let day = 1;
let date = { d: 1, m: 1, y: 1 };
const intervalMs = 5 * 60 * 1000;

const widget = document.createElement('div');
widget.id = 'calendar-clock';
widget.innerHTML = `
  <div id="time-icon">${states[idx].emoji}</div>
  <div id="time-label">${states[idx].label}</div>
  <div id="date-label">Day ${day}, ${date.m}/${date.d}/${date.y}</div>
  <div class="clock-buttons">
    ${states.map((s,i)=>`<button data-i="${i}">${s.emoji}</button>`).join('')}
  </div>
`;
document.body.appendChild(widget);
makeDraggable(widget);

widget.querySelectorAll('button').forEach(btn => {
  btn.onclick = () => {
    const prev = idx;
    idx = parseInt(btn.dataset.i);
    if (prev === states.length -1 && idx === 0) incrementDate();
    updateWidget();
  };
});

function incrementDate() {
  day++; date.d++;
  if (date.d > 30) {
    date.d = 1; date.m++;
    if (date.m > 12) { date.m = 1; date.y++; }
  }
}

function updateWidget() {
  document.getElementById('time-icon').textContent = states[idx].emoji;
  document.getElementById('time-label').textContent = states[idx].label;
  document.getElementById('date-label').textContent = `Day ${day}, ${date.m}/${date.d}/${date.y}`;
}

setInterval(() => {
  const prev = idx;
  idx = (idx + 1) % states.length;
  if (prev === states.length - 1 && idx === 0) incrementDate();
  updateWidget();
}, intervalMs);

globalThis.injectTimeOfDay = async function(chat) {
  const label = states[idx].label.replace(/ .+$/,''), // strip emoji if needed
        prompt = `[Time: ${label}, Day ${day}, Date ${date.m}/${date.d}/${date.y}]`;
  chat.unshift({
    is_user: false,
    name: 'TimeOfDay',
    send_date: Date.now(),
    mes: prompt
  });
};

function makeDraggable(elm) {
  elm.style.position = 'fixed';
  elm.onmousedown = e => {
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const ox = elm.offsetLeft, oy = elm.offsetTop;
    document.onmousemove = ev => {
      ev.preventDefault();
      elm.style.left = ox + (ev.clientX - sx) + 'px';
      elm.style.top = oy + (ev.clientY - sy) + 'px';
    };
    document.onmouseup = () => document.onmousemove = null;
  };
}
