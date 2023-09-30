//create an express app with socketio
var express = require("express");
var app = express();
var http = require("http").Server(app);
//io needs to have allow EIO3 and cors
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

let obj = {
  name: "Bach",
  age: 17,
  school: "ams"
}

function isAdmin(req, res,next) {
  console.log(req.query.admin)
  if (req.query.admin == "true") {
    next()
  } else {
    res.status(403).json("not allow")
  }
}

app.get("/api/get-name",isAdmin, (req, res) => {
  res.json(obj)
})

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
  socket.on("message_huyetap", function (msg) {
    console.log("received message_huyetap");
    socket.broadcast.emit("message_huyetap", msg);
  });
});


//listen on port 4000
http.listen(process.env.PORT || 4000, function () {
  console.log("listening on *:4000");
});
