const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const GroupServer = require("./models/GroupServer");
const WebSocket = require('ws');
const http = require('http');
const { stringify } = require('querystring');
require('dotenv').config();

const app = express();
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

//Import Routes
const authRoute = require('./routes/auth');
const createServerRoute = require('./routes/createServer.js');

//Mongoose -------------------------------------------
mongoose.connect('mongodb://localhost/budget-discord', {
  useUnifiedTopology: true,  
  useNewUrlParser: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));

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
      //look for the ws client's groupserver
      GroupServer.findOne({serverId: parsedMessage.serverId}, (err, groupServer) => {
        if (err){
          console.log("An error occured when trying to access the DB for a specific text server! (chatLog)");
        }
        //if a groupserver is found, send its chat log to the ws client
        else if (groupServer !== null){
          const message = {
            type: "chatLog",
            chatLog: groupServer.chatLog
          }
          ws.send(JSON.stringify(message));
        }
      });
    }
    //if the ws client is sending a new message
    else if (parsedMessage.type === "message"){
      //look for the ws client's groupserver
      GroupServer.findOne({serverId: parsedMessage.serverId}, (err, groupServer) => {
        if (err){
          console.log("An error occured when trying to access the DB for a specific text server! (message)");
        }
        //if the groupserver does not yet exist, then create it
        else if (groupServer === null){
          GroupServer.create({
            serverName: parsedMessage.serverName,
            serverId: parsedMessage.serverId,
            chatLog: [{
              content: parsedMessage.message.content,
              author: parsedMessage.message.author,
              id: parsedMessage.message.id,
              timestamp: parsedMessage.message.timestamp
            }]
          },
          (err, _groupServer) => {
            if (err){
              console.log("Unable to create and save a new text server to the DB!");
              console.log(err.response.status);
            }
            else{
              delete parsedMessage.message.notSent;
              //Echo this message to EVERY websocket clients with the same serverId
              for (let key in wsclients){
                if (wsclients[key].readyState === WebSocket.OPEN && wsclients[key].serverId === ws.serverId){
                  wsclients[key].send(JSON.stringify(parsedMessage));
                }
              }
          }});
        }
        //if the groupserver exists, then update its chat log with the ws client's new message
        else{
          const newMessage = {
            content: parsedMessage.message.content,
            author: parsedMessage.message.author,
            id: parsedMessage.message.id,
            timestamp: parsedMessage.message.timestamp
          };
          const newChatLog = [...groupServer.chatLog, newMessage];
          GroupServer.findOneAndUpdate({serverId: parsedMessage.serverId}, {chatLog: newChatLog}, {new: true}, (err, _groupServer) => {
            if (!err){
              delete parsedMessage.message.notSent;
              console.log(parsedMessage);
              //Echo this message to EVERY websocket clients with the same serverId
              for (let key in wsclients){
                if (wsclients[key].readyState === WebSocket.OPEN && wsclients[key].serverId === ws.serverId){
                  wsclients[key].send(JSON.stringify(parsedMessage));
                }
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
app.use('/api/createServer', createServerRoute);

app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => console.log('connected'));
