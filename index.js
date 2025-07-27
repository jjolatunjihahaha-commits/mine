const states = [
  { emoji: '🌅', name: 'Morning' },
  { emoji: '☀️', name: 'Noon' },
  { emoji: '🌇', name: 'Evening' },
  { emoji: '🌃', name: 'Night' },
  { emoji: '🌌', name: 'Midnight' }
];
let idx = 0, dayCount = 1;
let date = { day: 1, month: 1, year: 1 };
const intervalMs = 5 * 60 * 1000;

const clock = document.createElement('div');
clock.id = 'calendar-clock';
clock.innerHTML = `
  <div id="time-label">${states[idx].emoji} ${states[idx].name}</div>
  <div id="date-label">Day ${dayCount}, ${date.month}/${date.day}/${date.year}</div>
  <div class="clock-buttons">
    ${states.map((s,i)=>`<button data-i="${i}">${s.emoji} ${s.name}</button>`).join('')}
  </div>
  <div id="progress-bar"></div>
`;
document.body.appendChild(clock);
makeDraggable(clock);

function makeDraggable(elm) {
  elm.onmousedown = e => {
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY };
    const orig = { left: elm.offsetLeft, top: elm.offsetTop };
    document.onmouseup = () => document.onmousemove = null;
    document.onmousemove = ev => {
      ev.preventDefault();
      elm.style.left = `${orig.left + ev.clientX - start.x}px`;
      elm.style.top = `${orig.top + ev.clientY - start.y}px`;
    };
  };
}

clock.querySelectorAll('button').forEach(btn => {
  btn.onclick = () => {
    const prev = idx;
    idx = +btn.dataset.i;
    if (prev === states.length - 1 && idx === 0) incrementDay();
    updateClock();
  };
});

function incrementDay() {
  dayCount++;
  date.day++;
  if (date.day > 30) {
    date.day = 1;
    date.month++;
    if (date.month > 12) {
      date.month = 1;
      date.year++;
    }
  }
}

function updateClock() {
  document.getElementById('time-label').textContent = `${states[idx].emoji} ${states[idx].name}`;
  document.getElementById('date-label').textContent =
    `Day ${dayCount}, ${date.month}/${date.day}/${date.year}`;

  clock.querySelectorAll('button').forEach((b,i) => b.disabled = (i === idx));

  const bar = document.getElementById('progress-bar');
  const percent = ((idx + 0.5) / states.length) * 100;
  bar.style.setProperty('--arrow-left', `${percent}%`);
  const arrow = window.getComputedStyle(bar, '::after');
  // Now set inline left via setting bar's ::after
  bar._arrowPercent = percent;
  bar.style.setProperty('position', 'relative');
  // hack: we manually move pseudo via style attribute
  bar.style.setProperty('--x', `${percent}%`);
  bar.style.setProperty('--arrow-left', `${percent}%`);
  bar.querySelectorAll('::after'); // trick to force style
  // Proper approach: put real <div> arrow
  updateArrow(bar, percent);
}

function updateArrow(bar, percent) {
  let arrow = bar.querySelector('.arrow-helper');
  if (!arrow) {
    arrow = document.createElement('div');
    arrow.className = 'arrow-helper';
    bar.appendChild(arrow);
  }
  arrow.style.position = 'absolute';
  arrow.style.width = '0';
  arrow.style.height = '0';
  arrow.style.top = '-4px';
  arrow.style.left = `calc(${percent}% - 6px)`;
  arrow.style.borderLeft = '6px solid transparent';
  arrow.style.borderRight = '6px solid transparent';
  arrow.style.borderBottom = '6px solid #5ac8fa';
}

setInterval(() => {
  const prev = idx;
  idx = (idx + 1) % states.length;
  if (prev === states.length - 1 && idx === 0) incrementDay();
  updateClock();
}, intervalMs);

globalThis.injectTimeOfDay = async function(chat) {
  chat.unshift({
    is_user: false,
    name: "TimeOfDay",
    send_date: Date.now(),
    mes: `[Time: ${states[idx].name}, Day ${dayCount}, Date ${date.month}/${date.day}/${date.year}]`
  });
};

updateClock();
