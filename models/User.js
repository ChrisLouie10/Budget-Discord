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
    default: Date.now,
  },
  name: {
    type: String,
    required: true,
    max: 32
  }, 
<<<<<<< HEAD
  number_id:{
    type: Number, 
    required: true
  },
  friends: [String],
  friend_request: [String],
=======
  groupServers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupServer'
  }],
>>>>>>> 24c9822446cd02ca01bf71404bbe96c7ba773feb
  token: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("User", userSchema);