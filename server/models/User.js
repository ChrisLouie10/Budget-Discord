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
  friend_request: [String]
});

module.exports = mongoose.model("User", userSchema);