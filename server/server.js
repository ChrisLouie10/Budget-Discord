require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');
const TextChannel = require('./models/TextChannel');
const app = require('./servers/app');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// const wssPort = process.env.wssPort || 1000;
const serverPort = process.env.PORT || 5000;

const wsclients = {};

const generateUniqueSessionId = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return `${s4() + s4()}-${s4()}`;
};
// On WebSocket Server connection add an event listener
// Echo back data received from a client to every client
wss.on('connection', (ws) => {
  const newWs = ws;
  // For every new websocket client, give it a unique session id
  // to help identify it
  const sessionId = generateUniqueSessionId();
  newWs.sessionId = sessionId;
  console.log(`CONNECTED: ${ws.sessionId}`);
  console.log(`CLIENTS: ${wsclients}`);
  wsclients[sessionId] = ws;

  ws.on('message', (message) => {
    // if the message can't be parsed, then skip it as all ws clients'
    // messages should be parsable
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (e) {
      console.log('Message from ws client could not be parsed!', message);
      return;
    }

    // set the websocket client's serverId and textChannelId to the serverId
    // and textChannelId of its message
    newWs.serverId = parsedMessage.serverId;
    newWs.textChannelId = parsedMessage.textChannelId;

    // if the ws client is requesting for a chat log
    if (parsedMessage.type === 'chatLog') {
      // look for the ws client's text channel
      TextChannel.findById(parsedMessage.textChannelId, (err, textChannel) => {
        if (err) console.log('An error occured when trying to access the DB for a specific text channel! (chatLog)');
        // if a text channel is found, send its chat log to the ws client
        else if (textChannel !== null) {
          const msg = {
            type: 'chatLog',
            chatLog: textChannel.chat_log,
          };
          ws.send(JSON.stringify(msg));
        }
      });
      // eslint-disable-next-line
    }
    // if the ws client is sending a new message
    else if (parsedMessage.type === 'message') {
      const newMessage = {
        content: parsedMessage.message.content,
        author: parsedMessage.message.author,
        index: parsedMessage.message.index,
        timestamp: parsedMessage.message.timestamp,
      };
      // Find and update the text channel with the new message
      TextChannel.findByIdAndUpdate(
        parsedMessage.textChannelId,
        { $push: { chat_log: newMessage } },
        { new: true },
        (err, textChannel) => {
          if (err) console.log('An error occured when trying to access and update the DB for a specific text channel! (message)');
          else if (textChannel !== null) {
          // Echo this message to EVERY websocket clients with the same serverId
            const data = {
              type: 'message',
              message: newMessage,
              textChannelId: parsedMessage.textChannelId,
            };
            Object.keys(wsclients).forEach((key) => {
              if (wsclients[key].readyState === WebSocket.OPEN
                && wsclients[key].serverId === ws.serverId) {
                console.log(`${wsclients[key].sessionId} !== ${ws.sessionId}`);
                if (wsclients[key].sessionId !== ws.sessionId) {
                  wsclients[key].send(JSON.stringify(data));
                } else {
                  const duplicate = {
                    type: 'duplicateMessage',
                    message: newMessage,
                    textChannelId: parsedMessage.textChannelId,
                  };
                  wsclients[key].send(JSON.stringify(duplicate));
                }
              }
            });
          } else console.log('Failed to update text channel', parsedMessage.textChannelId, 'with a new message.');
        },
      );
    }
  });

  ws.on('close', () => {
    delete wsclients[ws.sessionId];
    console.log('ws deleted:', ws.sessionId);
    console.log('Current number of ws clients connected:', Object.keys(wsclients).length);
  });

  console.log('Current number of ws clients connected:', Object.keys(wsclients).length);
});

server.listen(serverPort, () => console.log(`Server listening on port ${serverPort}`));
// app.listen(serverPort, () => console.log('Server listening on port ' + serverPort));
