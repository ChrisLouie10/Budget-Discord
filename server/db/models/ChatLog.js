const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const chatLogSchema = new mongoose.Schema({
  chat_log: [{
    type: mongoose.Schema.Types.ObjectId,
    reference: 'Message',
  }],
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
