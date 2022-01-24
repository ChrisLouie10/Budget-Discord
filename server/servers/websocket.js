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
const { clients, userIds, serverIds } = require('../lib/websocket/state');
const { findPrivateChatById, findPrivateChatsByUserId } = require('../db/dao/privateChatDao');

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

function heartbeat() {
  this.isAlive = true;
}

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
  clients[sessionId].isAlive = true;
  console.log('NEW CONNECTION Current number of clients:', Object.keys(clients).length);

  // add new client id to userIds dict
  if (userIds[req.user._id]) {
    userIds[req.user._id].push(sessionId);
  } else userIds[req.user._id] = [sessionId];

  // get all of clients' groupservers & populate serverIds dict
  let rawGroupServers = await findServersByUserId(req.user._id);
  rawGroupServers.forEach((rawGroupServer) => {
    const { _id } = rawGroupServer;
    if (serverIds[_id]) {
      serverIds[_id].push(sessionId);
    } else serverIds[_id] = [sessionId];
  });

  // get all of clients' private chat "servers" & populate serverIds dict
  let rawPrivateChats = await findPrivateChatsByUserId(req.user._id);
  rawPrivateChats.forEach((rawPrivateChat) => {
    const { _id } = rawPrivateChat;
    if (serverIds[_id]) {
      serverIds[_id].push(sessionId);
    } else serverIds[_id] = [sessionId];
  });

  ws.on('pong', heartbeat);

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
        let serverId;
        let channelId;
        let rawChannel;
        if (result.textChannelId) {
          serverId = result.groupServerId;
          channelId = result.textChannelId;
          rawChannel = await findTextChannelById(channelId);
        } else if (result.privateChatId) {
          serverId = result.privateChatId;
          channelId = result.privateChatId;
          rawChannel = await findPrivateChatById(result.privateChatId);
        }

        const rawChatLog = await addMessageToChatLog(rawChannel.chat_log, message);
        if (rawChatLog) {
        // Send message to every client that are on the same server
          const data = {
            method: 'message',
            message,
            channelId,
          };
          serverIds[serverId].forEach((id) => {
            if (clients[id] && clients[id].readyState === WebSocket.OPEN) {
              clients[id].send(JSON.stringify(data));
            }
          });
        } else {
          console.warn('Failed to update text channel', channelId, 'with a new message.');
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  ws.on('close', async () => {
    delete clients[sessionId];
    // remove sessionId from userIds
    const userId = sessionId.split('-')[0];
    if (userId && userIds[userId]) {
      const index = userIds[userId].indexOf(sessionId);
      if (index >= 0) userIds[userId].splice(index, 1);
      if (userIds[userId].length <= 0) delete userIds[userId];
    }
    // remove sessionId from group servers in serverIds
    rawGroupServers = await findServersByUserId(req.user._id);
    rawGroupServers.forEach((rawGroupServer) => {
      const { _id } = rawGroupServer;
      if (serverIds[_id]) {
        const index = serverIds[_id].indexOf(sessionId);
        if (index >= 0) serverIds[_id].splice(index, 1);
        if (serverIds[_id].length <= 0) delete serverIds[_id];
      }
    });
    // remove sessionId from private chat "servers" in serverIds
    rawPrivateChats = await findPrivateChatsByUserId(req.user._id);
    rawPrivateChats.forEach((rawPrivateChat) => {
      const { _id } = rawPrivateChat;
      if (serverIds[_id]) {
        const index = serverIds[_id].indexOf(sessionId);
        if (index >= 0) serverIds[_id].splice(index, 1);
        if (serverIds[_id].length <= 0) delete serverIds[_id];
      }
    });

    console.log('DISCONNECTED Current number of clients:', Object.keys(clients).length);
  });
});

const interval = setInterval(() => {
  // eslint-disable-next-line consistent-return
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log('Destroying broken connection');
      return ws.terminate();
    }
    // eslint-disable-next-line no-param-reassign
    ws.isAlive = false;
    ws.ping();
  });
}, 1000 * 60 * 15); // 15 minutes

wss.on('close', () => {
  clearInterval(interval);
});

module.exports = server;
