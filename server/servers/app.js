const express = require('express');
const cors = require('cors');
const app = express();
const clienturi = process.env.clienturi || 'http://localhost:5000';
// Mongodb
const mongoose = require('mongoose');
const mongodburi = process.env.mongodburi || 'mongodb://localhost/budget-discord';
//const mongodburi = 'mongodb://localhost/budget-discord';

mongoose.connect(mongodburi, {
  useUnifiedTopology: true,  
  useNewUrlParser: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));

// Import Routes
const authRoute = require('../routes/auth');
const friendsRoute = require('../routes/friends');
const groupServerRoute = require('../routes/groupServer.js');
const routerRoute = require('../routes/router.js');

// Use cors to allow cross origin resource sharing
app.use(cors());
app.use(express.json());

// Route Middlewares
app.use(routerRoute);
app.use('/api/user', authRoute);
app.use('/api/friends', friendsRoute);
app.use('/api/groupServer', groupServerRoute);

app.use(express.urlencoded({ extended: false }));

module.exports = app;
