const mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({
  input: String,
  author: String,
  id: Number,
  timestamp: String
});

module.exports = mongoose.model("Message", messageSchema);