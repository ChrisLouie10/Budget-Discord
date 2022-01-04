const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const inviteSchema = new mongoose.Schema({
  group_server_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupServer',
    required: true,
    indexed: true,
  },
  code: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  expiration: {
    type: Number,
    default: -1,
  },
  limit: Number,
});

module.exports = mongoose.model('Invite', inviteSchema);
