const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const textChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  chat_log: [{
    content: String,
    author: String,
    index: Number,
    timestamp: Date,
  }],
});

module.exports = mongoose.model('TextChannel', textChannelSchema);
