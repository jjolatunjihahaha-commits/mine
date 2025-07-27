// File: extensions/time-of-day/index.js

let intervalId = null;
let currentTimeSlot = "";
let currentDate = new Date(1, 0, 1); // Start from 01-01-0001
const timeSlots = ["Morning", "Noon", "Evening", "Night"];
let slotIndex = 0;

function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear()).padStart(4, '0');
  return `${dd}-${mm}-${yyyy}`;
}

function updateTimeSlot() {
  slotIndex = (slotIndex + 1) % 4;
  currentTimeSlot = timeSlots[slotIndex];

  if (currentTimeSlot === "Morning" && slotIndex === 0) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const formattedDate = formatDate(currentDate);
  const timeString = `Time: ${currentTimeSlot}, Date: ${formattedDate}`;

  // Send as system prompt to the LLM
  ST.systemMessage.set(timeString);

  // Update UI
  const timeDisplay = document.getElementById("time-of-day-display");
  if (timeDisplay) {
    timeDisplay.textContent = timeString;
  }
}

function createClockUI() {
  const container = document.createElement("div");
  container.id = "time-of-day-display";
  container.style.position = "fixed";
  container.style.bottom = "10px";
  container.style.right = "10px";
  container.style.backgroundColor = "#1e1e2f";
  container.style.color = "#fff";
  container.style.padding = "10px 15px";
  container.style.borderRadius = "12px";
  container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  container.style.fontSize = "16px";
  container.style.zIndex = "9999";
  container.style.userSelect = "none";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginTop = "8px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "6px";
  buttonContainer.style.justifyContent = "space-between";

  timeSlots.forEach((slot, i) => {
    const btn = document.createElement("button");
    btn.textContent = slot;
    btn.style.padding = "4px 6px";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.background = "#333";
    btn.style.color = "#fff";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
      slotIndex = i - 1; // -1 because updateTimeSlot() increments
      updateTimeSlot();
    };
    buttonContainer.appendChild(btn);
  });

  container.appendChild(buttonContainer);
  document.body.appendChild(container);
}

function startClockCycle() {
  updateTimeSlot();
  intervalId = setInterval(updateTimeSlot, 5 * 60 * 1000); // 5 minutes
}

function stopClockCycle() {
  clearInterval(intervalId);
  intervalId = null;
}

function init() {
  createClockUI();
  startClockCycle();
}

window.addEventListener("DOMContentLoaded", init);
