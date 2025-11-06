// MATCHES

import { timerReset } from './timer.js';

// ----------------------------------------
// Configuration
// ----------------------------------------

const defaultMatchesDataFile = 'data/matches.csv';

// ----------------------------------------
// State
// ----------------------------------------

let eventMatches;
let currentMatchNumber = 1;

// ----------------------------------------
// Getters
// ----------------------------------------

const currentMatch = () =>
  eventMatches.find((match) => match.matchNumber === currentMatchNumber);

const isValidMatchNumber = (matchNumber) =>
  eventMatches.findIndex((match) => match.matchNumber === matchNumber) !== -1;

const minMatchNumber = () => 1;

const maxMatchNumber = () =>
  eventMatches.reduce(
    (curr, next) => (next.matchNumber > curr ? next.matchNumber : curr),
    -Infinity
  );

// ----------------------------------------
// File input
// ----------------------------------------

// default data file (relative path URL)

function readDefaultDataFile() {
  fetch(defaultMatchesDataFile)
    .then((response) => response.text())
    .then((csvContent) => {
      // Process the CSV content here
      // console.log(csvContent);
      eventMatches = normalizeData(processCsvData(csvContent));
      // console.log(eventMatches);
      initializeSchedule();
    })
    .catch((error) => console.error('Error loading CSV:', error));
}

// user chosen data file (uploaded from local file on the user's machine)

const fileInput = document.getElementById('file-input');
const fileInputMessageDisplay = document.getElementById('file-input-message');

fileInput.addEventListener('change', handleFileSelection);

function handleFileSelection(event) {
  const file = event.target.files[0];
  fileInputMessageDisplay.textContent = ''; // Clear previous messages

  // Validate file existence and type
  if (!file) {
    showMessage('No file selected. Please choose a file.', 'error');
    return;
  }

  if (!file.type.startsWith('text')) {
    showMessage('Unsupported file type. Please select a text file.', 'error');
    return;
  }

  // Read the file
  const reader = new FileReader();
  reader.onload = () => {
    eventMatches = normalizeData(processCsvData(reader.result));
    initializeSchedule();
  };
  reader.onerror = () => {
    showMessage('Error reading the file. Please try again.', 'error');
  };
  reader.readAsText(file);
}

// Displays a message to the user
function showMessage(message, type) {
  fileInputMessageDisplay.textContent = message;
  fileInputMessageDisplay.style.color = type === 'error' ? 'red' : 'green';
}

// ----------------------------------------
// CSV data processing
// ----------------------------------------

function processCsvData(csvString) {
  const lines = csvString.split('\n');
  const headers = lines[0].split(','); // Assuming the first line contains headers
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      // Ensure consistent number of columns
      const rowObject = {};
      for (let j = 0; j < headers.length; j++) {
        rowObject[headers[j].trim()] = values[j].trim();
      }
      data.push(rowObject);
    }
  }

  return data;
}

function normalizeData(data) {
  return data.map((row) => ({
    type: row.Match === 'Break' ? 'break' : 'match',
    time: row.Time.trim(),
    matchNumber: row.Match === 'Break' ? null : parseInt(row.Match, 10),
    blueSide:
      row.Match === 'Break'
        ? null
        : {
            teamId: parseInt(row.BlueTeamId, 10),
            teamName: row.BlueTeamName.trim(),
            teamNumber: parseInt(row.BlueTeamNumber, 10),
          },
    redSide:
      row.Match === 'Break'
        ? null
        : {
            teamId: parseInt(row.RedTeamId, 10),
            teamName: row.RedTeamName.trim(),
            teamNumber: parseInt(row.RedTeamNumber, 10),
          },
  }));
}

// ----------------------------------------
// HTML elements and event listeners
// ----------------------------------------

// current match
const currentMatchNumberElement = document.querySelector(
  '.current-match__number'
);
const currentMatchElement = document.querySelector('.current-match');

// match schedule
const scheduleTableContainer = document.querySelector('.schedule__container');
const scheduleTableHeaderElement = document.querySelector('.schedule__header');
const scheduleTableBodyElement = document.querySelector('.schedule__body');

// match schedule controls
const scheduleControls = document.querySelector('.schedule__controls');
const inputCurrentMatch = document.querySelector('.schedule__input');
const buttonPreviousMatch = document.querySelector('.btn--previous-match');
const buttonNextMatch = document.querySelector('.btn--next-match');

scheduleControls.addEventListener('submit', (event) => {
  event.preventDefault();
});

buttonPreviousMatch.addEventListener('click', () => advanceMatchSchedule(-1));
buttonNextMatch.addEventListener('click', () => advanceMatchSchedule(1));

inputCurrentMatch.addEventListener('change', () =>
  goToMatch(parseInt(inputCurrentMatch.value))
);

// ----------------------------------------
// HTML generators
// ----------------------------------------

