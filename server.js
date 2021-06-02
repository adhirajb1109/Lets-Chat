const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server);
const bot = "Let 's Chat Bot";
const formatMessages = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
app.use(express.static(path.join(__dirname, "/public")));
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessages(bot, "Welcome To Let 's Chat !"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessages(bot, `${user.username} Has Joined The Chat`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessages(user.username, msg));
  });
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessages(bot, `${user.username} Has Left The Chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
server.listen(PORT, (req, res) => {
  console.log(`Server Initialised At Port ${PORT}`);
});
