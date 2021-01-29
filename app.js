const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const GroupServer = require("./models/GroupServer");
const TextChannel = require("./models/TextChannel");
const WebSocket = require('ws');
const http = require('http');
const { stringify } = require('querystring');
require('dotenv').config();

const app = express();
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

//Import Routes
const authRoute = require('./routes/auth');
const friendsRoute = require('./routes/friends');
const groupServerRoute = require('./routes/groupServer.js');

//Mongoose -------------------------------------------
mongoose.connect('mongodb://localhost/budget-discord', {
  useUnifiedTopology: true,  
  useNewUrlParser: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));

//WebSocket ----------------------------------
let wsclients = {};

const generateUniqueSessionId = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};
//On WebSocket Server connection add an event listener
//Echo back data received from a client to every client
wss.on('connection', function connection(ws, incoming) {
  //For every new websocket client, give it a unique session id
  //to help identify it
  const sessionId = generateUniqueSessionId();
  ws.sessionId = sessionId;
  wsclients[sessionId] = ws;

  ws.on('message', (message) => {
    //if the message can't be parsed, then skip it as all ws clients'
    //messages should be parsable
    let parsedMessage;
    try{
      parsedMessage = JSON.parse(message);
    } catch (e) {
      console.log("Message from ws client could not be parsed!", message);
      return;
    }
  
    //set the websocket client's serverId to the serverId of its message
    ws.serverId = parsedMessage.serverId;

    //if the ws client is requesting for a chat log
    if (parsedMessage.type === "chatLog"){
      //look for the ws client's text channel
      TextChannel.findById(parsedMessage.textChannelId, (err, textChannel) => {
        if (err){
          console.log("An error occured when trying to access the DB for a specific text channel! (chatLog)");
        }
        //if a text channel is found, send its chat log to the ws client
        else if (textChannel !== null){
          const message = {
            type: "chatLog",
            chatLog: textChannel.chat_log
          }
          ws.send(JSON.stringify(message));
        }
      });
    }
    //if the ws client is sending a new message
    else if (parsedMessage.type === "message"){
      const newMessage = {
        content: parsedMessage.message.content,
        author: parsedMessage.message.author,
        index: parsedMessage.message.index,
        timestamp: parsedMessage.message.timestamp
      };
      //Find and update the text channel with the new message
      TextChannel.findByIdAndUpdate(parsedMessage.textChannelId, {$push: {chat_log: newMessage}}, 
      {new: true},
      (err, textChannel) => {
        if (err) console.log("An error occured when trying to access and update the DB for a specific text channel! (message)");
        else if (textChannel !== null){
          //Echo this message to EVERY websocket clients with the same serverId
          const data = {
            type: "message",
            message: newMessage,
            textChannelId: parsedMessage.textChannelId
          }
          for (let key in wsclients){
            if (wsclients[key].readyState === WebSocket.OPEN && wsclients[key].serverId === ws.serverId){
              wsclients[key].send(JSON.stringify(data));
            }
          }
        }
        else console.log("Failed to update text channel", parsedMessage.textChannelId, "with a new message.");
      });
    }
    else if (parsedMessage.type === "textChannels"){
      TextChannel.find({group_server_id: parsedMessage.groupServerId}, (err, textChannels) => {
        if (err) console.log("An error occured when trying to access the DB for text channels!");
        else if (textChannels !== null && textChannels.length > 0){
          let textChannels_ = [];
          textChannels.forEach(textChannel => {
            const textChannel_ = {
              id: textChannel._id,
              name: textChannel.name,
              date: textChannel.date,
              chatLog: textChannel.chat_log
            };
            textChannels_.push(textChannel_);
          });
          const message = {
            textChannels: textChannels_
          }
          ws.send(JSON.stringify(message));
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
app.use('/api/friends', friendsRoute);
app.use('/api/groupServer', groupServerRoute);

app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => console.log('connected'));
