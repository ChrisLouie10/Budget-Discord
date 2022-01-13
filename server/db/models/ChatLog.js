const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const chatLogSchema = new mongoose.Schema({
  chat_log: [{
    content: String,
    author: String,
    index: Number,
    timestamp: Date,
  }],
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
