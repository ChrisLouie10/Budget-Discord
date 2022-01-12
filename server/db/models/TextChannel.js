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
  group_server_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupServer',
    required: true,
    indexed: true,
  },
  chat_log: [{
    content: String,
    author: String,
    index: Number,
    timestamp: Date,
  }],
});

module.exports = mongoose.model('TextChannel', textChannelSchema);
