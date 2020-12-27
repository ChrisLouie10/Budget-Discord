const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

//WebSocket ----------------------------------
//On WebSocket Server connection add an event listener
//Echo back data received from a client to every other client
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
      wss.clients.forEach(function each(client) {
        if(ws != client && client.readyState === WebSocket.OPEN)
          client.send(data);
      });
  });
});

server.listen(1000, () => console.log("WebSocket server listening on port 1000"));
//-------------------------------------------

let chatLog = [];

mongoose.connect('mongodb://localhost/budget-discord', {
  useUnifiedTopology: true,  
  useNewUrlParser: true
})
.then(() => {
  Message.find({}, (err, messages) => {
    if (err){
      console.log("An error occured when trying to access the DB for chat logs!");
    }
    else if (messages.length > 0){
      for (let i = 0; i < messages.length; i++){
        chatLog.push(messages[i]);
      }
    }
  });
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));

const messageSchema = new mongoose.Schema({
  content: String,
  author: String,
  id: Number,
  timestamp: String
});

const Message = mongoose.model("Message", messageSchema);

//Use cors to allow cross origin resource sharing
app.use(
  cors({
    origin: 'http://localhost:5000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send("Chatlog:\n" + chatLog);
});

app.get("/getChatLogs", (req, res) => {
  res.send(chatLog);
});

app.post('/', function(req, res) {
  const message = {
    content: req.body.content,
    author: req.body.author,
    id: req.body.id,
    timestamp: req.body.timestamp
  };

  Message.create({
    content: req.body.content,
    author: req.body.author,
    id: req.body.id,
    timestamp: req.body.timestamp
  }, (err, message)=>{
    if (err){
      console.log("Unable to save new message to the DB! ERROR occured...");
      console.log(err.response.status);
    }
    else{
      console.log("New message added: \n" + message);
      chatLog.push(message);
    }
  });
});

app.listen(3000, () => console.log('Express app listening on port 3000'));