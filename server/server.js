const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 여기까지가 설정

let room_id = [];

function generateRoomId(room_id) {
  function getRandNum() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  let roomNumber;
  do {
    roomNumber = getRandNum();
  } while (room_id.includes(roomNumber));
  // console.log(roomNumber);
  return roomNumber;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/index.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/chatting.html"));
});

app.post("/create", (req, res) => {
  var roomNum = generateRoomId(room_id);
  // console.log(JSON.stringify(req.body));
  console.log(req.body);
  console.log(`${roomNum} 번 방 생성`);
  room_id.push(roomNum);
  res.json({ roomNum });
});

io.on("connection", (socket) => {
  console.log("user A connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
