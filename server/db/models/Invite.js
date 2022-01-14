const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const inviteSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  expiration: {
    type: Number,
    default: -1,
  },
  limit: Number,
});

module.exports = mongoose.model('Invite', inviteSchema);
