function userToObject(userData) {
  const user = {};
  user._id = userData._id;
  user.name = userData.name;
  user.email = userData.email;
  user.friends = userData.friends;
  user.friend_requests = userData.friend_requests;
  user.number_id = userData.number_id;
  return user;
}

module.exports = {
  userToObject,
};
