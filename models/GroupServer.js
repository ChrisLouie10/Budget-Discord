const mongoose = require("mongoose");

const groupServerSchema = new mongoose.Schema({
    name: String,
    chatLog: [{
      content: String,
      author: String,
      index: Number,
      timestamp: String
    }],
    owner: String,
    admins: [String],
    users: [String],
    invite: {
      code: String,
      date: String,
      expiration: Number,
      limit: Number
    }
  });

  module.exports = mongoose.model("GroupServer", groupServerSchema);