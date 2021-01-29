const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

let friendsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  friends: [String],
  friend_request: [String]
});

module.exports = mongoose.model("Friends", friendsSchema);