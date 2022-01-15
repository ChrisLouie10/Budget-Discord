const WebSocket = require('ws');
const http = require('http');
const app = require('./express');
const { findServersByUserId } = require('../db/dao/groupServerDao');
const { findTextChannelById } = require('../db/dao/textChannelDao');
const { addMessageToChatLog } = require('../db/dao/chatLogDao');
const { generateUniqueSessionId } = require('../lib/utils/groupServerUtils');
const { parseCookies } = require('../lib/utils/cookieUtils');
const { getUserWithToken } = require('../lib/utils/tokenUtils');
const { messageValidation } = require('../lib/validation/websocketValidation');

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const clients = {};
const groupServerIds = {};

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

wss.on('connection', async (ws, req) => {
  // For every new client, give it a unique session id to help identify it later
  const sessionId = `${req.user._id}-${generateUniqueSessionId()}`;
  clients[sessionId] = ws;
  console.log('NEW CONNECTION Current number of clients:', Object.keys(clients).length);

  // get all of clients' groupservers
  const rawGroupServers = await findServersByUserId(req.user._id);
  rawGroupServers.forEach((rawGroupServer) => {
    const { _id } = rawGroupServer;
    if (groupServerIds[_id]) {
      groupServerIds[_id].push(sessionId);
    } else groupServerIds[_id] = [sessionId];
  });

  ws.on('message', async (msg) => {
    // if the msg can't be parsed, then skip it as all clients'
    // messages should be parsable
    let result;
    try {
      result = JSON.parse(msg);
    } catch {
      console.log('Message from client could not be parsed!', msg);
      return;
    }

    // if the ws client is sending a new message
    if (result.method === 'message') {
      // validate message
      const { error } = messageValidation(result.message);
      if (error) return;

      const message = {
        content: result.message.content,
        author: result.message.author,
        timestamp: result.message.timestamp,
      };
      try {
        // Find and update the text channel's chat log
        const rawTextChannel = await findTextChannelById(result.textChannelId);
        const rawChatLog = await addMessageToChatLog(rawTextChannel.chat_log, message);
        if (rawChatLog) {
          // Send message to every client that are on the same group server
          const data = {
            type: 'message',
            message,
            textChannelId: result.textChannelId,
          };
          groupServerIds[result.groupServerId].forEach((id) => {
            if (clients[id] && clients[id].readyState === WebSocket.OPEN) {
              console.log(result.groupServerId, id);
              clients[id].send(JSON.stringify(data));
            }
          });
        } else {
          console.log('Failed to update text channel', result.textChannelId, 'with a new message.');
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  ws.on('close', () => {
    delete clients[sessionId];
    // remove sessionId from groupServerIds dictionary
    rawGroupServers.forEach((rawGroupServer) => {
      const { _id } = rawGroupServer;
      if (groupServerIds[_id]) {
        const index = groupServerIds[_id].indexOf(sessionId);
        if (index >= 0) groupServerIds[_id].splice(index, 1);
      }
    });
    console.log('DISCONNECTED Current number of clients:', Object.keys(clients).length);
  });
});

module.exports = server;
