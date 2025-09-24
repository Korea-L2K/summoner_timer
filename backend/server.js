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
let spells = new Map();

function key1(obj) { return `${obj.player}:${obj.spell}`; }
function key2(obj) { return `${obj.player}:${obj.source}`; }

io.on('connection', socket => {
  console.log('user connected');
  let update = null;

  for (const [, val] of spells) {
    socket.emit('set-spell', val);
  }
  const init = Date.now();
  for (const [key, val] of timers) {
    if (init < val.end) {
      socket.emit('start-timer', val);
    } else {
      timers.delete(key);
    }
  }
  for (const [, val] of haste) {
    socket.emit('toggle-on', val);
  }

  socket.on('start-timer', (data) => {
    timers.set(key1(data.id), data);
    if (!update) {
      update = setInterval(() => {
        const now = Date.now();
        if (timers.size === 0) {
          clearInterval(update);
          update = null;
        }
        for (const [key, val] of timers) {
          if (now < val.end) {
            io.emit('start-timer', val);
          } else {
            timers.delete(key);
          }
        }
      }, 30000);
    }
    io.emit('start-timer', data);
  });
  socket.on('reset-timer', (data) => {
    timers.delete(key1(data.id));
    io.emit('reset-timer', data);
  });
  socket.on('set-spell', (data) => {
    console.log(data);
    spells.set(key1(data.id), data);
    timers.delete(key1(data.id));
    io.emit('set-spell', data);
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