function generateBreakTableRowHTML(activity) {
  return `
    <tr data-activity-type="break">
      <th scope="row">
        <div class="hide-on-narrow">${activity.time}</div>
      </th>
      <td>
        <div>-- Break --</div>
      </td>
      <td>
        <div>-- Break --</div>
      </td>
    </tr>
    `;
}

function generateTeamHTML(team) {
  return isNaN(team.teamNumber)
    ? `
    <div>Team ${team.teamId}</div>
    <div>(open)</div>
    `
    : `
    <div>Team ${team.teamId}</div>
    <div class="hide-on-narrow">${team.teamNumber}</div>
    <div>${team.teamName}</div>
    `;
}

function generateMatchTableRowHTML(match) {
  return `
    <tr data-activity-type="match" data-match-number="${
      match.matchNumber
    }" tabindex="0">
      <th scope="row">
        <div>${match.matchNumber}</div>
        <div class="hide-on-narrow">${match.time}</div>
      </th>
      <td>
        ${generateTeamHTML(match.redSide)}
      </td>
      <td>
        ${generateTeamHTML(match.blueSide)}
      </td>
    </tr>
    `;
}

function generateCurrentMatchHTML(match) {
  return `
    <article class="current-match__side current-match__sideA">
      <header class="color-red">
        <span>Red</span>
        <span class="hide-on-narrow">Side</span>
      </header>
      <div>
        ${generateTeamHTML(match.redSide)}
      </div>
    </article>
    <div class="current-match__vs">vs</div>
    <article class="current-match__side current-match__sideB">
      <header class="color-blue">
        <span>Blue</span>
        <span class="hide-on-narrow">Side</span>
      </header>
      <div>
        ${generateTeamHTML(match.blueSide)}
      </div>
    </article>
    `;
}

// ----------------------------------------
// Actions
// ----------------------------------------

function populateMatchSchedule() {
  // set max and min values on the match number input control
  inputCurrentMatch.min = minMatchNumber();
  inputCurrentMatch.max = maxMatchNumber();
  // add a schedule row for each activity (match / break)
  scheduleTableBodyElement.innerHTML = eventMatches
    .map((activity) => {
      return activity.type === 'match'
        ? generateMatchTableRowHTML(activity)
        : generateBreakTableRowHTML(activity);
    })
    .join('');
  // add event listeners on each table row
  Array.from(scheduleTableBodyElement.children).forEach((row) => {
    row.addEventListener('click', () => {
      if (row.dataset.activityType === 'match')
        goToMatch(parseInt(row.dataset.matchNumber));
    });
    row.addEventListener('keydown', (event) => {
      if (row.dataset.activityType === 'match' && event.key === 'Enter')
        goToMatch(parseInt(row.dataset.matchNumber));
    });
  });
}

function populateCurrentMatch() {
  const currentMatchInfo = currentMatch();

  // set the control input value
  inputCurrentMatch.value = currentMatchNumber;

  // set the current match number display value
  currentMatchNumberElement.innerHTML = currentMatchInfo.matchNumber;

  // update the current match teams section
  currentMatchElement.innerHTML = generateCurrentMatchHTML(currentMatchInfo);
}

function initializeSchedule() {
  if (!eventMatches) return;

  // console.log('New event matches:', eventMatches);
  // console.log('Max match number:', maxMatchNumber());

  populateMatchSchedule();
  populateCurrentMatch();
  goToMatch(1);
}

function clearMatchScheduleModifiers() {
  const scheduleRows = scheduleTableBodyElement.querySelectorAll('tr');
  scheduleRows.forEach((row) => {
    row.classList.remove('current', 'next');
  });
}

function updateMatchScheduleModifiers() {
  clearMatchScheduleModifiers();

  // set new current and next match rows
  const currentMatchRow = scheduleTableBodyElement.querySelector(
    `tr[data-match-number="${currentMatchNumber}"]`
  );
  currentMatchRow.classList.add('current');
  const nextMatchRow = currentMatchRow.nextElementSibling;
  nextMatchRow?.classList.add('next');

  // scroll the schedule container to the current match
  // (adjust scroll padding to account for table header)
  scheduleTableContainer.scroll({
    top: currentMatchRow.offsetTop - scheduleTableHeaderElement.offsetHeight,
    behavior: 'smooth',
  });
}

function goToMatch(newMatchNumber) {
  if (!isValidMatchNumber(newMatchNumber)) {
    console.error('Invalid match number:', newMatchNumber);
    return;
  }
  timerReset();
  currentMatchNumber = newMatchNumber;
  populateCurrentMatch();
  updateMatchScheduleModifiers();
}

function advanceMatchSchedule(advanceAmount) {
  goToMatch(currentMatchNumber + advanceAmount);
}

// ----------------------------------------
// Initialize
// ----------------------------------------

// populateCurrentMatch();
// populateMatchSchedule();
// goToMatch(1);

readDefaultDataFile();
