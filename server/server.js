require('dotenv').config();

// eslint-disable-next-line no-unused-vars
const mongodb = require('./servers/mongodb');
const server = require('./servers/websocket');

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
