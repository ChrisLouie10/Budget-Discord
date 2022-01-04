const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const groupServerSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  }],
  textChannels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TextChannel',
    required: true,
  }],
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  invite: {
    code: String,
    date: String,
    expiration: Number,
    limit: Number,
  },
});

module.exports = mongoose.model('GroupServer', groupServerSchema);
