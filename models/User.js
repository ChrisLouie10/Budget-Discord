const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

let userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    max: 64
  },
  password: {
    type: String,
    required: true,
    max: 32,
    min: 10
  },
  date: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: true,
    max: 32
  }, 
  number_id:{
    type: Number, 
    required: true
  },
  friends: [String],
  friend_request: [String],
  group_servers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupServer',
    indexed: true
  }],
  token: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("User", userSchema);