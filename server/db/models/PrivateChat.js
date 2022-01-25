const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const privateChatSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  }],
  chat_log: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatLog',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PrivateChat', privateChatSchema);
