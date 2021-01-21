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
<<<<<<< HEAD
  servers: [
    {
      serverName: String,
      serverId: String
    }
  ],
=======
>>>>>>> 47177db4f7aa31e71d595d0204bef91474c8ca0e
  token: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("User", userSchema);