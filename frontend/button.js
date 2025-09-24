const socket = window.socket;
let info = {
  flash: 300, teleport: 300, cleanse: 240, exhaust: 240, test: 7,
  ghost: 240, heal: 240, barrier: 180, ignite: 180, smite: 15,
}
let spells = {
  top: { d: 'flash', f: 'teleport' },
  jg: { d: 'flash', f: 'smite' },
  mid: { d: 'flash', f: 'ignite' },
  adc: { d: 'flash', f: 'barrier' },
  sup: { d: 'flash', f: 'heal' },
};
let haste = {
  cosmic: { top: false, jg: true, mid: false, adc: false, sup: true },
  lucidity: { top: false, jg: false, mid: false, adc: false, sup: false }
};
function getHaste(player) {
  return (haste.cosmic[player] || 0) * 18 + (haste.lucidity[player] || 0) * 10;
}

document.querySelectorAll('.timer-button').forEach(btn => {
  const id = { player: btn.dataset.player, spell: btn.dataset.spell };
  btn.style.setProperty('--bg-image', `url("images/${spells[id.player][id.spell]}.png")`);
  let timerInterval = null;
  const reset = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.querySelector('.text').textContent = ""; //spells[id.player][id.spell];
    btn.classList.remove('dimmed');
  };
  const updateText = (remaining) => {
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining) % 60;
    btn.querySelector('.text').textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    btn.classList.add('dimmed');
  };
  reset();

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
    if (data.id.player === id.player && data.id.spell === id.spell) {
      clearInterval(timerInterval);
      let remaining = (data.end - Date.now()) / 1000;
      updateText(remaining);
      timerInterval = setInterval(() => {
        remaining--;
        if (remaining < 1) {
          reset();
        } else {
          console.log(data.end - Date.now() - 1000 * remaining);
          updateText(remaining);
        }
      }, 1000);
    }
  });
  socket.on('reset-timer', (data) => {
    if (data.id.player === id.player && data.id.spell === id.spell) {
      reset();
    }
  });
  socket.on('set-spell', (data) => {
    if (data.id.player === id.player && data.id.spell === id.spell) {
      spells[id.player][id.spell] = data.spell;
      reset();
    }
  });
});

document.querySelectorAll('.toggle').forEach(btn => {
  const id = { player: btn.dataset.player, source: btn.dataset.source };
  btn.style.backgroundImage = `url('images/${id.source}.png')`;
  if (!haste[id.source][id.player]) btn.classList.add('dimmed');
  btn.addEventListener('click', () => {
    if (haste[id.source][id.player]) {
      socket.emit('toggle-off', { id });
    } else {
      socket.emit('toggle-on', { id });
    }
  });

  socket.on('toggle-off', (data) => {
    if (data.id.player === id.player && data.id.source === id.source) {
      haste[id.source][id.player] = false;
      btn.classList.add('dimmed');
    }
  });
  socket.on('toggle-on', (data) => {
    if (data.id.player === id.player && data.id.source === id.source) {
      haste[id.source][id.player] = true;
      btn.classList.remove('dimmed');
    }
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.spell-menu')) {
    console.log('close');
    document.querySelectorAll('.spell-menu:not(.hidden)').forEach(menu => menu.classList.add('hidden'));
  }
  if (e.target.classList.contains('edit-button')) {
    console.log('edit');
    e.stopPropagation();
    const menu = e.target.nextElementSibling;
    menu.classList.remove('hidden');
    const rect = menu.getBoundingClientRect();
    if (rect.top < 0) {
      menu.style.bottom = 'auto';
      menu.style.top = '0';
    }
  }
  else if (e.target.classList.contains('spell-option')) {
    console.log('spell');
    e.stopPropagation();
    const spell = e.target.dataset.spell;
    const timer = e.target.closest('.timer-button');
    const id = { player: timer.dataset.player, spell: timer.dataset.spell };
    if (spells[id.player][id.spell] != spell) {
      socket.emit('set-spell', { id, spell });
    }
    e.target.closest('.spell-menu').classList.add('hidden');
  }
});

