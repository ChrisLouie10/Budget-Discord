require('dotenv').config();
const server = require('./servers/websocket');
const app = require('./servers/app');

server.listen(1000, () => console.log("WebSocket server listening on port 1000"));
app.listen(3000, () => console.log('connected'));