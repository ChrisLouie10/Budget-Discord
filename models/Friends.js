const mongoose = require('mongoose');

let friendsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  friends: [String],
  friend_request: [String]
});

module.exports = mongoose.model("Friends", friendsSchema);