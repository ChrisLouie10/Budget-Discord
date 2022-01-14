// package imports
const WebSocket = require('ws');
const http = require('http');

// project imports
const app = require('./express');
const { findTextChannelById } = require('../db/dao/textChannelDao');
const { addMessageToChatLog } = require('../db/dao/chatLogDao');
const { generateUniqueSessionId } = require('../lib/utils/groupServerUtils');
const { parseCookies } = require('../lib/utils/cookieUtils');
const { getUserWithToken } = require('../lib/utils/tokenUtils');

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const wsclients = {};

// verify connection is authenticated before connecting to websocket
server.on('upgrade', async (req, socket, head) => {
  const cookies = parseCookies(req);
  const { token } = cookies;

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  const user = await getUserWithToken(token);
  req.user = user;

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

// On WebSocket Server connection add an event listener
// Echo back data received from a client to every client
wss.on('connection', (ws, req) => {
  // For every new websocket client, give it a unique session id
  // to help identify it
  const sessionId = generateUniqueSessionId();
  const wsclient = ws;
  wsclient.sessionId = sessionId;
  wsclients[sessionId] = wsclient;

  console.log(req.user);

  ws.on('message', async (msgStr) => {
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
      try {
        // Find and update the text channel's chat log
        const rawTextChannel = await findTextChannelById(messageObj.textChannelId);
        const rawChatLog = await addMessageToChatLog(rawTextChannel.chat_log, newMessage);
        if (rawChatLog) {
          // Echo this message to EVERY websocket clients with the same serverId
          const data = {
            type: 'message',
            message: newMessage,
            textChannelId: messageObj.textChannelId,
          };
          Object.keys(wsclients).forEach((key) => {
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
      } catch (e) {
        console.error(e);
      }
    }
  });

  ws.on('close', () => {
    delete wsclients[wsclient.sessionId];
    console.log('DISCONNECTED Current number of ws clients connected:', Object.keys(wsclients).length);
  });

  console.log('NEW CONNECTION Current number of ws clients connected:', Object.keys(wsclients).length);
});

module.exports = server;
