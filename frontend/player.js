const playerContainer = document.getElementById('player-container');
const players = ['top', 'jg', 'mid', 'adc', 'sup'];
let cosmic = {}, lucidity = {};

players.forEach((name, index) => {
  cosmic[name] = false, lucidity[name] = false;
  const player = document.createElement('div');
  player.className = 'player';
  player.dataset.player = name;

  player.innerHTML = `
    <button class="timer-button" data-player="${name}" data-spell="d"></button>
    <button class="timer-button" data-player="${name}" data-spell="f"></button>
    <div class="toggles">
      <button class="toggle" data-player="${name}" data-spell="cosmic"></button>
      <button class="toggle" data-player="${name}" data-spell="lucid"></button>
    </div>
  `;

  playerContainer.appendChild(player);
});

export function getHaste(player) {
  return cosmic[player] * 18 + lucidity[player] * 10;
}
