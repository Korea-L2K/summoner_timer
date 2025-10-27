const playerContainer = document.getElementById('player-container');
const players = ['top', 'jg', 'mid', 'adc', 'sup'];
const summs = ['barrier', 'cleanse', 'exhaust', 'flash', 'ghost', 'heal', 'ignite', 'smite', 'teleport'];

function createTimerButton(name, spell) {
  return `
  <div class="timer" data-player="${name}" data-spell="${spell}">
    <button class="timer-button"></button>
    <div class="edit-button" tabindex="0">⋮</div>
    <div class="spell-menu hidden">
      ${summs.map(s => `<div class="spell-option" data-spell="${s}" style="background-image: url('images/${s}.png')"></div>`).join('')}
    </div>
  </div>
  `;
}

players.forEach((name) => {
  const player = document.createElement('div');
  player.className = 'player';
  player.dataset.player = name;

  player.innerHTML = `
    <div class="ult-controls">
      <button class="champion-select" data-player="${name}">Select</button>
      <button class="level-toggle" data-player="${name}">6</button>
    </div>
    <div class="ultimate-timer" data-player="${name}">
      <button class="ultimate-timer-button">R</button>
    </div>
    ${createTimerButton(name, 'd')}
    ${createTimerButton(name, 'f')}
    <div class="toggles">
      <button class="toggle" data-player="${name}" data-source="cosmic"></button>
      <button class="toggle" data-player="${name}" data-source="lucidity"></button>
    </div>
  `;

  playerContainer.appendChild(player);
});
