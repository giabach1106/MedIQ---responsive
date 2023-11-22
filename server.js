//create an express app with socketio
var express = require("express");
var app = express();
var http = require("http").Server(app);
// // io needs to have allow EIO3 and cors
// console.log(admin.isAdmin);
var io = require("socket.io")(http, {
  transports: ["websocket", "polling"],
  allowEIO3: true,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//serve the index.html file
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/admin", function (req, res) {
  res.sendFile(__dirname + "/public/admin.html");
});

//listen for a connection
io.on("connection", function (socket) {
  if (socket.handshake.query.clientType == "web") {
    console.log("WEB Client connected:" + socket.id);
  } else {
    console.log("ESP client connected:" + socket.id);
  }
  //this is message from esp8266 client
  socket.on("message_suckhoe", function (msg) {
    console.log("received message_suckhoe");
    socket.broadcast.emit("message_suckhoe", msg);
  });
  socket.on("/trungtam", function (msg) {
    console.log("received /trungtam");
    socket.broadcast.emit("/trungtam", msg);
  });
  socket.on("message_huyetap", function (msg) {
    console.log("received message_huyetap");
    socket.broadcast.emit("message_huyetap", msg);
  });
});


//listen on port 3140
http.listen(process.env.PORT || 3140, function () {
  console.log("listening on *:3140");
});
