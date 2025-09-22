// const lucidity = document.getElementById('lucidity');
const socket = window.socket;

document.querySelectorAll('.timer-button').forEach(btn => {
  let timerInterval = null;
  let base = 10, haste = 0;
  const id = btn.dataset.id;
  const reset = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.textContent = 'Flash';
  };
  const updateText = () => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    btn.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
  };

  btn.addEventListener('click', () => {
    if (timerInterval) {
      socket.emit('reset-timer', { id });
      return;
    }

    totalSeconds = base * (100 / (100 + haste));
    socket.emit('start-timer', { id, totalSeconds });
  });

  socket.on('reset-timer', (data) => {
    if (data.id === id) {
      reset();
    }
  });
  socket.on('start-timer', (data) => {
    if (data.id === id) {
      totalSeconds = data.totalSeconds;
      updateText();
      timerInterval = setInterval(() => {
        totalSeconds--;
        if (totalSeconds <= 0) {
          reset();
        } else {
          updateText();
        }
      }, 1000);
    }
  });
});
