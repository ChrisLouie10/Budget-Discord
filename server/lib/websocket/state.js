// key = unique clientId
// value = websocket obj
const clients = {}; // used to identify websocket clients

// key = userId
// value = [clientIds]
const userIds = {}; // used to identify a user's list of websocket clients

// key = serverId
// value = [clientIds]
const serverIds = {}; // used to identify a server's list of websocket clients

module.exports = {
  clients, userIds, serverIds,
};
