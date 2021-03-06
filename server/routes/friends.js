const User = require('../models/User');
const router = require('express').Router();
const verify = require ('../auth/verifyToken');

router.post('/find-users', verify, async (req, res) => {
  if(req.body.friendNumber != ""){
    const user = await User.findOne({ name: req.body.friendName, number_id: parseInt(req.body.friendNumber) });
    if(!user) return res.status(404).json({success: false, message: 'No friends found with that name'});
    else return res.status(200).json({ success: true, message: 'Success', friendResult: [{ name: user.name, id: user._id, numberID: user.number_id }] });
  }
  const users = await User.find({name: req.body.friendName});
  if(users.length == 0) return res.status(404).json({ success: false, message: 'No friends found with that name' });
  return res.status(200).json({success: true, message: 'Success', friendResult: users
      .filter((user) => JSON.stringify(user._id) !== JSON.stringify(req.user._id) && !req.user.friends.includes(user._id))
      .map((friend) => { return { name: friend.name, id: friend._id, numberID: friend.number_id }; })
  });
});

router.post('/send-friend-request', verify, async (req, res) => {
  const friend = await User.findOne({ _id: req.body.friendID });
  if(!friend) return res.status(404).json({ success: false, message: 'User does not exist'});

  if(friend.friends.includes(req.user._id) || req.user.friends.includes(req.body.friendID)) return res.status(400).json({ success: false, message: 'Already Friends' });

  if(friend.friend_request.includes(req.user._id)) return res.status(400).json({ success: false, message: 'Friend request already sent' });
  if(req.user.friend_request.includes(req.body.friendID)) {
    try{
      addFriend(req.user._id, req.body.friendID);

      return res.status(200).json({ success: true, message: 'Success' });
    }
    catch{
      return res.status(500).json({ success: false, message: 'Failed to accept Friend Request' }); 
    }
  }

  try{
    const query = { _id: req.body.friendID };
    const set = { $push: { friend_request: req.user._id} };
    await User.updateOne(query, set);

    return res.status(200).json({success: true, message: 'Friend Request Sent'});
  }
  catch{
    return res.status(500).json({success: false, message: 'Failed to send friend request'}); 
  }
});

router.post('/accept-friend-request', verify, async (req, res) => {
  const friend = await User.findOne({_id: req.body.friendID});
  if(!friend) return res.status(404).json({success: false, message: 'User does not exist'});

  if(req.user.friends.includes(req.body.friendID) && friend.friends.includes(req.user._id)) 
  return res.status(400).json({success: false, message: 'Already friends'});

  try{
    addFriend(req.user._id, req.body.friendID);

    return res.status(200).json({success: true, message: 'Success'});
  }
  catch{
    return res.status(500).json({success: false, message: 'Failed to accept Friend Request'}); 
  }
})

router.get('/get-friend-requests', verify, async (req, res) => {
  let friendRequestUsers = await Promise.all(req.user.friend_request.map(async (friendID) => {
    return await User.find({ _id: friendID });
  }));

  return res.status(200).json({success: true,  message: 'Success', friendRequests: friendRequestUsers.map((friendReq) => {
    return { id: friendReq[0]._id, name: friendReq[0].name, numberID: friendReq[0].number_id };
  })});
})

router.get('/get-friends', verify, async (req, res) => {
  let friends = await Promise.all(req.user.friends.map(async (friendID) => {
    return await User.find({ _id: friendID });
  }));
  
  return res.status(200).json({success: true,  message: 'Success', friends: friends.map((friend) => {
    return { id: friend[0]._id, name: friend[0].name, numberID: friend[0].number_id };
  })});
})

router.delete('/delete-friend', verify, async (req, res) => {
  const friend = await User.findOne({ _id: req.body.friendID });
  if(!friend) return res.status(400).json({success: false, message: 'Friend cannot be found'});

  try{
    const queryUser = { _id: req.user._id};
    const setUser = { $pull: { friends: req.body.friendID } };

    const queryFriend = { _id: req.body.friendID };
    const setFriend = { $pull: { friends: req.user._id }};

    await User.updateOne(queryUser, setUser);
    await User.updateOne(queryFriend, setFriend);

    return res.status(200).json({success: true, message: 'Success'});
  } catch{
    return res.status(500).json({success: false, message: 'Failed to remove friend'}); 
  }
})

async function addFriend(user_id, friend_id){
  const queryUser = { _id: user_id};
  const setUserPush = { $push: { friends: friend_id } };
  const setUserPull = { $pull: { friend_request: friend_id } };

  const queryFriend = { _id: friend_id };
  const setFriend = { $push: { friends: user_id }};

  await User.updateOne(queryUser, setUserPush);
  await User.updateOne(queryUser, setUserPull);
  await User.updateOne(queryFriend, setFriend);
}

module.exports = router;