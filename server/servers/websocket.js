// package imports
const WebSocket = require('ws');
const http = require('http');

// project imports
const app = require('./express');
const TextChannel = require('../db/models/TextChannel');
const { generateUniqueSessionId } = require('../lib/utils/groupServerUtils');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const wsclients = {};

// On WebSocket Server connection add an event listener
// Echo back data received from a client to every client
wss.on('connection', (ws) => {
  // For every new websocket client, give it a unique session id
  // to help identify it
  const sessionId = generateUniqueSessionId();
  const wsclient = ws;
  wsclient.sessionId = sessionId;
  wsclients[sessionId] = wsclient;

  ws.on('message', (msgStr) => {
    // if the message can't be parsed, then skip it as all ws clients'
    // messages should be parsable
    let messageObj;
    try {
      messageObj = JSON.parse(msgStr);
    } catch {
      console.log('Message from ws client could not be parsed!', msgStr);
      return;
    }

    wsclient.serverId = messageObj.serverId;
    wsclient.textChannelId = messageObj.textChannelId;

    // if the ws client is sending a new message
    if (messageObj.type === 'message') {
      const newMessage = {
        content: messageObj.message.content,
        author: messageObj.message.author,
        index: messageObj.message.index,
        timestamp: messageObj.message.timestamp,
      };
      // Find and update the text channel with the new message
      TextChannel.findByIdAndUpdate(
        messageObj.textChannelId,
        { $push: { chat_log: newMessage } },
        { new: true },
      ).then((textChannel) => {
        if (textChannel !== null) {
          // Echo this message to EVERY websocket clients with the same serverId
          const data = {
            type: 'message',
            message: newMessage,
            textChannelId: messageObj.textChannelId,
          };
          Object.keys(wsclients).forEach((key) => {
            console.log(`${wsclients[key].readyState} === ${WebSocket.OPEN} && ${wsclients[key].serverId} === ${ws.serverId} && ${wsclients[key].sessionId} !== ${ws.sessionId}`);
            if (wsclients[key].readyState === WebSocket.OPEN
              && wsclients[key].serverId === ws.serverId) {
              if (wsclients[key].sessionId !== ws.sessionId) {
                wsclients[key].send(JSON.stringify(data));
              } else {
                const duplicate = {
                  type: 'duplicateMessage',
                  message: newMessage,
                  textChannelId: messageObj.textChannelId,
                };
                wsclients[key].send(JSON.stringify(duplicate));
              }
            }
          });
        } else console.log('Failed to update text channel', messageObj.textChannelId, 'with a new message.');
      }).catch((err) => {
        console.log('An error occured when accessing the DB for text channels');
        console.error(err);
      });
    }
  });

  ws.on('close', () => {
    delete wsclients[wsclient.sessionId];
    console.log('DISCONNECTED Current number of ws clients connected:', Object.keys(wsclients).length);
  });

  console.log('NEW CONNECTION Current number of ws clients connected:', Object.keys(wsclients).length);
});

module.exports = server;
