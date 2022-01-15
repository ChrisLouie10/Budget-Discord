const WebSocket = require('ws');
const http = require('http');
const app = require('./express');
const { findTextChannelById } = require('../db/dao/textChannelDao');
const { addMessageToChatLog } = require('../db/dao/chatLogDao');
const { generateUniqueSessionId } = require('../lib/utils/groupServerUtils');
const { parseCookies } = require('../lib/utils/cookieUtils');
const { getUserWithToken } = require('../lib/utils/tokenUtils');

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const clients = {};

// verify connection is authenticated before connecting to websocket
server.on('upgrade', async (req, socket, head) => {
  const cookies = parseCookies(req);
  const { token } = cookies;

  try {
    const user = await getUserWithToken(token);
    if (!token || !user) { // no token or user means unauthorized
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    req.user = user;
  } catch (e) {
    console.error(e);
    socket.write('HTTP/1.1 500\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws, req) => {
  // For every new client, give it a unique session id to help identify it later
  const sessionId = `${req.user._id}-${generateUniqueSessionId()}`;
  const client = ws;
  client.sessionId = sessionId;
  clients[sessionId] = client;
  console.log('NEW CONNECTION Current number of ws clients connected:', Object.keys(clients).length);

  ws.on('message', async (msgStr) => {
    // if the message can't be parsed, then skip it as all clients'
    // messages should be parsable
    let messageObj;
    try {
      messageObj = JSON.parse(msgStr);
    } catch {
      console.log('Message from client could not be parsed!', msgStr);
      return;
    }

    client.serverId = messageObj.serverId;
    client.textChannelId = messageObj.textChannelId;

    // if the ws client is sending a new message
    if (messageObj.type === 'message') {
      const newMessage = {
        content: messageObj.message.content,
        author: messageObj.message.author,
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
          Object.keys(clients).forEach((key) => {
            if (clients[key].readyState === WebSocket.OPEN
              && clients[key].serverId === ws.serverId) {
              if (clients[key].sessionId !== ws.sessionId) {
                clients[key].send(JSON.stringify(data));
              } else {
                const duplicate = {
                  type: 'duplicateMessage',
                  message: newMessage,
                  textChannelId: messageObj.textChannelId,
                };
                clients[key].send(JSON.stringify(duplicate));
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
    delete clients[client.sessionId];
    console.log('DISCONNECTED Current number of ws clients connected:', Object.keys(clients).length);
  });
});

module.exports = server;
