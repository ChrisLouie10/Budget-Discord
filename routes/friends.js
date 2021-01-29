const User = require('../models/User');
const Friends = require('../models/Friends');
const router = require('express').Router();
const verify = require ('../auth/verifyToken');

router.post('/find', verify, async (req, res) => {
  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});
  console.log(user.friends)

  const friends = await User.find({name: req.body.friendName})
    if(friends.length == 0) return res.status(400).json({success: false, message: 'No friends found with that name'});
    return res.status(200).json({success: true, message: 'Success', friendResult: friends
      .filter((friend) => JSON.stringify(friend._id) !== JSON.stringify(req.user._id) && !user.friends.includes(friend._id))
      .map((friend) => { return {name: friend.name, id: friend._id}; })
    });
});

router.post('/send-friend-request', verify, async (req, res) => {
  const friend = await Friends.findOne({user_id: req.body.friendID});
  if(!friend) return res.status(400).json({success: false, message: 'User cannot be found'});

  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});

  if(friend.friends.includes(req.user._id) || user.friends.includes(req.body.friendID)) return res.status(400).json({success: false, message: 'Already Friends'});

  if(friend.friend_request.includes(req.user._id)) return res.status(400).json({success: false, message: 'Friend request already sent'});
  if(user.friend_request.includes(req.body.friendID)) {
    try{
      addFriend(req.user._id, req.body.friendID);

      return res.status(200).json({success: true, message: 'Success'});
    }
    catch{
      return res.status(400).json({success: false, message: 'Failed to accept Friend Request'}); 
    }
  }

  try{
    const query = { user_id: req.body.friendID };
    const set = { $push: { friend_request: req.user._id} };
    await Friends.updateOne(query, set);

    return res.status(200).json({success: true, message: 'Friend Request Sent'});
  }
  catch{
    return res.status(400).json({success: false, message: 'Failed to send friend request'}); 
  }
});

router.post('/accept-friend-request', verify, async (req, res) => {
  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});
  const friend = await Friends.findOne({user_id: req.body.friendID});
  if(!friend) return res.status(400).json({success: false, message: 'Friend cannot be found'});

  if(user.friends.includes(req.body.friendID) && friend.friends.includes(req.user._id)) 
  return res.status(400).json({success: false, message: 'Already friends'});

  try{
    addFriend(req.user._id, req.body.friendID);

    return res.status(200).json({success: true, message: 'Success'});
  }
  catch{
    return res.status(400).json({success: false, message: 'Failed to accept Friend Request'}); 
  }
})

router.get('/get-friend-requests', verify, async (req, res) => {

  const userFriends = await Friends.findOne({user_id: req.user._id});
  if(!userFriends) return res.status(400).json({success: false, message: 'User cannot be found'});

  let friendRequestUsers = userFriends.friend_request.map(async (friend) => {
    let data = {};
    data.id = friend;
    let user = await User.findOne({_id: friend});
    data.name = user.name;
    friendRequestUsers.push(data);
  });
  await Promise.all(friendRequestUsers);
  friendRequestUsers.shift();
  return res.status(200).json({success: true,  message: 'Success', friendRequests: friendRequestUsers});
})

router.get('/get-friends', verify, async (req, res) => {
  const userFriends = await Friends.findOne({user_id: req.user._id});
  if(!userFriends) return res.status(400).json({success: false, message: 'User cannot be found'});

  let friends = userFriends.friends.map(async (friend) => {
    let data = {};
    data.id = friend;
    let user = await User.findOne({_id: friend});
    data.name = user.name;
    friends.push(data);
  });
  await Promise.all(friends);
  friends.shift();
  return res.status(200).json({success: true,  message: 'Success', friends: friends});
})

router.delete('/delete-friend', verify, async (req, res) => {
  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});
  const friend = await Friends.findOne({user_id: req.body.friendID});
  if(!friend) return res.status(400).json({success: false, message: 'Friend cannot be found'});

  try{
    const queryUser = { user_id: req.user._id};
    const setUser = { $pull: { friends: req.body.friendID } };

    const queryFriend = { user_id: req.body.friendID };
    const setFriend = { $pull: { friends: req.user._id }};

    await Friends.updateOne(queryUser, setUser);
    await Friends.updateOne(queryFriend, setFriend);

    return res.status(200).json({success: true, message: 'Success'});
  } catch{
    return res.status(400).json({success: false, message: 'Failed to remove friend'}); 
  }
})

async function addFriend(user_id, friend_id){
  const queryUser = { user_id: user_id};
  const setUserPush = { $push: { friends: friend_id } };
  const setUserPull = { $pull: { friend_request: friend_id } };

  const queryFriend = { user_id: friend_id };
  const setFriend = { $push: { friends: user_id }};

  await Friends.updateOne(queryUser, setUserPush);
  await Friends.updateOne(queryUser, setUserPull);
  await Friends.updateOne(queryFriend, setFriend);
}

module.exports = router;