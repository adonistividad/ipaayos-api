const io = require("socket.io")(5002, {
  cors: {
    origin: [
      "http://localhost",
      "capacitor://localhost",
      "http://localhost:3000",
      "http://localhost:3002",
      "https://app.ipaayos.tividad.com",
      "https://pro.ipaayos.tividad.com",
      "https://admin.socket.io",
    ],
  },
});
io.on("connection", (socket: any) => {
  console.log(socket.id);
  socket.on("send-message", (message: any, room: any) => {
    console.log(room, message);
    if (room === "") {
      socket.broadcast.emit("receive-message", message);
    } else {
      socket.to(room).emit("receive-message", message);
    }
  });
  socket.on("join-room", (room: any, cb: any) => {
    socket.join(room);
    cb(`Joined room: ${room}`);
  });
});
