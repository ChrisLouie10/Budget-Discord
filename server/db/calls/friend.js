const User = require('../models/User');

async function addFriend(userId, friendId) {
  const queryUser = { _id: userId };
  const setUserPush = { $push: { friends: friendId } };
  const setUserPull = { $pull: { friend_request: friendId } };

  const queryFriend = { _id: friendId };
  const setFriend = { $push: { friends: userId } };

  await User.updateOne(queryUser, setUserPush);
  await User.updateOne(queryUser, setUserPull);
  await User.updateOne(queryFriend, setFriend);
}

module.exports = { addFriend };
