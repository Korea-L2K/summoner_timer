const playerContainer = document.getElementById('player-container');
const players = ['top', 'jg', 'mid', 'adc', 'sup'];
const summs = ['barrier', 'cleanse', 'exhaust', 'flash', 'ghost', 'heal', 'ignite', 'smite', 'teleport'];

function createTimerButton(name, spell) {
  return `
  <button class="timer-button" data-player="${name}" data-spell="${spell}">
    <div class="edit-button" role="button" tabindex="0">⋮</div>
    <div class="spell-menu hidden">
      ${summs.map(s => `<button class="spell-option" data-spell="${s}"></button>`).join('')}
    </div>
  </button>`;
}

players.forEach((name) => {
  const player = document.createElement('div');
  player.className = 'player';
  player.dataset.player = name;

  player.innerHTML = `
    ${createTimerButton(name, 'd')}
    ${createTimerButton(name, 'f')}
    <div class="toggles">
      <button class="toggle" data-player="${name}" data-source="cosmic"></button>
      <button class="toggle" data-player="${name}" data-source="lucidity"></button>
    </div>
  `;

  playerContainer.appendChild(player);
});
