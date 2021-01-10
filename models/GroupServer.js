const mongoose = require("mongoose");

const groupServerSchema = new mongoose.Schema({
    serverName: String,
    serverId: String,
    chatLog: [{
      content: String,
      author: String,
      id: Number,
      timestamp: String
    }],
    users: []
  });

  module.exports = mongoose.model("GroupServer", groupServerSchema);