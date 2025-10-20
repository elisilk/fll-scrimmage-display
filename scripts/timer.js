// TIMER

// Configuration

// const defaultTimerStartValue = 5; // shorter countdown, for testing purposes
const defaultTimerStartValue = 150; // 2:30 = 150 seconds

const audioTimerStart = new Audio('../sounds/robotic-countdown-43935.mp3');
const audioTimerEnd = new Audio('../sounds/brass-fail-8-a-207130.mp3');

// State

const timer = {
  element: document.querySelector('.timer'),
  intervalId: null,
  status: 'ready', // 'ready' | 'playing' | 'paused' | 'done'
  playSounds: true,
  secondsTotal: defaultTimerStartValue,
  secondsRemaining: defaultTimerStartValue,
};

// Actions

function updateTimerDisplay() {
  let adjustedSeconds = timer.secondsRemaining < 0 ? 0 : timer.secondsRemaining;
  const hours = Math.floor(adjustedSeconds / 3600);
  if (hours > 0) adjustedSeconds = adjustedSeconds % 3600;
  const minutes = Math.floor(adjustedSeconds / 60);
  const remainderSeconds = Math.floor(adjustedSeconds % 60);
  let displayTimeRemaining;
  if (hours > 0)
    displayTimeRemaining = `${hours}:${minutes
      .toString()
      .padStart(2, '0')}:${remainderSeconds.toString().padStart(2, '0')}`;
  else
    displayTimeRemaining = `${minutes}:${remainderSeconds
      .toString()
      .padStart(2, '0')}`;

  timer.element.textContent = displayTimeRemaining;
}

function setupTimer(seconds) {
  console.log(`Timer Setup: ${seconds} secs`);
  timer.element.classList.remove('timer--ended'); // remove the animation class
  if (timer.intervalId) clearInterval(timer.intervalId);
  if (seconds < 0) return;
  timer.secondsTotal = seconds;
  timer.secondsRemaining = seconds;
  timer.status = 'ready';
  timer.element.dataset.status = timer.status;
  updateTimerDisplay();
}

let nowInMsecs;
let endInMsecs;

function executeTimerIteration() {
  const msecsRemaining = endInMsecs - Date.now();
  timer.secondsRemaining = Math.round(msecsRemaining / 1000);
  updateTimerDisplay();
  if (msecsRemaining < 0) {
    if (timer.playSounds) audioTimerEnd.play();
    console.log('Timer finished!');
    clearInterval(timer.intervalId);
    timer.status = 'done';
    timer.element.dataset.status = timer.status;
    timer.element.classList.add('timer--ended');
    return;
  }
}

function startTimer() {
  timer.status = 'playing';
  timer.element.dataset.status = timer.status;

  nowInMsecs = Date.now();
  endInMsecs = nowInMsecs + timer.secondsRemaining * 1000;

  executeTimerIteration();
  timer.intervalId = setInterval(executeTimerIteration, 1000);
}

function pauseTimer() {
  console.log(`Timer Pause: ${timer.secondsRemaining} secs remaining`);
  timer.status = 'paused';
  timer.element.dataset.status = timer.status;
  if (timer.intervalId) clearInterval(timer.intervalId);
}

function playTimer() {
  console.log(`Timer Play: ${timer.secondsRemaining} secs remaining`);
  startTimer();
}

function timerToggleStatus() {
  switch (timer.status) {
    case 'ready':
    case 'paused':
      playTimer();
      break;
    case 'playing':
      pauseTimer();
      break;
    case 'done':
      timerReset();
      break;
    default:
      break;
  }
}

function timerToggleSound() {
  timer.playSounds = !timer.playSounds;
  timer.element.dataset.sound = timer.playSounds;
  console.log('Sound effects:', timer.playSounds ? 'On' : 'Off');
}

function timerReset() {
  timer.element.dataset.sound = timer.playSounds;
  setupTimer(timer.secondsTotal);
}

// HTML control elements and event listeners

const dialogStartMatch = document.querySelector('.dialog--start-match');
const dialogStartMatchContent = dialogStartMatch.querySelector('article');

let matchCountdownCount = 0;
let matchCountdownIntervalId = null;

function executeMatchCountdownIteration() {
  dialogStartMatchContent.innerHTML = `${
    matchCountdownCount < 1 ? 'LEGO!' : matchCountdownCount
  }`;
  matchCountdownCount--;
  if (matchCountdownCount < -1) {
    playTimer();
    clearInterval(matchCountdownIntervalId);
    dialogStartMatch.close();
  }
}

function startMatchCountdown() {
  dialogStartMatch.showModal();

  matchCountdownCount = 3;

  executeMatchCountdownIteration();

  matchCountdownIntervalId = setInterval(executeMatchCountdownIteration, 1000);

  if (timer.playSounds) audioTimerStart.play();
}

// ----------------------------------------
// HTML elements and event listeners
// ----------------------------------------

const buttonPlayPauseReset = document.querySelector('.btn--play-pause-reset');

buttonPlayPauseReset.addEventListener('click', () => {
  timer.status === 'ready' ? startMatchCountdown() : timerToggleStatus();
});

const buttonSoundOnOff = document.querySelector('.btn--sound-on-off');

buttonSoundOnOff.addEventListener('click', timerToggleSound);

document.querySelectorAll('.btn--timer-preset').forEach((button) =>
  button.addEventListener('click', (event) => {
    setupTimer(event.target.dataset.time);
  })
);

// ----------------------------------------
// Initialize
// ----------------------------------------

timerReset();
