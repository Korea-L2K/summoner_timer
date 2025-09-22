import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "https://summoner-timer.vercel.app" }
});

const rooms = {};

io.on("connection", socket => {
  console.log("user connected");

  socket.on("join", room => {
    socket.join(room);
    if (rooms[room]?.start) socket.emit("start", rooms[room].start);
  });

  socket.on("startTimer", room => {
    const start = Date.now();
    rooms[room] = { start };
    io.to(room).emit("start", start);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend on ${PORT}`));
