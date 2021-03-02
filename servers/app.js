const express = require('express');
const cors = require('cors');

const app = express();

// Mongodb
const mongoose = require('mongoose');

mongoose.connect(process.env.mongodburi, {
  useUnifiedTopology: true,  
  useNewUrlParser: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));

//Import Routes
const authRoute = require('../routes/auth');
const friendsRoute = require('../routes/friends');
const groupServerRoute = require('../routes/groupServer.js');

//Use cors to allow cross origin resource sharing
app.use(
  cors({
    origin: process.env.clienturi,
    credentials: true,
  })
);
app.use(express.json());

//Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/friends', friendsRoute);
app.use('/api/groupServer', groupServerRoute);

app.use(express.urlencoded({ extended: false }));

module.exports = app;
