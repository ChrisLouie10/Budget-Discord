const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message');
require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');
const { stringify } = require('querystring');

const app = express();
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

//Import Routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/samplePage');

let chatLog = [];

//Mongoose -------------------------------------------
mongoose.connect('mongodb://localhost/budget-discord', {
  useUnifiedTopology: true,  
  useNewUrlParser: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));


const textServerSchema = new mongoose.Schema({
  serverName: String,
  serverId: String,
  chatLog: [{
    content: String,
    author: String,
    id: Number,
    timestamp: String
  }]
});

const TextServer = mongoose.model("TextServer", textServerSchema); 

const generateUniqueSessionId = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

//WebSocket ----------------------------------
let wsclients = {};
//On WebSocket Server connection add an event listener
//Echo back data received from a client to every client
wss.on('connection', function connection(ws, incoming) {
  //For every new websocket client, give it a unique session id
  //to help identify it
  const sessionId = generateUniqueSessionId();
  ws.sessionId = sessionId;
  wsclients[sessionId] = ws;

  ws.on('message', (message) => {
    let parsedMessage;
    try{
      parsedMessage = JSON.parse(message);
    } catch (e) {
      console.log("Message from ws client could not be parsed!", message);
      return;
    }

    //set the websocket client's serverId to the serverId of its message
    ws.serverId = parsedMessage.serverId;

    if (parsedMessage.type === "chatLog"){
      TextServer.findOne({serverId: parsedMessage.serverId}, (err, textServer) => {
        if (err){
          console.log("An error occured when trying to access the DB for a specific text server! (chatLog)");
        }
        else if (textServer !== null){
          const message = {
            type: "chatLog",
            chatLog: textServer.chatLog
          }
          ws.send(JSON.stringify(message));
        }
      });
    }
    else if (parsedMessage.type === "message"){
      TextServer.findOne({serverId: parsedMessage.serverId}, (err, textServer) => {
        if (err){
          console.log("An error occured when trying to access the DB for a specific text server! (message)");
        }
        else if (textServer === null){
          TextServer.create({
            serverName: parsedMessage.serverName,
            serverId: parsedMessage.serverId,
            chatLog: [{
              content: parsedMessage.message.content,
              author: parsedMessage.message.author,
              id: parsedMessage.message.id,
              timestamp: parsedMessage.message.timestamp
            }]
          },
          (err, _textServer) => {
            if (err){
              console.log("Unable to create and save a new text server to the DB!");
              console.log(err.response.status);
            }
            else
              console.log("New text server added, serverId:" + _textServer.serverId);
              //Echo this message to every other websocket clients with the same serverId
              for (let key in wsclients){
                if (key !== ws.sessionId && wsclients[key].readyState === WebSocket.OPEN && wsclients[key].serverId === ws.serverId)
                 wsclients[key].send(message);
              }
          });
        }
        else{
          const newMessage = {
            content: parsedMessage.message.content,
            author: parsedMessage.message.author,
            id: parsedMessage.message.id,
            timestamp: parsedMessage.message.timestamp
          };
          const newChatLog = [...textServer.chatLog, newMessage];
          TextServer.findOneAndUpdate({serverId: parsedMessage.serverId}, {chatLog: newChatLog}, {new: true}, (err, _textServer) => {
            if (!err){
              console.log("New message added to text server " + parsedMessage.serverId + ":\n", newMessage);
              //Echo this message to every other websocket clients with the same serverId
              for (let key in wsclients){
                if (key !== ws.sessionId && wsclients[key].readyState === WebSocket.OPEN && wsclients[key].serverId === ws.serverId)
                 wsclients[key].send(message);
              }
            }
            else{
              console.log("Failed to update text server " + parsedMessage.serverId + " with a new message\n", err.response.status);
            }
          });
        }
      });
    }
  });

  ws.on('close',() => {
    delete wsclients[ws.sessionId];
    console.log("ws deleted:", ws.sessionId);
    console.log("Current number of ws clients connected:", Object.keys(wsclients).length);
  });

  console.log("Current number of ws clients connected:", Object.keys(wsclients).length);
});

server.listen(1000, () => console.log("WebSocket server listening on port 1000"));

//app -------------------------------------------
//Use cors to allow cross origin resource sharing
app.use(
  cors({
    origin: 'http://localhost:5000',
    credentials: true,
  })
);
app.use(express.json());

//Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);

app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => console.log('connected'));
