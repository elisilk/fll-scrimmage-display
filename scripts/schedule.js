// SCHEDULE

// Configuration

const minsPerMatch = 5;
const matchesPerTeam = 3;
const breakTime = 30;
const numberOfTeamsToInclude = 20;

const eventStartTime = new Date('Nov 17 2025 17:05:00 GMT-0500');
const eventBreakTime = new Date('Nov 17 2025 18:35:00 GMT-0500');

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeStyle: 'short',
  // hour: 'numeric',
  // minute: '2-digit',
  // hour12: true,
});

// https://www.firstinspires.org/team-event-search#type=teams&sort=name&programs=FLL&year=2023&country=USA&stateprov=MA&zipCode=02445&distance=10

const teams = [
  { number: 6241, name: 'PixiStix' },
  { number: 38531, name: 'Pajama Llamas' },
  { number: 37960, name: 'Lazer Robotics' },
  { number: 44355, name: 'Gummy Bears' },
  { number: 45433, name: 'Lady Legocies' },
  { number: 46610, name: 'Smarties' },
  { number: 47084, name: 'Difference Engines' },
  { number: 57616, name: 'Robo-Dragons' },
  { number: 59211, name: 'Robot PengYo' },
  { number: 60644, name: 'Taco Bots' },
  { number: 63674, name: 'Beach Balls of Doom' },
  { number: 67598, name: 'Brookline Bumblebots' },
  { number: 68276, name: 'Bears' },
  { number: 68393, name: 'Killer Whales' },
  { number: 71153, name: '2BD' },
  { number: 71958, name: 'LEGO Llamas' },
  { number: 72022, name: '404 Code not found' },
  { number: 72043, name: 'BrooklineBros' },
  { number: 72075, name: 'LEGO Legends' },
  { number: 73757, name: 'Gadget Girls' },
];

const numberOfTeams = () => teams.length;

const getTeamInfoFromFLLTeamNumber = (number) =>
  teams.find((team) => team.number === number);

const shuffledArray = (array) => array.sort(() => Math.random() - 0.5);

const getTeamInfoFromEventTeamNumber = (number) => {
  const eventTeamInfo = eventTeams.find(
    (team) => team.eventTeamNumber === number
  );

  if (eventTeamInfo === undefined) {
    console.error('Event team not found:', number);
    return undefined;
  }

  return getTeamInfoFromFLLTeamNumber(eventTeamInfo.fllTeamNumber);
};

// Event info generators

const generateEventTeamNumbers = () =>
  shuffledArray(Array.from(teams)).map((team, index) => {
    return { eventTeamNumber: index + 1, fllTeamNumber: team.number };
  });

const generateEventMatches = (eventTeams) => {
  const totalNumberOfMatches = (matchesPerTeam * numberOfTeams()) / 2;
  const numberOfMatchesPerRound = numberOfTeams() / 2;
  console.log('Number of matches:', totalNumberOfMatches);

  const eventMatches = [];

  for (let i = 0; i < matchesPerTeam; i++) {
    eventTeams.forEach((team, index) => {
      // skip every other team
      if (index % 2 === 1) return;

      const matchNumber = i * numberOfMatchesPerRound + index / 2 + 1;
      const matchStartTime = new Date(
        eventStartTime.getTime() + (matchNumber - 1) * minsPerMatch * 60 * 1000
      );

      eventMatches.push({
        number: matchNumber,
        time: matchStartTime,
        sideA: index + 1,
        sideB: index + 2,
      });
    });
  }

  // iterate over the event teams
  // assign each team to a match with the adjacent team
  // assign each team to a match with the adjacent team + 1
  // assign each team to a match with the adjacent team + 2

  return eventMatches;
};

// Initialize Event

const eventTeams = generateEventTeamNumbers();
const eventMatches = generateEventMatches(eventTeams);

console.log('Generated teams:', eventTeams);
console.log('Generated matches:', eventMatches);

// State

let currentMatchNumber = 1;

// Getters

const currentMatch = () =>
  eventMatches.find((match) => match.number === currentMatchNumber);

const isValidMatchNumber = (matchNumber) =>
  eventMatches.findIndex((match) => match.number === matchNumber) !== -1;

const minMatchNumber = () => 1;

const maxMatchNumber = () =>
  eventMatches.reduce(
    (curr, next) => (next.number > curr ? next.number : curr),
    -Infinity
  );

// HTML display elements

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

