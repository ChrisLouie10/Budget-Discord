const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
    min: 8, 
    max: 32
  },
  email: {
    type: String,
    required: true, 
    min: 8,
    max: 255
  },
  password: {
    type: String,
    required: true, 
    min: 8,
    max: 1024
  },
  date:{
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);