const playerContainer = document.getElementById('player-container');
const players = ['top', 'jg', 'mid', 'adc', 'sup'];

players.forEach((name) => {
  const player = document.createElement('div');
  player.className = 'player';
  player.dataset.player = name;

  player.innerHTML = `
    <button class="timer-button" data-player="${name}" data-spell="d"></button>
    <button class="timer-button" data-player="${name}" data-spell="f"></button>
    <div class="toggles">
      <button class="toggle" data-player="${name}" data-source="cosmic"></button>
      <button class="toggle" data-player="${name}" data-source="lucid"></button>
    </div>
  `;

  playerContainer.appendChild(player);
});
