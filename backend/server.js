import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "https://summoner_timer.vercel.app" } // update later
});

const rooms = {};

io.on("connection", socket => {
  socket.on("join", room => {
    socket.join(room);
    if (rooms[room]?.start) socket.emit("start", rooms[room].start);
  });

  socket.on("startTimer", room => {
    const start = Date.now();
    rooms[room] = { start };
    io.to(room).emit("start", start);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Backend on ${PORT}`));
