const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const textChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  chat_log: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatLog',
    required: true,
  },
});

module.exports = mongoose.model('TextChannel', textChannelSchema);
