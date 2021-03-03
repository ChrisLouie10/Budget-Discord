require('dotenv').config();
const server = require('./servers/websocket');
const app = require('./servers/app');
const wssPort = process.env.wssPort || 1000;
const serverPort = process.env.PORT || 3000;

server.listen(wssPort, () => console.log("WebSocket server listening on port " + wssPort));
app.listen(serverPort, () => console.log('Server listening on port ' + serverPort));