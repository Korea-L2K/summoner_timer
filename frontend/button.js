// const lucidity = document.getElementById('lucidity');
const socket = window.socket;

document.querySelectorAll('.timer-button').forEach(btn => {
  const id = btn.dataset.id;
  const player = btn.dataset.player;
  let timerInterval = null;
  let base = 10, haste = 10;
  let remaining = base;
  const reset = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.textContent = player || 'Flash'; //fix later
  };
  const updateText = () => {
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    btn.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
  };

  btn.addEventListener('click', () => {
    if (timerInterval) {
      socket.emit('reset-timer', { id });
      return;
    }

    remaining = base * (100 / (100 + haste));
    socket.emit('start-timer', { id, end: Date.now() + remaining * 1000 });
  });

  socket.on('start-timer', (data) => {
    if (data.id === id) {
      remaining = (data.end - Date.now()) / 1000;
      updateText();
      timerInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          reset();
        } else {
          updateText();
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
