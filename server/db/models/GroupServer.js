const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const groupServerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
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
  text_channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TextChannel',
    required: true,
  }],
  invite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invite',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GroupServer', groupServerSchema);
