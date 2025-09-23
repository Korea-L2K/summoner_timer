import { getHaste } from './player.js'

const socket = window.socket;
let spells = {
  top: { d: 'flash', f: 'teleport' },
  jg: { d: 'flash', f: 'smite' },
  mid: { d: 'flash', f: 'ignite' },
  adc: { d: 'flash', f: 'barrier' },
  sup: { d: 'flash', f: 'heal' },
};
let info = {
  flash: 300, teleport: 300, cleanse: 240, exhaust: 240, test: 7,
  ghost: 240, heal: 240, barrier: 180, ignite: 180, smite: 15,
}

// const lucidity = document.getElementById('lucidity');

document.querySelectorAll('.timer-button').forEach(btn => {
  const id = { player: btn.dataset.player, spell: btn.dataset.spell };
  let timerInterval = null;
  const reset = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.textContent = spells[id.player][id.spell];
  };
  reset();
  const updateText = (remaining) => {
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining) % 60;
    btn.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
  };

  btn.addEventListener('click', () => {
    if (timerInterval) {
      socket.emit('reset-timer', { id });
      return;
    }
    let base = info[spells[id.player][id.spell]], haste = getHaste(id.player);
    let cooldown = base * (100 / (100 + haste));
    socket.emit('start-timer', { id, end: Date.now() + cooldown * 1000 });
  });

  socket.on('start-timer', (data) => {
    if (data.id === id) {
      let remaining = (data.end - Date.now()) / 1000;
      updateText();
      timerInterval = setInterval(() => {
        remaining--;
        if (remaining < 1) {
          reset();
        } else {
          updateText(remaining);
        }
      }, 1000);
    }
  });
  socket.on('reset-timer', (data) => {
    if (data.id === id) {
      reset();
    }
  });
});
