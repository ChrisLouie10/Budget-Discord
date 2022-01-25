// package imports
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');

// Import Routes
const authRoute = require('../routes/authRoutes');
const friendsRoute = require('../routes/friendRoutes');
const groupServerRoute = require('../routes/groupServerRoutes');
const privateChatRoute = require('../routes/privateChatRoutes');

const app = express();

// Use middlewares
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Use routes
app.use('/api/user', authRoute);
app.use('/api/friends', friendsRoute);
app.use('/api/group-servers', groupServerRoute);
app.use('/api/private-chat', privateChatRoute);

module.exports = app;
