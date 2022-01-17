const router = require('express').Router();
const { verify } = require('../lib/utils/tokenUtils');
const {
  addFriend,
  sendFriendRequest,
  deleteFriend,
} = require('../db/dao/friendDao');
const {
  findUserById,
  findUsersByIds,
  findUserByNameAndNumber,
  findUsersByName,
} = require('../db/dao/userDao');
const {
  findFriendValidation,
  friendIdValidation,
} = require('../lib/validation/friendValidation');

router.post('/find', verify, async (req, res) => {
  const { error } = findFriendValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Find all users of a specific name
  let users = await findUsersByName(req.body.friendName);

  // Store specific friend if number id is passed

  if (req.body.friendNumber != '') {
    let numberId;
    try {
      numberId = !Number.isNaN(req.body.friendNumber) ? parseInt(req.body.friendNumber, 10) : -1;
    } catch {
      return res.status(404).json({ success: false, message: 'Invalid number' });
    }
    if (numberId < 0 || numberId > 999) return res.status(404).json({ success: false, message: 'Invalid number' });
    const specifiedFriend = await findUserByNameAndNumber(req.body.friendName, numberId);

    // Move specified friend to the front of the array
    if (specifiedFriend) {
      users = users
        .filter((friend) => JSON.stringify(friend._id) !== JSON.stringify(specifiedFriend._id));
      users.unshift(specifiedFriend);
    }
  }

  // Remove users that are either the requester or already friends with the requester
  users = users
    .filter((user) => JSON.stringify(user._id)
      !== JSON.stringify(req.user._id)
      && !req.user.friends.includes(user._id))
    .map((friend) => ({
      name: friend.name,
      id: friend._id,
      numberID: friend.number_id,
    }));

  if (users.length == 0) return res.status(404).json({ success: false, message: 'No friends found with that name' });
  return res.status(200).json({
    success: true,
    message: 'Success',
    friendResult: users,
  });
});

router.post('/send', verify, async (req, res) => {
  const { error } = friendIdValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check if friend exists
  const friend = await findUserById(req.body.friendID);
  if (!friend) return res.status(404).json({ success: false, message: 'User does not exist' });

  // Check if users are already friends
  if (friend.friends.includes(req.user._id) || req.user.friends.includes(req.body.friendID)) return res.status(400).json({ success: false, message: 'Already Friends' });

  // Check if friend has the user in their friend requests
  if (friend.friend_request.includes(req.user._id)) return res.status(400).json({ success: false, message: 'Friend request already sent' });

  // Check if friend has already sent friend request, add friend and return success
  if (req.user.friend_request.includes(req.body.friendID)) {
    try {
      addFriend(req.user._id, req.body.friendID);

      return res.status(200).json({ success: true, message: 'Success' });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to accept Friend Request' });
    }
  }

  // Add friend request to other user
  return sendFriendRequest(req.user._id, req.body.friendID)
    .then(() => res.status(200).json({ success: true, message: 'Friend Request Sent' }))
    .catch(() => res.status(500).json({ success: false, message: 'Failed to send friend request' }));
});

router.post('/accept', verify, async (req, res) => {
  const { error } = friendIdValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check if friend exists
  const friend = await findUserById(req.body.friendID);
  if (!friend) return res.status(404).json({ success: false, message: 'User does not exist' });

  // Check if users are already friends
  if (req.user.friends.includes(req.body.friendID) && friend.friends.includes(req.user._id)) { return res.status(400).json({ success: false, message: 'Already friends' }); }

  // Add the other user to both friend list
  try {
    addFriend(req.user._id, req.body.friendID);

    return res.status(200).json({ success: true, message: 'Success' });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to accept Friend Request' });
  }
});

router.get('/requests', verify, async (req, res) => {
  const friendRequest = req.user.friend_request;
  if (friendRequest.length == 0) return res.status(200).json({ success: true, message: 'Success' });
  let users = await findUsersByIds(friendRequest);
  users = users.map((userData) => ({
    id: userData._id,
    name: userData.name,
    numberID: userData.number_id,
  }));

  return res.status(200).json({
    success: true,
    message: 'Success',
    friendRequests: users,
  });
});

router.get('/', verify, async (req, res) => {
  const userFriends = req.user.friends;
  let friends = await findUsersByIds(userFriends);
  friends = friends.map((userData) => ({
    id: userData._id,
    name: userData.name,
    numberID: userData.number_id,
  }));

  return res.status(200).json({ success: true, message: 'Success', friends });
});

router.delete('/', verify, async (req, res) => {
  console.log(req.query.friendId);
  const friend = await findUserById(req.query.friendId);
  if (!friend) return res.status(400).json({ success: false, message: 'Friend cannot be found' });

  return deleteFriend(req.user._id, req.query.friendId)
    .then(() => res.status(200).json({ success: true, message: 'Success' }))
    .catch(() => res.status(500).json({ success: false, message: 'Failed to remove friend' }));
});

module.exports = router;
