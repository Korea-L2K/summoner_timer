import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: 'https://summoner-timer.vercel.app' },
  connectionStateRecovery: {}
});

let timers = new Map();

io.on('connection', socket => {
  console.log('user connected');
  const now = Date.now();
  for (const [id, end] of timers) {
    if (now < end) {
      socket.emit('start-timer', { id, end });
    } else {
      delete timers[id];
    }
  }

  socket.on('start-timer', (data) => {
    console.log(data);
    timers[data.id] = data.end;
    io.emit('start-timer', data);
  });

  socket.on('reset-timer', (data) => {
    console.log(data);
    delete timers[data.id];
    io.emit('reset-timer', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`backend is on port ${PORT}`));
