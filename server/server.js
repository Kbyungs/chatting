const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../front")));

let rooms = {};

function generateRoomId() {
  const min = 100000;
  const max = 999999;
  let roomNumber;
  do {
    roomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (roomNumber in rooms);
  return roomNumber.toString();
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/index.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/chatting.html"));
});

app.post("/create", (req, res) => {
  const roomId = generateRoomId();
  const { userName } = req.body;
  rooms[roomId] = { users: [userName] };
  console.log(`Room ${roomId} created by ${userName}`);
  res.json({ roomId, userName });
});

app.post("/join", (req, res) => {
  const { roomId, userName } = req.body;
  if (rooms[roomId]) {
    rooms[roomId].users.push(userName);
    console.log(`${userName} joined room ${roomId}`);
    res.json({ success: true, roomId, userName });
  } else {
    res.status(404).json({ success: false, message: "Room not found" });
  }
});

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("join room", ({ roomId, userName }) => {
    socket.join(roomId);
    socket.to(roomId).emit("user joined", userName);
    console.log(`${userName} joined room ${roomId}`);
  });

  socket.on("chat message", ({ roomId, userName, message }) => {
    io.to(roomId).emit("chat message", { userName, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
