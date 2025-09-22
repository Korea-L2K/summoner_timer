import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: 'https://summoner-timer.vercel.app' }
});

io.on('connection', socket => {
  console.log('user connected');

  socket.on('start-timer', (data) => {
    console.log(data.id);
    console.log(data.totalSeconds);
    io.emit('update-timer', {data});
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend on ${PORT}`));
