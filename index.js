// index.js
(function(){
  const states = ['Morning','Noon','Evening','Night'];
  let idx = 0;
  let day = 1, month = 1, year = 1;
  const intervalMs = 5 * 60 * 1000; // configurable

  // Create container
  const el = document.createElement('div');
  el.id = 'calendar-clock';
  el.style.position = 'fixed';
  el.style.cursor = 'move';

  // State display
  const stateSpan = document.createElement('span');
  stateSpan.id = 'time-state';
  el.appendChild(stateSpan);

  // Date display
  const dateSpan = document.createElement('span');
  dateSpan.id = 'date-display';
  dateSpan.style.display = 'block';
  el.appendChild(dateSpan);

  // Manual buttons
  const btnContainer = document.createElement('div');
  btnContainer.id = 'button-container';
  states.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = () => {
      const prev = idx;
      idx = i;
      if (prev === states.length - 1 && idx === 0) incrementDate();
      update();
    };
    btnContainer.appendChild(btn);
  });
  el.appendChild(btnContainer);

  document.body.appendChild(el);

  // Update visuals & prompt
  function update() {
    const label = states[idx];
    stateSpan.innerText = label;
    dateSpan.innerText = `Day ${day}, ${month}/${year}`;
    SillyTavern.app.setSystemPrompt(
      `Current time: ${label}, Day ${day}, Date ${month}/${year}/${year}.`
    );
  }

  function incrementDate() {
    day++;
    if (day > 30) {
      day = 1;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
  }

  // Auto-cycle
  setInterval(() => {
    const prev = idx;
    idx = (idx + 1) % states.length;
    if (prev === states.length - 1 && idx === 0) incrementDate();
    update();
  }, intervalMs);

  update();

  // Make draggable
  makeDraggable(el);

  function makeDraggable(elmnt) {
    let pos3 = 0, pos4 = 0, pos1 = 0, pos2 = 0;
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDrag;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      let newTop = elmnt.offsetTop - pos2;
      let newLeft = elmnt.offsetLeft - pos1;
      newTop = Math.max(0, Math.min(window.innerHeight - elmnt.clientHeight, newTop));
      newLeft = Math.max(0, Math.min(window.innerWidth - elmnt.clientWidth, newLeft));
      elmnt.style.top = newTop + 'px';
      elmnt.style.left = newLeft + 'px';
    }
    function closeDrag() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
})();
