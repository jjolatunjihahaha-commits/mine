(function(){
  const states = ['Morning','Noon','Evening','Night'];
  let idx = 0;
  let dayCount = 1;        // start at day 1
  let year = 1, month = 1; // month/day numbering safe
  const intervalMs = 5 * 60 * 1000;

  const clockEl = document.createElement('div');
  clockEl.id = 'calendar-clock';

  const stateSpan = document.createElement('span');
  stateSpan.id = 'time-state';
  clockEl.appendChild(stateSpan);

  const dateSpan = document.createElement('span');
  dateSpan.id = 'date-display';
  dateSpan.style.display = 'block';
  clockEl.appendChild(dateSpan);

  const buttonsEl = document.createElement('div');
  buttonsEl.id = 'manual-buttons';
  states.forEach((label,i)=>{
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = ()=>{
      const prev = idx;
      idx = i;
      if(prev === states.length-1 && idx === 0){
        incrementDay();
      }
      update();
    };
    buttonsEl.appendChild(btn);
  });
  clockEl.appendChild(buttonsEl);
  document.body.appendChild(clockEl);

  function incrementDay(){
    dayCount++;
    // naive month rollover: assume 30 days/month, 12 months/year
    if(dayCount > 30){
      dayCount = 1;
      month++;
      if(month > 12){
        month = 1;
        year++;
      }
    }
  }

  function update(){
    stateSpan.innerText = states[idx];
    dateSpan.innerText = `Day ${dayCount}, ${month}/${year}`;
    SillyTavern.app.setSystemPrompt(
      `Current time: ${states[idx]}, Day ${dayCount}, Date ${month}/${year}/${year}.`
    );
  }

  setInterval(()=>{
    const prev = idx;
    idx = (idx +1) % states.length;
    if(prev === states.length -1 && idx === 0){
      incrementDay();
    }
    update();
  }, intervalMs);

  update();
})();
