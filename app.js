const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

//Mongoose -------------------------------------------
mongoose.connect('mongodb://localhost/budget-discord', {
  useUnifiedTopology: true,  
  useNewUrlParser: true
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

//WebSocket ----------------------------------
//On WebSocket Server connection add an event listener
//Echo back data received from a client to every client
wss.on('connection', function connection(ws) {
  ws.on('message', (data) => {
    //If client is requesting for existing chat log,
    //Search the DB and send chat log if it exists
    if (data === "requesting chat log"){
      Message.find({}, (err, messages) => {
        if (err){
          console.log("An error occured when trying to access the DB for chat logs!");
        }
        else {
          if (messages.length > 0)
            ws.send(JSON.stringify(messages));
        }
      });
    }
    //Add new message to the DB
    //Echo back the message to the other clients
    else{
      //If message can't be parsed, then it
      //must be corrupted so stop
      let parsedData;
      try{
        parsedData = JSON.parse(data);
      } catch (e) {
        console.log("Message from ws client could not be parsed!", data);
        return;
      }

      Message.create({
        content: parsedData.content,
        author: parsedData.author,
        id: parsedData.id,
        timestamp: parsedData.timestamp
      }, (err, message)=>{
        if (err){
          console.log("Unable to save new message to the DB! ERROR occured...");
          console.log(err.response.status);
        }
        else{
          console.log("New message added: \n" + message);
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN){
              //if (ws === client)
              client.send(data);
            }
          });
        }
      });
    }
  });
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
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => console.log('Express app listening on port 3000'));