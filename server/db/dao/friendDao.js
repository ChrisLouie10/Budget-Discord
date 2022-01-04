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

async function sendFriendRequest(userId, friendId) {
  const query = { _id: friendId };
  const set = { $push: { friend_request: userId } };
  await User.updateOne(query, set);
}

async function deleteFriend(userId, friendId) {
  const queryUser = { _id: userId };
  const setUser = { $pull: { friends: friendId } };

  const queryFriend = { _id: friendId };
  const setFriend = { $pull: { friends: userId } };

  return Promise.all([User.updateOne(queryUser, setUser), User.updateOne(queryFriend, setFriend)]);
}

module.exports = {
  addFriend,
  sendFriendRequest,
  deleteFriend,
};
