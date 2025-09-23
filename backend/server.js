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
let haste = new Map();

function key1(obj) { return `${obj.player}:${obj.spell}`; }
function key2(obj) { return `${obj.player}:${obj.source}`; }

io.on('connection', socket => {
  console.log('user connected');
  const now = Date.now();
  for (const [key, val] of timers) {
    if (now < val.end) {
      socket.emit('start-timer', val);
    } else {
      delete timers[key];
    }
  }
  for (const [_, val] of haste) {
    socket.emit('toggle-on', val);
  }

  socket.on('start-timer', (data) => {
    // console.log(data);
    timers.set(key1(data.id), data);
    io.emit('start-timer', data);
  });
  socket.on('reset-timer', (data) => {
    // console.log(data);
    delete timers[key1(data.id)];
    io.emit('reset-timer', data);
  });

  socket.on('toggle-on', (data) => {
    console.log(data + 'on');
    haste.set(key2(data.id), data);
    io.emit('toggle-on', data);
  });
  socket.on('toggle-off', (data) => {
    console.log(data + 'off');
    haste.delete(key2(data.id));
    io.emit('toggle-off', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`backend is on port ${PORT}`));
