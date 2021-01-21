const mongoose = require('mongoose');

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
    default: Date.now
  },
  name: {
    type: String,
    required: true,
    max: 32
  }, 
  servers: [
    {
      serverName: String,
      serverId: String
    }
  ],
  token: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("User", userSchema);