const playerContainer = document.getElementById('player-container');
const players = ['top', 'jungle'];
players.forEach((name, index) => {
  const player = document.createElement('div');
  player.className = 'player';
  player.dataset.player = name;

  player.innerHTML = `
    <h2 class="player-name">${name}</h2>
    <button data-id="button1" class="timer-button"></button>
    <button data-id="button2" class="timer-button"></button>
    <button class="lucidity"></button>
  `;

  playerContainer.appendChild(player);
});
