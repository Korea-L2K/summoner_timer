// const lucidity = document.getElementById('lucidity');
const socket = window.socket;

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
  });

  socket.on('update-timer', (data) => {
    if (data.id === id) {
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
