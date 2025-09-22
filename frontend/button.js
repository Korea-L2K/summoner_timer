const lucidity = document.getElementById('lucidity');
const socket = io();

document.querySelectorAll('.timer-button').forEach(btn => {
  let timerInterval = null;
  let totalSeconds = 0;
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
      reset();
      return;
    }

    totalSeconds = 10;
    socket.emit('start-timer', { id, totalSeconds });
    updateText();

    timerInterval = setInterval(() => {
      totalSeconds--;
      if (totalSeconds <= 0) {
        reset();
      } else {
        updateText();
      }
    }, 1000);
  });

  socket.on('update-timer', (data) => {
    totalSeconds = data.totalSeconds;
    updateText();
  });
});