scheduleControls.addEventListener('submit', (event) => {
  event.preventDefault();
});

// Actions

function populateCurrentMatch() {
  const currentMatchInfo = currentMatch();
  const sideATeamInfo = getTeamInfoFromEventTeamNumber(currentMatchInfo.sideA);
  const sideBTeamInfo = getTeamInfoFromEventTeamNumber(currentMatchInfo.sideB);

  // set the control input value
  inputCurrentMatch.value = currentMatchNumber;

  currentMatchNumberElement.innerHTML = currentMatchInfo.number;

  currentMatchElement.innerHTML = `
    <article class="current-match__side current-match__sideA">
      <header class="color-red">
        <span>Red</span>
        <span class="hide-on-narrow">Side</span>
      </header>
      <main>
        <div>Team ${currentMatchInfo.sideA}</div>
        <div>${sideATeamInfo.number}</div>
        <div class="hide-on-narrow">${sideATeamInfo.name}</div>
      </main>
    </article>
    <div class="current-match__vs">vs</div>
    <article class="current-match__side current-match__sideB">
      <header class="color-blue">
        <span>Blue</span>
        <span class="hide-on-narrow">Side</span>
      </header>
      <main>
        <div>Team ${currentMatchInfo.sideB}</div>
        <div>${sideBTeamInfo.number}</div>
        <div class="hide-on-narrow">${sideBTeamInfo.name}</div>
      </main>
    </article>
    `;
}

function populateMatchSchedule() {
  inputCurrentMatch.min = minMatchNumber();
  inputCurrentMatch.max = maxMatchNumber();

  scheduleTableBodyElement.innerHTML = eventMatches
    .map((match) => {
      const sideATeamInfo = getTeamInfoFromEventTeamNumber(match.sideA);
      const sideBTeamInfo = getTeamInfoFromEventTeamNumber(match.sideB);

      return `
  <tr data-match-number="${match.number}">
    <th scope="row">
      <div>${match.number}</div>
      <div class="hide-on-narrow">${timeFormatter.format(match.time)}</div>
    </th>
    <td>
      <div>Team ${match.sideA}</div>
      <div>${sideATeamInfo.number}</div>
      <div class="hide-on-narrow">${sideATeamInfo.name}</div>
    </td>
    <td>
      <div>Team ${match.sideB}</div>
      <div>${sideBTeamInfo.number}</div>
      <div class="hide-on-narrow">${sideBTeamInfo.name}</div>
    </td>
  </tr>
  `;
    })
    .join('');
}

function clearMatchScheduleModifiers() {
  const scheduleRows = scheduleTableBodyElement.querySelectorAll('tr');
  scheduleRows.forEach((row) => {
    row.classList.remove('current', 'next');
  });
}

function updateMatchScheduleModifiers() {
  clearMatchScheduleModifiers();

  // adjust scroll padding to account for table header
  const headerBlockSize = scheduleTableHeaderElement.offsetHeight;
  scheduleTableContainer.style.scrollPaddingBlockStart = `${headerBlockSize}px`;

  const currentMatchRow = scheduleTableBodyElement.querySelector(
    `tr[data-match-number="${currentMatchNumber}"]`
  );
  currentMatchRow.classList.add('current');
  currentMatchRow.scrollIntoView({
    behavior: 'smooth',
    container: 'nearest',
    block: 'start',
    inline: 'nearest',
  });

  const nextMatchRow = currentMatchRow.nextElementSibling;
  nextMatchRow?.classList.add('next');
}

function goToMatch(newMatchNumber) {
  if (!isValidMatchNumber(newMatchNumber)) {
    console.error('Invalid match number:', newMatchNumber);
    return;
  }
  currentMatchNumber = newMatchNumber;
  populateCurrentMatch();
  updateMatchScheduleModifiers();
}

function advanceMatchSchedule(advanceAmount) {
  goToMatch(currentMatchNumber + advanceAmount);
}

// HTML control elements and event listeners

const buttonPreviousMatch = document.querySelector('.btn--previous-match');
const buttonNextMatch = document.querySelector('.btn--next-match');

buttonPreviousMatch.addEventListener('click', () => advanceMatchSchedule(-1));
buttonNextMatch.addEventListener('click', () => advanceMatchSchedule(1));

inputCurrentMatch.addEventListener('change', () =>
  goToMatch(parseInt(inputCurrentMatch.value))
);

// Initialize

populateCurrentMatch();
populateMatchSchedule();
goToMatch(1);
