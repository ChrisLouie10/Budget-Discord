const mongoose = require("mongoose");

const groupServerSchema = new mongoose.Schema({
    serverName: String,
    owner: String,
    chatLog: [{
      content: String,
      author: String,
      index: Number,
      timestamp: String
    }],
    users: [],
    admins: []
  });

  module.exports = mongoose.model("GroupServer", groupServerSchema);