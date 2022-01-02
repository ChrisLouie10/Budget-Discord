// package imports
const express = require('express');
const cors = require('cors');
const logger = require('morgan');

// Import Routes
const authRoute = require('../routes/auth');
const friendsRoute = require('../routes/friends');
const groupServerRoute = require('../routes/groupServer');
const routerRoute = require('../routes/router');

const app = express();

// Use middlewares
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// Use routes
app.use(routerRoute);
app.use('/api/user', authRoute);
app.use('/api/friends', friendsRoute);
app.use('/api/groupServer', groupServerRoute);

module.exports = app;
