const socket = io('https://summoner-timer.onrender.com');

socket.on('connect', () => {
  console.log('test log');
});
